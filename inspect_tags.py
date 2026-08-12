import sys
from mutagen.id3 import ID3, TIT2, TPE1

mp3_path = "/home/ubuntu/webdev-static-assets/fifth-dimension-originals/jersh-in-case-5th-dimension.mp3"
try:
    tags = ID3(mp3_path)
    print("Existing ID3 tags:")
    for k, v in tags.items():
        print(f"  {k}: {v}")
except Exception as e:
    print("No ID3 tags found or error loading ID3:", e)
