from PIL import Image
import numpy as np

# Load Dalwa7 tablet
tab = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\tablet_dalwa7.png')
w, h = tab.size
print(f"Dalwa7 tablet crop size: {w}x{h}, aspect ratio: {w/h:.3f}")

# Load Capace tablet
tab0 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\tablet_capace.png')
w0, h0 = tab0.size
print(f"Capace tablet crop size: {w0}x{h0}, aspect ratio: {w0/h0:.3f}")

# Load phone crops
p1 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\phone_dalwa7.png')
print(f"Phone crop size: {p1.size}, aspect ratio: {p1.width/p1.height:.3f}")
