from PIL import Image
import numpy as np

# Let's inspect card 1 and card 0
img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\card_1.png')
print("Image mode:", img.mode, "size:", img.size)

# Let's save a 2x scaled nearest neighbor crop of the mockup area with annotations or grid lines
# to easily understand every detail.
mockup = img.crop((10, 30, 246, 280))
mockup.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\mockup_zoom.png')

# Let's check card 0 as well
img0 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\card_0.png')
mockup0 = img0.crop((10, 30, 246, 280))
mockup0.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\mockup0_zoom.png')

print("Saved zoomed mockups")
