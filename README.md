# 5D DPM Windows v0.12 beta

The Windows executable was built successfully on GitHub Actions. Download the portable ZIP from https://github.com/Retchoid/fifth-dimension/actions/runs/44628708408/artifacts/14580986513 . The artifact wraps the distributable ZIP; extract the entire distributable and run 5D DPM.exe with its _internal folder beside it. Python is bundled.

Windows 10/11 x64, Microsoft Edge WebView2 Runtime and an output audio device are required. This is an unsigned beta. Use the official WebView2 installer if needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/ .

The Windows runner passed all 16 adapter/ranking tests, launched the frozen executable, checked its bundled imports/resources and freshly decoded a generated 174 BPM WAV with a result within 1 BPM. These checks do not verify audible output or native UI on a physical laptop.

Features retained: six set arcs, editable targets/weights, reviewed set learning, all 576 Camelot pairs, stage numbers, forced BPM rechecks, seekable playback, persistent settings and category training. Windows playback streams through soundfile/PortAudio. MP3/WAV/AIFF/FLAC/OGG are the first testing targets; AAC/M4A codecs are not guaranteed. Direct Serato indexing/install actions are hidden; Windows exports playlists/CSV rather than experimental crates. Music files/tags are read-only.

Data and logs: %LOCALAPPDATA%/5D DPM . Your friend starts with their own library and training data. The build includes no personal audio or labels.

Reproduce on Windows with Python 3.11 x64: run Build-Windows.cmd. Or push build changes to the isolated dpm-windows-beta branch to run .github/workflows/build-windows.yml. The build creates an onedir PyInstaller distribution, runs frozen checks and uploads the ZIP. Keep the whole distribution folder together.

The user approved publishing this source on dpm-windows-beta. The website main2 branch was verified unchanged. Build source: 8e06f34a220d207131f55347fbd820ae1d6f0aed. Successful run: 44628708408.

The font and bundled proxy_tools wheel retain their license notices. The build copies available dependency license notices into LICENSES. Build documentation: https://pyinstaller.org/en/stable/operating-mode.html .
