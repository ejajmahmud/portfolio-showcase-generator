from PIL import Image

img = Image.open(r'C:/Users/EJAJ/.gemini/antigravity/brain/6865b08c-27d3-4f0d-8d9c-60636dfd405c/.user_uploaded/media_1792561211026_dd84b70b.png')

# Item 0 (Capace): x from 80 to 305, y from 40 to 300
item0 = img.crop((85, 40, 305, 290))
item0.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item0_capace.png')

# Item 1 (Dalwa7): x from 300 to 520, y from 40 to 290
item1 = img.crop((305, 40, 520, 290))
item1.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item1_dalwa7.png')

# Item 2 (NIOSH): x from 525 to 740, y from 40 to 290
item2 = img.crop((525, 40, 740, 290))
item2.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item2_niosh.png')

# Item 3 (POLYMIX): x from 750 to 975, y from 40 to 290
item3 = img.crop((750, 40, 975, 290))
item3.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item3_polymix.png')

print("Cropped items 0, 1, 2, 3 successfully.")
