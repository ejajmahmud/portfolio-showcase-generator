from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item0_capace.png').convert('RGB')
arr = np.array(img)

# Look at top-left corner of desktop: around x=30, y=5
# Print 10x10 patch around (30, 5)
print("Top-left corner patch of desktop in Capace:")
for y in range(0, 15):
    row_str = " ".join([f"{arr[y, x, 0]:3d}" for x in range(25, 40)])
    print(f"y={y:2d}: {row_str}")

# Look at top-right corner of desktop: around x=187, y=5
print("\nTop-right corner patch of desktop in Capace:")
for y in range(0, 15):
    row_str = " ".join([f"{arr[y, x, 0]:3d}" for x in range(180, 195)])
    print(f"y={y:2d}: {row_str}")
