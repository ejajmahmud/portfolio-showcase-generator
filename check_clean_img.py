from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\test_captures\ficuses_clean\desktop.png').convert('RGB')
arr = np.array(img)
print("Desktop image shape:", arr.shape)
# Count non-white pixels
non_white = np.sum(np.any(arr < 250, axis=2))
print("Non-white pixels:", non_white, f"({non_white / (arr.shape[0]*arr.shape[1])*100:.1f}%)")

# Check color palette: Green pixels (ficus green)
green_mask = (arr[:, :, 1] > 100) & (arr[:, :, 0] < arr[:, :, 1] - 20) & (arr[:, :, 2] < arr[:, :, 1] - 20)
print("Green pixels found:", np.sum(green_mask))
