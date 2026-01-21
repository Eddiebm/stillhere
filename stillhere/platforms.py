"""
Platform Connectors Module
Handles posting to different social media platforms
"""

import os
from abc import ABC, abstractmethod
from typing import Optional


class PlatformConnector(ABC):
    """Base class for social media platform connectors"""
    
    @abstractmethod
    def post(self, content: str) -> bool:
        """Post content to the platform"""
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """Check if the platform is properly configured"""
        pass


class TwitterConnector(PlatformConnector):
    """Twitter API connector"""
    
    def __init__(
        self,
        api_key: str = None,
        api_secret: str = None,
        access_token: str = None,
        access_secret: str = None
    ):
        self.api_key = api_key or os.getenv("TWITTER_API_KEY")
        self.api_secret = api_secret or os.getenv("TWITTER_API_SECRET")
        self.access_token = access_token or os.getenv("TWITTER_ACCESS_TOKEN")
        self.access_secret = access_secret or os.getenv("TWITTER_ACCESS_SECRET")
        
        self.client = None
        if self.is_configured():
            try:
                import tweepy
                self.client = tweepy.Client(
                    consumer_key=self.api_key,
                    consumer_secret=self.api_secret,
                    access_token=self.access_token,
                    access_token_secret=self.access_secret
                )
            except ImportError:
                print("Warning: tweepy not installed. Install with: pip install tweepy")
    
    def is_configured(self) -> bool:
        """Check if Twitter credentials are configured"""
        return all([
            self.api_key,
            self.api_secret,
            self.access_token,
            self.access_secret
        ])
    
    def post(self, content: str) -> bool:
        """Post a tweet"""
        if not self.is_configured():
            print("Twitter is not configured. Skipping post.")
            return False
        
        if not self.client:
            print("Twitter client not initialized. Skipping post.")
            return False
        
        try:
            self.client.create_tweet(text=content)
            print(f"✓ Posted to Twitter: {content[:50]}...")
            return True
        except Exception as e:
            print(f"✗ Failed to post to Twitter: {str(e)}")
            return False


class LinkedInConnector(PlatformConnector):
    """LinkedIn API connector"""
    
    def __init__(
        self,
        access_token: str = None,
        person_urn: str = None
    ):
        self.access_token = access_token or os.getenv("LINKEDIN_ACCESS_TOKEN")
        self.person_urn = person_urn or os.getenv("LINKEDIN_PERSON_URN")
    
    def is_configured(self) -> bool:
        """Check if LinkedIn credentials are configured"""
        return bool(self.access_token and self.person_urn)
    
    def post(self, content: str) -> bool:
        """Post to LinkedIn"""
        if not self.is_configured():
            print("LinkedIn is not configured. Skipping post.")
            return False
        
        try:
            import requests
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            post_data = {
                "author": self.person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                print(f"✓ Posted to LinkedIn: {content[:50]}...")
                return True
            else:
                print(f"✗ Failed to post to LinkedIn: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"✗ Failed to post to LinkedIn: {str(e)}")
            return False


class InstagramConnector(PlatformConnector):
    """Instagram connector (requires more complex setup)"""
    
    def __init__(
        self,
        username: str = None,
        password: str = None
    ):
        self.username = username or os.getenv("INSTAGRAM_USERNAME")
        self.password = password or os.getenv("INSTAGRAM_PASSWORD")
        self.client = None
        
        if self.is_configured():
            try:
                from instagrapi import Client
                self.client = Client()
                # Note: Instagram login requires more setup and may trigger security checks
            except ImportError:
                print("Warning: instagrapi not installed. Install with: pip install instagrapi")
    
    def is_configured(self) -> bool:
        """Check if Instagram credentials are configured"""
        return bool(self.username and self.password)
    
    def post(self, content: str) -> bool:
        """Post to Instagram (text-only posts are not supported, would need image)"""
        print("Instagram posting requires images. Text-only posts are not supported.")
        print("Skipping Instagram post.")
        return False


class PlatformManager:
    """Manages posting across multiple platforms"""
    
    def __init__(self):
        self.platforms = {
            'twitter': TwitterConnector(),
            'linkedin': LinkedInConnector(),
            'instagram': InstagramConnector()
        }
    
    def post_to_platforms(self, content: str, enabled_platforms: dict) -> dict:
        """
        Post content to enabled platforms
        
        Args:
            content: The content to post
            enabled_platforms: Dict of platform_name: enabled (bool)
            
        Returns:
            Dict of platform_name: success (bool)
        """
        results = {}
        
        for platform_name, enabled in enabled_platforms.items():
            if not enabled:
                print(f"⊗ {platform_name.capitalize()} is disabled in config")
                results[platform_name] = None
                continue
            
            if platform_name in self.platforms:
                connector = self.platforms[platform_name]
                if connector.is_configured():
                    results[platform_name] = connector.post(content)
                else:
                    print(f"⊗ {platform_name.capitalize()} is not configured")
                    results[platform_name] = False
            else:
                print(f"⊗ Unknown platform: {platform_name}")
                results[platform_name] = False
        
        return results
