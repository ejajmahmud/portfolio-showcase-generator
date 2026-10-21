import re
from PIL import Image, ImageDraw, ImageFilter

def parse_color(color_input):
    """
    Parses hex string ('#ffffff', 'transparent') or tuple/list into RGBA tuple.
    """
    if color_input is None or color_input == 'transparent':
        return (0, 0, 0, 0)
    if isinstance(color_input, (tuple, list)):
        if len(color_input) == 3:
            return (*color_input, 255)
        return tuple(color_input)
    if isinstance(color_input, str):
        c = color_input.strip().lstrip('#')
        if c.lower() == 'transparent':
            return (0, 0, 0, 0)
        if len(c) == 6:
            r = int(c[0:2], 16)
            g = int(c[2:4], 16)
            b = int(c[4:6], 16)
            return (r, g, b, 255)
        if len(c) == 8:
            r = int(c[0:2], 16)
            g = int(c[2:4], 16)
            b = int(c[4:6], 16)
            a = int(c[6:8], 16)
            return (r, g, b, a)
    return (255, 255, 255, 255)

def create_drop_shadow(image, offset=(0, 22), blur_radius=34, shadow_color=(0, 0, 0, 90)):
    """
    Generates a realistic multi-tier drop shadow underneath an RGBA image.
    Tier 1: Ambient soft blur for broad depth.
    Tier 2: Contact shadow for crisp object grounding.
    """
    w, h = image.size
    pad = blur_radius * 2 + max(abs(offset[0]), abs(offset[1])) + 40
    canvas = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    
    alpha = image.split()[-1]
    
    # Ambient shadow (soft diffuse)
    amb_mask = alpha.filter(ImageFilter.GaussianBlur(blur_radius))
    amb_shadow = Image.new('RGBA', (w, h), shadow_color)
    amb_shadow.putalpha(amb_mask)
    
    # Contact shadow (closer, sharper)
    con_blur = max(3, blur_radius // 4)
    con_mask = alpha.filter(ImageFilter.GaussianBlur(con_blur))
    con_shadow = Image.new('RGBA', (w, h), (0, 0, 0, int(shadow_color[3] * 0.95)))
    con_shadow.putalpha(con_mask)
    
    ox, oy = offset
    canvas.paste(amb_shadow, (pad + ox, pad + oy), amb_shadow)
    canvas.paste(con_shadow, (pad + ox // 2, pad + oy // 2 + 3), con_shadow)
    canvas.paste(image, (pad, pad), image)
    
    return canvas, pad

def compose_showcase(
    desktop_img,
    framed_mobile_img,
    framed_tablet_img,
    canvas_w=2000,
    canvas_h=2400,
    bg_color=(255, 255, 255, 255),
    shadow_intensity="normal"
):
    """
    Composites Desktop, Mobile (iPhone 17 Pro Max), and Tablet into the exact
    portfolio showcase layout matching the agency portfolio standard.
    """
    parsed_bg = parse_color(bg_color)
    canvas = Image.new('RGBA', (canvas_w, canvas_h), parsed_bg)
    
    # Adjust shadow opacity based on intensity setting
    shadow_alpha_base = 90
    if shadow_intensity == "subtle":
        shadow_alpha_base = 55
    elif shadow_intensity == "bold":
        shadow_alpha_base = 125
        
    # --- 1. DESKTOP CARD SETUP ---
    # Desktop card placeholder: Width 85% of canvas (1700px), Height 85% of canvas (2040px)
    # Aspect ratio: 1700 / 2040 = 0.8333 (taller than standard 16:9 100vh window)
    desk_w = int(canvas_w * 0.85) # 1700 px
    desk_h = int(canvas_h * 0.85) # 2040 px
    target_desk_ratio = desk_w / desk_h # ~0.8333
    
    # Proportional scaling without stretching or distortion:
    src_ratio = desktop_img.width / desktop_img.height
    if abs(src_ratio - target_desk_ratio) < 0.01:
        # Exact match (from 1440x1728 scrolled capture) -> zero crop, zero stretch!
        desk_crop = desktop_img
    elif src_ratio > target_desk_ratio:
        # Image is wider -> crop sides evenly
        new_w = int(desktop_img.height * target_desk_ratio)
        offset_x = (desktop_img.width - new_w) // 2
        desk_crop = desktop_img.crop((offset_x, 0, offset_x + new_w, desktop_img.height))
    else:
        # Image is taller -> take from top down to match target aspect ratio
        new_h = int(desktop_img.width / target_desk_ratio)
        desk_crop = desktop_img.crop((0, 0, desktop_img.width, min(desktop_img.height, new_h)))
        
    desk_resized = desk_crop.resize((desk_w, desk_h), Image.Resampling.LANCZOS)
    
    # Desktop rounded corners & hairline border
    desk_radius = 24
    desk_mask = Image.new('L', (desk_w, desk_h), 0)
    ImageDraw.Draw(desk_mask).rounded_rectangle([(0, 0), (desk_w, desk_h)], radius=desk_radius, fill=255)
    
    desk_ready = Image.new('RGBA', (desk_w, desk_h), (0, 0, 0, 0))
    desk_ready.paste(desk_resized, (0, 0), desk_mask)
    ImageDraw.Draw(desk_ready).rounded_rectangle(
        [(0, 0), (desk_w - 1, desk_h - 1)],
        radius=desk_radius,
        outline=(218, 222, 230, 220),
        width=1
    )
    
    desk_x = int(canvas_w * 0.10)
    desk_y = int(canvas_h * 0.02)
    
    desk_shadow_color = (0, 0, 0, int(shadow_alpha_base * 0.6))
    desk_shadow, d_pad = create_drop_shadow(
        desk_ready,
        offset=(0, 20),
        blur_radius=36,
        shadow_color=desk_shadow_color
    )
    canvas.alpha_composite(desk_shadow, (desk_x - d_pad, desk_y - d_pad))
    
    # --- 2. BOTTOM BASELINE FOR FOREGROUND DEVICES ---
    baseline_y = int(canvas_h * 0.97)
    
    # --- 3. TABLET (RIGHT SIDE) ---
    tab_h = int(canvas_h * 0.52) # 1248 px
    tab_w = int(framed_tablet_img.width * (tab_h / framed_tablet_img.height)) # ~951 px
    tab_resized = framed_tablet_img.resize((tab_w, tab_h), Image.Resampling.LANCZOS)
    
    tab_x = int(canvas_w * 0.98) - tab_w
    tab_y = baseline_y - tab_h
    
    tab_shadow_color = (0, 0, 0, int(shadow_alpha_base * 1.05))
    tab_shadow, t_pad = create_drop_shadow(
        tab_resized,
        offset=(0, 28),
        blur_radius=44,
        shadow_color=tab_shadow_color
    )
    
    # --- 4. MOBILE (LEFT SIDE - IPHONE 17 PRO MAX DEEP BLUE) ---
    mob_h = int(canvas_h * 0.41) # 984 px
    mob_w = int(framed_mobile_img.width * (mob_h / framed_mobile_img.height)) # ~482 px
    mob_resized = framed_mobile_img.resize((mob_w, mob_h), Image.Resampling.LANCZOS)
    
    mob_x = int(canvas_w * 0.03)
    mob_y = baseline_y - mob_h
    
    mob_shadow_color = (0, 0, 0, shadow_alpha_base)
    mob_shadow, m_pad = create_drop_shadow(
        mob_resized,
        offset=(0, 24),
        blur_radius=38,
        shadow_color=mob_shadow_color
    )
    
    # Composite Tablet then Mobile on top
    canvas.alpha_composite(tab_shadow, (tab_x - t_pad, tab_y - t_pad))
    canvas.alpha_composite(mob_shadow, (mob_x - m_pad, mob_y - m_pad))
    
    return canvas
