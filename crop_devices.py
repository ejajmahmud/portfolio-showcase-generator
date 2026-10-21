from PIL import Image

# In item1_dalwa7.png:
# Tablet bounds: x=105..198, y=110..230
img1 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item1_dalwa7.png')
tablet1 = img1.crop((104, 108, 199, 232))
tablet1.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\tablet_dalwa7.png')

# In item0_capace.png:
# Tablet bounds: x=100..196, y=105..230
img0 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item0_capace.png')
tablet0 = img0.crop((98, 105, 198, 232))
tablet0.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\tablet_capace.png')

# Let's also crop mobile from both
phone1 = img1.crop((14, 134, 70, 232))
phone1.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\phone_dalwa7.png')

phone0 = img0.crop((13, 134, 70, 232))
phone0.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\phone_capace.png')

print("Cropped tablet & phone samples saved.")
