from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item1_dalwa7.png').convert('RGB')
arr = np.array(img)

# Look at column x=40 (center of phone):
col40 = arr[:, 40, :]
# In Dalwa7, the desktop extends down to some point, or phone starts at some point.
# Phone has a dark bezel/frame!
# Let's inspect the colors along x=35..45 for each y:
for y in range(40, 240, 5):
    p = arr[y, 40]
    print(f"y={y}: RGB={p}")

print("\n--- Tablet center x=150 ---")
for y in range(40, 240, 5):
    p = arr[y, 150]
    print(f"y={y}: RGB={p}")
