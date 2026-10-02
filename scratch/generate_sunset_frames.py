import os
import cv2
import numpy as np
from PIL import Image

OUT_DIR = "public/sunset/frames"
SHEET_PATH = "public/sunset/spritesheet.webp"
os.makedirs(OUT_DIR, exist_ok=True)

v1_path = "public/videos/sunset.mp4"
v2_path = "public/videos/sunset-ending.mp4"

cap1 = cv2.VideoCapture(v1_path)
cap2 = cv2.VideoCapture(v2_path)

len1 = int(cap1.get(cv2.CAP_PROP_FRAME_COUNT))
len2 = int(cap2.get(cv2.CAP_PROP_FRAME_COUNT))

count1 = 70
count2 = 70

idx1 = [round(i * (len1 - 1) / (count1 - 1)) for i in range(count1)]
# Cap at frame 68 so the couple on the bench under the glowing lamp remains beautifully visible in twilight
idx2 = [round(i * 68 / (count2 - 1)) for i in range(count2)]

print(f"Extracting {count1} frames from {v1_path} and {count2} frames from {v2_path}...")

frame_num = 1
saved_paths = []

# Extract from v1 (sunset drop)
for target_idx in idx1:
    cap1.set(cv2.CAP_PROP_POS_FRAMES, target_idx)
    ret, frame = cap1.read()
    if ret:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        fname = f"f_{frame_num:03d}.webp"
        fpath = os.path.join(OUT_DIR, fname)
        img.save(fpath, "WEBP", quality=75, method=4)
        saved_paths.append(fpath)
        frame_num += 1

# Extract from v2 (twilight & couple together)
for target_idx in idx2:
    cap2.set(cv2.CAP_PROP_POS_FRAMES, target_idx)
    ret, frame = cap2.read()
    if ret:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        fname = f"f_{frame_num:03d}.webp"
        fpath = os.path.join(OUT_DIR, fname)
        img.save(fpath, "WEBP", quality=75, method=4)
        saved_paths.append(fpath)
        frame_num += 1

cap1.release()
cap2.release()

total_saved = len(saved_paths)
print(f"Saved {total_saved} frames to {OUT_DIR}")

# Build Spritesheet
cols = 10
rows = -(-total_saved // cols)
cw, ch = 384, 216

sheet = Image.new("RGB", (cols * cw, rows * ch), (12, 10, 16))

for i, p in enumerate(saved_paths):
    c = i % cols
    r = i // cols
    with Image.open(p) as thumb:
        thumb = thumb.resize((cw, ch), Image.Resampling.BILINEAR)
        sheet.paste(thumb, (c * cw, r * ch))

sheet.save(SHEET_PATH, "WEBP", quality=65)
sheet_size_kb = os.path.getsize(SHEET_PATH) / 1024
print(f"Spritesheet regenerated at {SHEET_PATH}: {cols} cols x {rows} rows ({cols*cw}x{rows*ch}), size={sheet_size_kb:.1f} KB")

# Poster
poster_path = "public/sunset/poster.webp"
Image.open(saved_paths[0]).save(poster_path, "WEBP", quality=80)
print(f"Poster regenerated at {poster_path}")
