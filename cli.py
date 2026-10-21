import argparse
import sys
import os
from core.pipeline import generate_portfolio_assets

def main():
    parser = argparse.ArgumentParser(
        description="Automated Website Portfolio Showcase Generator with bezel.fit iPhone 17 Pro Max framing"
    )
    parser.add_argument("url", help="Target website URL (e.g. https://example.com)")
    parser.add_argument("--name", "-n", default=None, help="Project name (defaults to page title)")
    parser.add_argument("--finish", "-f", default="deep-blue", choices=["deep-blue", "silver", "cosmic-orange"],
                        help="iPhone 17 Pro Max finish (default: deep-blue)")
    parser.add_argument("--tablet", "-t", default="space-black", choices=["space-black", "silver"],
                        help="iPad finish (default: space-black)")
    parser.add_argument("--bg", default="#E5E5E5",
                        help="Background color ('#E5E5E5', 'transparent', or hex code)")
    parser.add_argument("--shadow", default="normal", choices=["subtle", "normal", "bold"],
                        help="Shadow intensity")
    parser.add_argument("--delay", type=float, default=1.5,
                        help="Stabilization delay in seconds before capture")
    parser.add_argument("--out", "-o", default="./exports",
                        help="Output directory (default: ./exports)")

    args = parser.parse_args()

    # Progress logger
    def on_progress(step, message):
        print(f"[{step.upper()}] {message}")

    print(f"Starting showcase generation for: {args.url}")
    print(f"Frame: iPhone 17 Pro Max ({args.finish}) from bezel.fit + iPad ({args.tablet})")
    
    try:
        result = generate_portfolio_assets(
            url=args.url,
            output_dir=args.out,
            project_name=args.name,
            mobile_finish=args.finish,
            tablet_finish=args.tablet,
            bg_color=args.bg,
            shadow_intensity=args.shadow,
            delay=args.delay,
            progress_callback=on_progress
        )
        print("\n" + "="*60)
        print("SUCCESSFULLY GENERATED PORTFOLIO SHOWCASE ASSETS!")
        print("="*60)
        print(f"Project: {result['title']}")
        print(f"Location: {result['output_dir']}")
        print("Exported Files:")
        for name, path in result['exports'].items():
            print(f"  * {name:15s}: {path}")
        print("="*60)
    except Exception as e:
        print(f"\n[ERROR] Failed to generate showcase: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
