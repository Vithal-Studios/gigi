import cv2
import os

videos = ['public/videos/sunset.mp4', 'public/videos/sunset-ending.mp4']
for v in videos:
    if os.path.exists(v):
        cap = cv2.VideoCapture(v)
        length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = length / fps if fps > 0 else 0
        print(f"{v}: frames={length}, fps={fps:.2f}, res={w}x{h}, duration={duration:.2f}s")
        cap.release()
    else:
        print(f"Not found: {v}")
