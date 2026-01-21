#!/usr/bin/env python3
"""
Stillhere - Main Application
Social media automation that keeps your accounts active
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

from stillhere.config import Config
from stillhere.scheduler import PostScheduler


def main():
    """Main entry point for Stillhere"""
    parser = argparse.ArgumentParser(
        description="Stillhere - Keep your social media accounts active"
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config.yaml',
        help='Path to configuration file (default: config.yaml)'
    )
    parser.add_argument(
        '--post-now',
        action='store_true',
        help='Post immediately instead of waiting for scheduled time'
    )
    parser.add_argument(
        '--schedule',
        action='store_true',
        help='Show the posting schedule'
    )
    
    args = parser.parse_args()
    
    # Load environment variables
    load_dotenv()
    
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY not found in environment variables")
        print("Please set it in your .env file or export it")
        sys.exit(1)
    
    # Load configuration
    try:
        config = Config(args.config)
        print(f"✓ Loaded configuration from {args.config}")
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print(f"Please create a config.yaml file. See config.yaml for an example.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        sys.exit(1)
    
    # Initialize scheduler
    scheduler = PostScheduler(config)
    
    # Handle command-line options
    if args.post_now:
        print("📮 Posting now...\n")
        scheduler.post_now()
        print("\n✓ Done!")
    elif args.schedule:
        print("📅 Setting up schedule...\n")
        scheduler.schedule_posts()
        print("\n✓ Schedule configured!")
    else:
        # Normal operation: schedule and run
        print("""
╔═══════════════════════════════════════════════════════════╗
║                      STILLHERE                            ║
║        Your Social Media House-Sitter is Active          ║
╚═══════════════════════════════════════════════════════════╝
""")
        scheduler.schedule_posts()
        try:
            scheduler.run()
        except KeyboardInterrupt:
            print("\n\n👋 Stillhere stopped. Your social media will miss you!")
            sys.exit(0)


if __name__ == '__main__':
    main()
