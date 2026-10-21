from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\mockup_area_1.png').convert('RGB')
arr = np.array(img)

# Find non-white pixels
# White threshold > 250
mask = np.any(arr < 245, axis=2)
rows = np.any(mask, axis=1)
cols = np.any(mask, axis=0)

rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

print(f"Non-white bounding box: x={cmin}..{cmax} (w={cmax-cmin+1}), y={rmin}..{rmax} (h={rmax-rmin+1})")

# Let's inspect the vertical slices:
# Left slice (mobile): cmin to cmin + 60
# Middle slice (desktop top):
# Right slice (tablet): cmax - 100 to cmax

# Let's scan where the mobile phone starts and ends:
# Mobile is roughly on the left side
# Let's check non-white bbox in left half:
left_half_mask = mask[:, :int(arr.shape[1]*0.45)]
left_rows = np.any(left_half_mask, axis=1)
left_cols = np.any(left_half_mask, axis=0)
if np.any(left_rows) and np.any(left_cols):
    l_rmin, l_rmax = np.where(left_rows)[0][[0, -1]]
    l_cmin, l_cmax = np.where(left_cols)[0][[0, -1]]
    print(f"Left device (Phone): x={l_cmin}..{l_cmax} (w={l_cmax-l_cmin+1}), y={l_rmin}..{l_rmax} (h={l_rmax-l_rmin+1})")

# Right half mask:
right_half_mask = mask[:, int(arr.shape[1]*0.45):]
right_rows = np.any(right_half_mask, axis=1)
right_cols = np.any(right_half_mask, axis=0)
if np.any(right_rows) and np.any(right_cols):
    r_rmin, r_rmax = np.where(right_rows)[0][[0, -1]]
    r_cmin, r_cmax = np.where(right_cols)[0][[0, -1]] + int(arr.shape[1]*0.45)
    print(f"Right device (Tablet): x={r_cmin}..{r_cmax} (w={r_cmax-r_cmin+1}), y={r_rmin}..{r_rmax} (h={r_rmax-r_rmin+1})")

# Top area (Desktop view behind):
# Look at top 30% across the whole width
top_mask = mask[:int(arr.shape[0]*0.5), :]
top_rows = np.any(top_mask, axis=1)
top_cols = np.any(top_mask, axis=0)
if np.any(top_rows) and np.any(top_cols):
    t_rmin, t_rmax = np.where(top_rows)[0][[0, -1]]
    t_cmin, t_cmax = np.where(top_cols)[0][[0, -1]]
    print(f"Top element (Desktop): x={t_cmin}..{t_cmax} (w={t_cmax-t_cmin+1}), y={t_rmin}..{t_rmax} (h={t_rmax-t_rmin+1})")
