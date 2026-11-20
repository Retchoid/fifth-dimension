# 5D DPM Windows v0.14 — set editor

Sets now build an available, unique running order from your arc or range criteria. Drag tracks to reorder, click for Energy/key/all available ratings, preview and swap alternatives, Undo edits, and export the current order directly from Sets.

Planning cards show strict matching tracks for each stage and energy band. A Gathering energy target of 4 lists Gathering tracks at 3.5–4.5, subject to BPM and availability. Editing cards previews criteria without saving or changing the running order. Add to set saves the edited criteria and inserts the chosen track; suggestions refresh after each addition. Generate set rebuilds the whole order. Full-set generation uses soft stage fit and reports fallbacks or shortages; it never inserts unavailable placeholders. Reviewed set learning and category labels remain explicit actions.

Windows exports an ordered text file, M3U8 and ratings CSV; native .crate output is experimental and available in the Mac build only. M3U/M3U8 import depends on your Serato version. Music and tags are not modified or copied.

Build on Windows x64/Python 3.11 with Build-Windows.cmd, or use the isolated dpm-windows-beta branch workflow. The workflow runs 41 portable adapter/arc/editor/profile/source tests, builds with PyInstaller and runs frozen dependency/resource and real synthetic audio checks. The distributable is a ZIP containing 5D DPM.exe and _internal; keep the whole folder together. No separate Python install is needed on the tester's machine.

Microsoft Edge WebView2 Runtime is required. Download it from https://developer.microsoft.com/en-us/microsoft-edge/webview2/ if missing. This is an unsigned beta. MP3/WAV/AIFF/FLAC/OGG are the first codec testing targets; AAC/M4A playback is not guaranteed. Physical laptop UI, dragging and sound output require real-device checks.

Data/logs: %LOCALAPPDATA%/5D DPM . No personal audio or labels are distributed. The website main2 branch remains separate and unchanged. Font and proxy_tools notices are retained; the build collects installed dependency licenses.

See RELEASE-v0.14.md for text export, source folders, isolated DJ profiles, and updated set controls.
