from pathlib import Path
from PIL import Image

SOURCE_DIR = Path('/home/ubuntu/screenshots')
OUTPUT_DIR = Path('/home/ubuntu/level1_png_exports')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

captures = {
    0: '3000-ii2ajrebt3duqjw_2026-08-19_03-15-28_2425.webp',
    5: '3000-ii2ajrebt3duqjw_2026-08-19_03-18-32_3180.webp',
    10: '3000-ii2ajrebt3duqjw_2026-08-19_03-14-48_9264.webp',
    15: '3000-ii2ajrebt3duqjw_2026-08-19_03-16-07_7201.webp',
    20: '3000-ii2ajrebt3duqjw_2026-08-19_03-19-19_2318.webp',
    25: '3000-ii2ajrebt3duqjw_2026-08-19_03-20-34_8913.webp',
}

for records, filename in captures.items():
    source = SOURCE_DIR / filename
    if not source.exists():
        raise FileNotFoundError(source)
    output = OUTPUT_DIR / f'level1_verification_{records:02d}_records.png'
    with Image.open(source) as image:
        image.convert('RGBA').save(output, format='PNG')
    print(f'{records}: {output} ({output.stat().st_size} bytes)')
