# ==============================================================================
# Designed, Planned & Developed by Ejaj Mahmud
# Portfolio Image Generator - Enterprise Web & Asset Automation Pipeline
# Copyright (c) 2026 Shinjiru Technology Sdn. Bhd. All rights reserved.
# ==============================================================================

import os
import re
from PIL import Image
from .capture import capture_website
from .framer import frame_iphone, frame_tablet
from .compositor import compose_showcase
from .exporter import export_all_formats

def slugify(text):
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text) or "portfolio-showcase"

def generate_portfolio_assets(
    url,
    output_dir,
    project_name=None,
    category=None,
    website_type=None,
    mobile_finish="deep-blue",
    tablet_finish="space-black",
    bg_color="#E5E5E5",
    shadow_intensity="normal",
    delay=2.0,
    hide_banners=True,
    headless=True,
    progress_callback=None
):
    """
    Complete end-to-end pipeline:
    1. Capture Desktop, Mobile (iPhone 17 Pro Max viewport), and Tablet (iPad viewport).
    2. Frame Mobile with bezel.fit iPhone 17 Pro Max frame (Deep Blue).
    3. Frame Tablet with iPad frame.
    4. Composite into signature portfolio card layout.
    5. Export to WebP, PNG, JPG + ZIP archive.
    """
    os.makedirs(output_dir, exist_ok=True)
    raw_dir = os.path.join(output_dir, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    
    # Step 1: Capture
    capture_data = capture_website(
        url,
        raw_dir,
        delay=delay,
        hide_banners=hide_banners,
        headless=headless,
        progress_callback=progress_callback
    )
    
    name = project_name or capture_data.get("title") or "Website"
    slug = slugify(name)
    
    # Step 2: Framing
    if progress_callback:
        progress_callback("framing", f"Applying device frames ({mobile_finish})...")
        
    framed_mob = frame_iphone(capture_data["mobile"], finish=mobile_finish)
    framed_tab = frame_tablet(capture_data["tablet"], finish=tablet_finish)
    raw_desk = Image.open(capture_data["desktop"]).convert('RGBA')
    
    # Step 3: Compositing
    if progress_callback:
        progress_callback("compositing", "Compositing 3D portfolio showcase with realistic shadows...")
        
    showcase_img = compose_showcase(
        raw_desk,
        framed_mob,
        framed_tab,
        bg_color=bg_color,
        shadow_intensity=shadow_intensity
    )
    
    # Step 4: Exporting
    if progress_callback:
        progress_callback("exporting", "Exporting WebP, PNG, JPG, and ZIP bundle...")
        
    meta_info = {
        "title": name,
        "slug": slug,
        "url": url,
        "category": category or "",
        "type": website_type or ""
    }
    exports = export_all_formats(
        showcase_img=showcase_img,
        framed_mobile_img=framed_mob,
        framed_tablet_img=framed_tab,
        desktop_img=raw_desk,
        output_dir=output_dir,
        base_name=slug,
        bg_for_jpg=(229, 229, 229),
        metadata=meta_info
    )
    
    if progress_callback:
        progress_callback("completed", "Showcase generated successfully!")
        
    return {
        "title": name,
        "slug": slug,
        "url": url,
        "category": category or "",
        "type": website_type or "",
        "exports": exports,
        "output_dir": output_dir
    }
