import os
from mutagen.id3 import ID3, TIT2, TPE1, ID3NoHeaderError

mp3_path = "/home/ubuntu/webdev-static-assets/fifth-dimension-originals/jersh-in-case-5th-dimension.mp3"

try:
    audio = ID3(mp3_path)
except ID3NoHeaderError:
    print("No ID3 header found, creating new ID3 tag container.")
    audio = ID3()

audio["TIT2"] = TIT2(encoding=3, text="Jersh In Case")
audio["TPE1"] = TPE1(encoding=3, text="5th Dimension, Skavo featuring MC Mestup")

audio.save(mp3_path)
print("Successfully updated ID3 tags for:", mp3_path)

# Verify tags
verify_audio = ID3(mp3_path)
print("Verification tags:")
for k, v in verify_audio.items():
    print(f"  {k}: {v}")
