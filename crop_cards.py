from PIL import Image

im = Image.open(r'C:/Users/EJAJ/.gemini/antigravity/brain/6865b08c-27d3-4f0d-8d9c-60636dfd405c/.user_uploaded/media_1792561211026_dd84b70b.png')
w, h = im.size

# Let's crop each card approximately:
# 4 columns, 2 rows
# Column width approx w / 4 = 256
# Row height approx h / 2 = 381
col_w = w / 4
row_h = h / 2

for col in range(4):
    box = (int(col * col_w), 0, int((col + 1) * col_w), int(row_h))
    card = im.crop(box)
    card.save(rf'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\card_{col}.png')

print("Cropped cards 0-3 saved.")
