from PIL import Image
import numpy as np

# Let's inspect card 0
img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\card_0.png').convert('RGB')
arr = np.array(img)

# Let's print out the exact colors along some horizontal and vertical lines
# Desktop top edge: let's see where the non-white background starts from the top
for y in range(30, 80):
    row = arr[y, :, :]
    non_white = np.where(np.any(row < 240, axis=1))[0]
    if len(non_white) > 50:
        print(f"Desktop starts around y={y}: x from {non_white[0]} to {non_white[-1]} (width {non_white[-1]-non_white[0]+1})")
        break

# Let's see what the desktop screenshot looks like at y=60
print("At y=60, x bounds:")
non_white = np.where(np.any(arr[60, :, :] < 240, axis=1))[0]
print(f"x_min={non_white[0]}, x_max={non_white[-1]}, width={non_white[-1]-non_white[0]+1}")

# Let's see where the phone is located (bottom left):
# At y=200:
row200 = arr[200, :, :]
nw200 = np.where(np.any(row200 < 240, axis=1))[0]
print("At y=200, non-white columns:", nw200[0], "to", nw200[-1])
# Split into phone (left) and tablet (right)
# Check for white gap between phone and tablet
is_nw = np.any(row200 < 240, axis=1)
phone_cols = [x for x in range(len(is_nw)) if is_nw[x] and x < 120]
tablet_cols = [x for x in range(len(is_nw)) if is_nw[x] and x >= 120]
if phone_cols:
    print(f"Phone at y=200: x={phone_cols[0]}..{phone_cols[-1]} (w={phone_cols[-1]-phone_cols[0]+1})")
if tablet_cols:
    print(f"Tablet at y=200: x={tablet_cols[0]}..{tablet_cols[-1]} (w={tablet_cols[-1]-tablet_cols[0]+1})")

# Let's find bottom of phone and tablet
for y in range(200, 300):
    row = arr[y, :, :]
    p_nw = [x for x in range(len(row)) if np.any(row[x] < 240) and x < 120]
    t_nw = [x for x in range(len(row)) if np.any(row[x] < 240) and x >= 120]
    if not p_nw and not t_nw:
        print(f"Devices end before y={y}")
        break
