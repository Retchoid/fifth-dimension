# 5D DPM v0.14

Close DPM before upgrading. On Mac extract the ZIP and double-click Install.command; it installs and opens the native app. Existing profiles, training and sets are preserved.

- Planning cards now Add to set, including edited criteria; fresh unused suggestions appear after adding. More suggestions browses other matches.
- Add a track, selected tracks, or the visible filtered library to an existing or new set. Batch additions retain displayed order.
- Planning cards, selected-track details, and draggable running order share one page.
- Export a set as a text file, M3U8 playlist, CSV, or all available formats. Mac also offers experimental native Serato crates; export never installs them automatically. Set order is preserved. Music stays where it is.
- Choose one or multiple source folders in Sets. Subfolders are included. Scan each chosen folder if it has not been analyzed. Generate set applies the selection; existing manually added tracks remain until regenerated or removed.
- Settings > DJ profiles creates a fresh empty workspace, or reuses analyzed music with new training. Labels, BPM corrections, settings and sets are separate. Switch back to Original DJ to restore your previous workspace. Fresh scanning uses separate caches.

Windows: extract the entire portable ZIP, keep _internal beside 5D DPM.exe, then double-click the EXE. Windows 10/11 x64 needs Microsoft Edge WebView2. This unsigned beta may show a Windows security prompt. Files from another computer need reachable music paths or a fresh local scan.

Verification: 85 Python regression tests plus a live local-API DOM workflow covering set additions, fresh suggestions, details, drag/Undo, text export, source controls, and profile creation/switching. Native macOS/Windows window and device playback require testing on those operating systems.
