#!/usr/bin/env python3
"""
Demo script for Stillhere
Shows how the system works without needing real API credentials
"""

import os
import sys
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from stillhere.config import Config
from stillhere.content_generator import ContentGenerator
from stillhere.scheduler import PostScheduler


def demo_content_generation():
    """Demo: Content generation"""
    print("="*60)
    print("DEMO: Content Generation")
    print("="*60)
    
    # Mock OpenAI response
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "Just wrapped up an amazing project for a client! 💼 Grateful for the opportunity to help businesses grow. What's your biggest win this week? #BusinessGrowth #Success #Entrepreneurship"
    
    with patch.dict(os.environ, {'OPENAI_API_KEY': 'demo-key'}):
        with patch('stillhere.content_generator.OpenAI') as mock_openai:
            mock_client = Mock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            generator = ContentGenerator()
            
            config = Config('config.yaml')
            business_info = config.get_business_info()
            style_preferences = config.get_style_preferences()
            
            post = generator.generate_post(
                topic="business updates",
                platform="twitter",
                business_info=business_info,
                style_preferences=style_preferences,
                max_length=280
            )
            
            print(f"\n✅ Generated Twitter post:")
            print(f"   {post}")
            print()


def demo_configuration():
    """Demo: Configuration loading"""
    print("="*60)
    print("DEMO: Configuration Management")
    print("="*60)
    
    config = Config('config.yaml')
    
    print(f"\n📋 Schedule Settings:")
    schedule = config.get_schedule_settings()
    print(f"   Posts per week: {schedule.get('posts_per_week')}")
    print(f"   Preferred times: {', '.join(schedule.get('preferred_times', []))}")
    
    print(f"\n🎯 Enabled Platforms:")
    platforms = config.get_enabled_platforms()
    for platform, enabled in platforms.items():
        status = "✓ Enabled" if enabled else "✗ Disabled"
        print(f"   {platform.capitalize()}: {status}")
    
    print(f"\n📝 Content Topics:")
    topics = config.get_topics()
    for topic in topics:
        print(f"   • {topic}")
    
    print(f"\n🏢 Business Info:")
    business = config.get_business_info()
    print(f"   Name: {business.get('name')}")
    print(f"   Industry: {business.get('industry')}")
    print(f"   Tone: {business.get('tone')}")
    print()


def demo_scheduling():
    """Demo: Scheduling system"""
    print("="*60)
    print("DEMO: Posting Schedule")
    print("="*60)
    
    with patch.dict(os.environ, {'OPENAI_API_KEY': 'demo-key'}):
        config = Config('config.yaml')
        scheduler = PostScheduler(config)
        scheduler.schedule_posts()
        print()


def main():
    """Run all demos"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║              STILLHERE DEMONSTRATION                      ║
║     Your Social Media House-Sitter                        ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    demo_configuration()
    demo_content_generation()
    demo_scheduling()
    
    print("="*60)
    print("DEMO COMPLETE")
    print("="*60)
    print("\nThis demonstrates Stillhere's core functionality:")
    print("  1. ✅ Configuration management")
    print("  2. ✅ AI-powered content generation")
    print("  3. ✅ Flexible scheduling system")
    print("  4. ✅ Multi-platform support")
    print("\nTo use Stillhere for real:")
    print("  1. Add your API credentials to .env")
    print("  2. Customize config.yaml for your business")
    print("  3. Run: python3 main.py")
    print()


if __name__ == '__main__':
    main()
