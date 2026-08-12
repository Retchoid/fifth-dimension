# Selector Showdown audio diagnostics

The original soundtrack path `/manus-storage/5d-jungle-genesis-track_5b23d949.mp3` returned a CloudFront 403 and was unusable. The preserved local file `/home/ubuntu/webdev-static-assets/5d-jungle-genesis-track.mp3` was verified as MPEG Layer III, 192 kbps, 44.1 kHz stereo, approximately 149.5 seconds, and re-uploaded to `/manus-storage/5d-jungle-genesis-track_ff9d149a.mp3`.

A ranged GET against the new project preview URL returned `206 Partial Content` with `content-type: audio/mpeg` and valid MP3 bytes. In the live preview, the audio element reports duration `149.498708`, `readyState: 4`, and no media error. A direct playback probe resolved successfully and reported `paused: false`, confirming the new asset is playable. The game-over pause correctly pauses the soundtrack. The HUD music control is now explicitly pointer-interactive and can retry playback when the browser blocks the initial user-gesture start.

The live named-score flow was also validated: entering `JUNGLE BOB` and saving produced `SCORE SAVED AS JUNGLE BOB` and persisted the entry in the local leaderboard.

The controlled browser reload cleared the download unlock state and exposed the clean start overlay. The HUD music button is now listed as an interactive control with the mute hint, and the start overlay remains present. The previous live run validated score naming and persistence; gameplay ended naturally after missed records, which correctly paused the audio element.

A deterministic browser test set `Math.random` to `0.5` so all spawned objects were catchable records. After five catches, the live page showed `RECORDS: 5/5`, the unlocked MP3 download, and the `DOWNLOAD UNLOCKED / LEVEL CLEARED` overlay with both `RESET GAME` and `KEEP PLAYING` buttons. During the active deterministic session the HUD changed to `MUSIC ON`, confirming the re-uploaded jungle track starts from the user gesture and remains part of gameplay until the unlock pause.

Selecting `KEEP PLAYING` from the unlock overlay resumed the live session without resetting the score. The browser showed the overlay gone, `RECORDS: 7/5`, `SCORE: 2500`, and `MUSIC ON`, confirming the continuation path preserves the cleared level and soundtrack.
