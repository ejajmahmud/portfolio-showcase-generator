from PIL import Image
import numpy as np

# In Dalwa7:
# The desktop view is behind the phone and tablet.
# Top width: x=31..188 (w=158)
# Where does desktop end vertically? Let's check between the phone and tablet!
# Gap between phone (ends ~70) and tablet (starts ~105): x=75..100
img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item1_dalwa7.png').convert('RGB')
arr = np.array(img)

# Let's inspect column 85 (in the gap between phone and tablet)
for y in range(0, 240, 10):
    p = arr[y, 85]
    print(f"y={y}: RGB={p}")
