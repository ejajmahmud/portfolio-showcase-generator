from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\assets\frames\iphone-17-pro-max-deep-blue.png')
arr = np.array(im)
print("Alpha channel shape:", arr.shape)

# Check center of screen (e.g. x=736, y=1501)
print("Alpha at center (736, 1501):", arr[1501, 736, 3])
print("Alpha at screen corner (76, 67):", arr[67, 76, 3])
print("Alpha at frame edge (10, 10):", arr[10, 10, 3])
print("Alpha at frame body (30, 1500):", arr[1500, 30, :])

# Check dynamic island area around (736, 110)
print("Alpha at top center (736, 110):", arr[110, 736, :])
