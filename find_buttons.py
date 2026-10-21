from PIL import Image
import numpy as np

img = Image.open(r'C:/Users/EJAJ/.gemini/antigravity/brain/6865b08c-27d3-4f0d-8d9c-60636dfd405c/.user_uploaded/media_1792561211026_dd84b70b.png').convert('RGB')
arr = np.array(img)

# Look at y=500 (where buttons "View Website" are):
# The buttons are orange (e.g., high R, medium G, low B)
# Let's find all orange pixels at y around 380 or 400
orange_mask = (arr[:, :, 0] > 200) & (arr[:, :, 1] > 60) & (arr[:, :, 1] < 120) & (arr[:, :, 2] < 50)
print("Orange mask count:", np.sum(orange_mask))

# Find row and col bounds of orange buttons
orange_rows, orange_cols = np.where(orange_mask)
print(f"Orange button Y: {orange_rows.min()}..{orange_rows.max()}")

# Find the distinct horizontal clusters of orange buttons:
cols_present = np.unique(orange_cols)
# Group into clusters
clusters = []
cur = [cols_present[0]]
for c in cols_present[1:]:
    if c - cur[-1] > 10:
        clusters.append((cur[0], cur[-1], (cur[0]+cur[-1])//2))
        cur = [c]
    else:
        cur.append(c)
clusters.append((cur[0], cur[-1], (cur[0]+cur[-1])//2))

print("Button horizontal clusters (start, end, center):")
for cl in clusters:
    print(cl)
