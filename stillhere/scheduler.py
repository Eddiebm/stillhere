"""
Scheduler Module
Handles scheduling and executing posts
"""

import random
import time
from datetime import datetime, timedelta
from typing import List
import schedule

from .content_generator import ContentGenerator
from .platforms import PlatformManager
from .config import Config


class PostScheduler:
    """Schedules and executes social media posts"""
    
    def __init__(self, config: Config):
        """
        Initialize the scheduler
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.content_generator = ContentGenerator()
        self.platform_manager = PlatformManager()
        self.current_topic_index = 0
    
    def schedule_posts(self):
        """Set up the posting schedule based on configuration"""
        schedule_settings = self.config.get_schedule_settings()
        posts_per_week = schedule_settings.get('posts_per_week', 3)
        preferred_times = schedule_settings.get('preferred_times', ['09:00'])
        
        # Clear any existing jobs
        schedule.clear()
        
        # Calculate how to distribute posts across the week
        days_between_posts = 7 / posts_per_week
        
        # Schedule posts
        for i in range(posts_per_week):
            day_offset = int(i * days_between_posts)
            time_slot = random.choice(preferred_times)
            
            # Map day offset to weekday
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            target_day = days[day_offset % 7]
            
            # Schedule the job
            job_func = getattr(schedule.every(), target_day)
            job_func.at(time_slot).do(self.create_and_post)
            
            print(f"📅 Scheduled post for {target_day.capitalize()} at {time_slot}")
    
    def create_and_post(self):
        """Create content and post to all enabled platforms"""
        print(f"\n{'='*60}")
        print(f"Creating and posting content at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        
        # Get a topic
        topics = self.config.get_topics()
        if not topics:
            print("No topics configured!")
            return
        
        topic = topics[self.current_topic_index % len(topics)]
        self.current_topic_index += 1
        
        print(f"📝 Topic: {topic}")
        
        # Get settings
        business_info = self.config.get_business_info()
        style_preferences = self.config.get_style_preferences()
        enabled_platforms = self.config.get_enabled_platforms()
        
        # Generate content for each enabled platform
        for platform_name, enabled in enabled_platforms.items():
            if not enabled:
                continue
            
            max_length = self.config.get_platform_max_length(platform_name)
            
            try:
                # Generate content
                content = self.content_generator.generate_post(
                    topic=topic,
                    platform=platform_name,
                    business_info=business_info,
                    style_preferences=style_preferences,
                    max_length=max_length
                )
                
                print(f"\n{platform_name.upper()} POST:")
                print(f"{content}")
                print()
                
                # Post to platform
                self.platform_manager.post_to_platforms(
                    content, 
                    {platform_name: True}
                )
                
            except Exception as e:
                print(f"✗ Error generating/posting content for {platform_name}: {str(e)}")
        
        print(f"{'='*60}\n")
    
    def post_now(self):
        """Post immediately (for testing)"""
        self.create_and_post()
    
    def run(self):
        """Run the scheduler continuously"""
        print("🚀 Stillhere is running!")
        print("Monitoring for scheduled posts...")
        print("Press Ctrl+C to stop\n")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
