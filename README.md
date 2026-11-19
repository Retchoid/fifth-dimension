# 5D DPM Windows v0.12 beta — build kit

**This ZIP contains the prepared Windows port and build instructions, not a compiled `.exe`.** The executable must be built on a Windows x64 machine or Windows GitHub Actions runner. No Windows binary has been executed in this Linux workspace.

The Windows port retains the v0.11 interface, training, forced BPM rechecks, settings, stage numbers, all 576 Camelot pairs, six set-arc presets and reviewed set learning. Changes include Edge/WebView2 native window startup, Windows-native file pickers, Windows file locking, a frozen scan-worker dispatch, a Windows ICO, and seekable soundfile/PortAudio playback. The Mac build is separate and unchanged.

## Build locally on Windows

Use Python **3.11 x64** on the build computer. Extract this kit and run **Build-Windows.cmd**. It creates a private virtual environment, installs wheel-based build dependencies, builds with PyInstaller and checks imports/resources by executing the frozen binary. It writes **5D-DPM-Windows-v0.12-beta.zip**. Share that generated ZIP, not this source kit, with the tester.

The tester extracts the entire generated ZIP and opens **5D DPM.exe**. Python is bundled; the tester does not need to install Python. `_internal` must remain beside the executable. This is a portable folder distribution, not an MSI installer or a single-file executable.

## Build with GitHub Actions

The included **.github/workflows/build-windows.yml** triggers only on pushes to **dpm-windows-beta**, or by manual dispatch and targets **windows-2022 / Python 3.11 x64**. Place this kit's contents at the repository root of a dedicated build branch/repository. Pushing the prepared files to **dpm-windows-beta** starts the build. It installs dependencies, runs the Windows adapter/ranking tests, builds the executable, runs frozen import/resource checks and uploads the distributable ZIP as an artifact. The workflow has read-only repository permissions, does not publish a GitHub Release and does not deploy the website.

The push trigger is restricted to the exact **dpm-windows-beta** branch so the build does not require adding a workflow to the website default branch. The build files can occupy only that isolated branch; the website branch remains unchanged. Nothing runs until the files are pushed to GitHub.

The only connected repository observed during preparation is the public **Retchoid/fifth-dimension** website repository. Nothing from this kit was pushed there. Uploading this source to it would make the DPM source public and requires the owner's decision. A separate private repository is another option.

## Tester requirements and limits

- Windows 10/11 **x64**. ARM-native and 32-bit builds are not included.
- Microsoft **Edge WebView2 Runtime** is required for the native window. If absent, use Microsoft's official download: https://developer.microsoft.com/en-us/microsoft-edge/webview2/ . No external browser is used for the app interface.
- The beta is unsigned. Windows may show an unrecognized-publisher warning; no code-signing certificate is included.
- First tests should use a small folder of **MP3, WAV, AIFF, FLAC or OGG** tracks. AAC/M4A playback/analysis are not guaranteed by the bundled libsndfile codec path; this beta does not include FFmpeg.
- Soundcard output, Windows seek responsiveness, real file dialogs, frozen scan subprocesses and UI rendering need actual Windows validation. Audio samples are streamed in bounded buffers, not loaded fully into RAM.
- Data/logs are stored under `%LOCALAPPDATA%\5D DPM`. Music files and tags are read-only. The tester starts with their own library; this kit contains no personal labels or tracks.
- Experimental Serato indexing and direct crate installation are hidden in the Windows UI. Preview export on Windows produces playlists/CSV, not `.crate` files. Ordered M3U/CSV import in Sets remains available.

## Checks completed here

16 portable tests pass covering Windows playback adapter selection, buffer output, seek/pause/EOF behavior, cleanup, file-picker cancellation, locking, frozen-worker dispatch, Edge window selection, arc presets/target ranking and harmonic rules. Playback/device and native UI calls are injected fakes; they do not establish Windows hardware correctness.

All requested direct dependencies resolved to Windows x64/Python 3.11 wheels in a cross-platform download check. That checks package availability, not execution or the final frozen binary. The Windows build workflow adds the real frozen import/resource check. The code must still pass that runner before any `.exe` is described as available.

Primary build references: https://pyinstaller.org/en/stable/operating-mode.html and https://pywebview.flowrl.com/guide/installation.html . Dependency versions are pinned directly; transitive packages are resolved by pip. Bundled font and proxy_tools license notices are retained; the build copies available installed dependency license notices into the distribution.
