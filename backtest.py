"""Evaluate frozen DPM priors and train-only personalization on labeled audio."""
import argparse
import csv
import json
from pathlib import Path

from dpm import MIN_DURATION, STAGES, analyze, duration_seconds, file_digest
from learning import features, recommend

MAX_TRACKS = 200


def load_manifest(path):
    with path.open(newline='', encoding='utf-8-sig') as handle:
        reader = csv.DictReader(handle)
        if not {'path', 'stage', 'split', 'group'} <= set(reader.fieldnames or []):
            raise ValueError('Manifest needs path,stage,split,group columns.')
        rows = []
        groups = {}
        digests = set()
        for line, row in enumerate(reader, 2):
            if len(rows) >= MAX_TRACKS:
                raise ValueError(f'Manifest exceeds {MAX_TRACKS} tracks.')
            audio, stage, split, group = ((row[key] or '').strip() for key in
                                          ('path', 'stage', 'split', 'group'))
            group = group.casefold()
            if not audio or stage not in STAGES or split not in {'train', 'test'} or not group:
                raise ValueError(f'Invalid path, stage, split or group on line {line}.')
            if groups.setdefault(group, split) != split:
                raise ValueError(f'Recording group spans splits on line {line}: {group}')
            audio = (path.parent / Path(audio).expanduser()).resolve(strict=True)
            if not audio.is_file():
                raise ValueError(f'Expected a file on line {line}: {audio}')
            digest = file_digest(audio)
            if digest in digests:
                raise ValueError(f'Duplicate audio content on line {line}: {audio}')
            digests.add(digest)
            rows.append((audio, stage, split, digest))
    if {row[2] for row in rows} != {'train', 'test'}:
        raise ValueError('Include both train and test rows.')
    return rows


def metrics(expected, ranked):
    confusion = {stage: dict.fromkeys(STAGES, 0) for stage in STAGES}
    for true, ranking in zip(expected, ranked):
        confusion[true][ranking[0]] += 1
    f1 = {}
    for stage in STAGES:
        true_positive = confusion[stage][stage]
        support = sum(confusion[stage].values())
        predicted = sum(row[stage] for row in confusion.values())
        if support:
            f1[stage] = 2 * true_positive / (support + predicted)
    return {
        'top1_accuracy': sum(confusion[stage][stage] for stage in STAGES) / len(expected),
        'top2_accuracy': sum(true in rank[:2] for true, rank in zip(expected, ranked)) / len(expected),
        'macro_f1_test_supported': sum(f1.values()) / len(f1),
        'test_support': {stage: sum(row.values()) for stage, row in confusion.items()},
        'confusion_actual_by_predicted': confusion,
    }


def evaluate(train, test):
    labels = {digest: {'stage': stage, 'features': features(track), 'score_version':track.get('score_version','legacy')}
              for digest, stage, track in train}
    expected = [stage for _, stage, _ in test]
    tracks = [track for _, _, track in test]
    return {
        'train_tracks': len(train),
        'test_tracks': len(test),
        'core': metrics(expected, [[track['suggested_stage'], track['alternate_stage']]
                                   for track in tracks]),
        'personalized': metrics(expected, [recommend(track, labels) for track in tracks]),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    args = parser.parse_args()
    splits = {'train': [], 'test': []}
    try:
        rows = load_manifest(args.manifest)
        for audio, stage, split, digest in rows:
            if duration_seconds(audio) < MIN_DURATION:
                raise ValueError(f'Audio under {MIN_DURATION:g} seconds: {audio}')
            track = analyze(audio)
            splits[split].append((digest, stage, track))
    except Exception as exc:
        parser.exit(1, f'Backtest failed: {exc}\n')
    from audio_v2 import apply_library_scores
    training_reference=[track for _,_,track in splits['train']]
    scoring=apply_library_scores([track for rows in splits.values() for _,_,track in rows],reference_tracks=training_reference)
    report = evaluate(splits['train'], splits['test'])
    report['reference_scoring']=scoring
    report['evaluation'] = 'audio from explicit labeled manifest'
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
