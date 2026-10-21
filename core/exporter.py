import os
import zipfile
from PIL import Image

def export_image(pil_image, output_path, format_type='png', quality=95, bg_for_jpg=(255, 255, 255)):
    """
    Exports PIL Image to PNG, WebP, or JPG with proper channel handling.
    """
    format_lower = format_type.lower()
    
    if format_lower in ['jpg', 'jpeg']:
        # JPG requires RGB mode (no alpha)
        if pil_image.mode in ('RGBA', 'LA') or (pil_image.mode == 'P' and 'transparency' in pil_image.info):
            bg = Image.new('RGB', pil_image.size, bg_for_jpg)
            alpha = pil_image.split()[-1]
            bg.paste(pil_image, mask=alpha)
            bg.save(output_path, 'JPEG', quality=quality, optimize=True)
        else:
            pil_image.convert('RGB').save(output_path, 'JPEG', quality=quality, optimize=True)
    elif format_lower == 'webp':
        pil_image.save(output_path, 'WEBP', quality=quality, method=4)
    elif format_lower == 'png':
        pil_image.save(output_path, 'PNG', optimize=True)
    else:
        raise ValueError(f"Unsupported format: {format_type}")
        
    return output_path

def export_all_formats(
    showcase_img,
    framed_mobile_img,
    framed_tablet_img,
    desktop_img,
    output_dir,
    base_name="showcase",
    bg_for_jpg=(255, 255, 255)
):
    """
    Exports WebP, PNG, JPG for the showcase AND individual devices,
    and bundles them into a ZIP archive.
    """
    os.makedirs(output_dir, exist_ok=True)
    created_files = {}
    
    # 1. Main Showcase exports
    showcase_png = os.path.join(output_dir, f"{base_name}.png")
    showcase_webp = os.path.join(output_dir, f"{base_name}.webp")
    showcase_jpg = os.path.join(output_dir, f"{base_name}.jpg")
    
    export_image(showcase_img, showcase_png, 'png')
    export_image(showcase_img, showcase_webp, 'webp', quality=95)
    export_image(showcase_img, showcase_jpg, 'jpg', quality=95, bg_for_jpg=bg_for_jpg)
    
    created_files["showcase_png"] = showcase_png
    created_files["showcase_webp"] = showcase_webp
    created_files["showcase_jpg"] = showcase_jpg
    
    # 2. Individual device exports
    # Mobile (framed iPhone 17 Pro Max)
    mob_png = os.path.join(output_dir, f"{base_name}-mobile-iphone17promax.png")
    mob_webp = os.path.join(output_dir, f"{base_name}-mobile-iphone17promax.webp")
    mob_jpg = os.path.join(output_dir, f"{base_name}-mobile-iphone17promax.jpg")
    export_image(framed_mobile_img, mob_png, 'png')
    export_image(framed_mobile_img, mob_webp, 'webp', quality=95)
    export_image(framed_mobile_img, mob_jpg, 'jpg', quality=95, bg_for_jpg=bg_for_jpg)
    created_files["mobile_png"] = mob_png
    created_files["mobile_webp"] = mob_webp
    created_files["mobile_jpg"] = mob_jpg
    
    # Tablet (framed iPad)
    tab_png = os.path.join(output_dir, f"{base_name}-tablet-ipad.png")
    tab_webp = os.path.join(output_dir, f"{base_name}-tablet-ipad.webp")
    tab_jpg = os.path.join(output_dir, f"{base_name}-tablet-ipad.jpg")
    export_image(framed_tablet_img, tab_png, 'png')
    export_image(framed_tablet_img, tab_webp, 'webp', quality=95)
    export_image(framed_tablet_img, tab_jpg, 'jpg', quality=95, bg_for_jpg=bg_for_jpg)
    created_files["tablet_png"] = tab_png
    created_files["tablet_webp"] = tab_webp
    created_files["tablet_jpg"] = tab_jpg
    
    # Desktop
    desk_png = os.path.join(output_dir, f"{base_name}-desktop.png")
    desk_webp = os.path.join(output_dir, f"{base_name}-desktop.webp")
    desk_jpg = os.path.join(output_dir, f"{base_name}-desktop.jpg")
    export_image(desktop_img, desk_png, 'png')
    export_image(desktop_img, desk_webp, 'webp', quality=95)
    export_image(desktop_img, desk_jpg, 'jpg', quality=95, bg_for_jpg=bg_for_jpg)
    created_files["desktop_png"] = desk_png
    created_files["desktop_webp"] = desk_webp
    created_files["desktop_jpg"] = desk_jpg
    
    # 3. Create ZIP bundle
    zip_path = os.path.join(output_dir, f"{base_name}-all-assets.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for key, filepath in created_files.items():
            zipf.write(filepath, arcname=os.path.basename(filepath))
            
    created_files["zip"] = zip_path
    return created_files
