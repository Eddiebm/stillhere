"""
Test suite for Stillhere
"""

import os
import sys
import unittest
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from stillhere.config import Config
from stillhere.content_generator import ContentGenerator
from stillhere.platforms import TwitterConnector, LinkedInConnector, PlatformManager


class TestConfig(unittest.TestCase):
    """Test configuration management"""
    
    def test_load_config(self):
        """Test loading configuration file"""
        config = Config('config.yaml')
        self.assertIsNotNone(config.config)
        
    def test_get_topics(self):
        """Test getting topics from config"""
        config = Config('config.yaml')
        topics = config.get_topics()
        self.assertIsInstance(topics, list)
        self.assertGreater(len(topics), 0)
    
    def test_get_business_info(self):
        """Test getting business info"""
        config = Config('config.yaml')
        business_info = config.get_business_info()
        self.assertIsInstance(business_info, dict)
        self.assertIn('name', business_info)


class TestContentGenerator(unittest.TestCase):
    """Test content generation"""
    
    def test_init_without_key(self):
        """Test initialization without API key fails"""
        # Clear env var if it exists
        old_key = os.environ.get('OPENAI_API_KEY')
        if 'OPENAI_API_KEY' in os.environ:
            del os.environ['OPENAI_API_KEY']
        
        with self.assertRaises(ValueError):
            ContentGenerator()
        
        # Restore if it existed
        if old_key:
            os.environ['OPENAI_API_KEY'] = old_key
    
    def test_build_prompt(self):
        """Test prompt building"""
        # Mock the API key
        with patch.dict(os.environ, {'OPENAI_API_KEY': 'test-key'}):
            generator = ContentGenerator()
            
            prompt = generator._build_prompt(
                topic="business updates",
                platform="twitter",
                business_info={"name": "Test Co", "industry": "Tech", "tone": "friendly"},
                style_preferences={"use_emojis": False, "use_hashtags": True, "max_hashtags": 3},
                max_length=280
            )
            
            self.assertIn("Test Co", prompt)
            self.assertIn("Tech", prompt)
            self.assertIn("280", prompt)


class TestPlatformConnectors(unittest.TestCase):
    """Test platform connectors"""
    
    def test_twitter_connector_not_configured(self):
        """Test Twitter connector without credentials"""
        connector = TwitterConnector()
        self.assertFalse(connector.is_configured())
    
    def test_linkedin_connector_not_configured(self):
        """Test LinkedIn connector without credentials"""
        connector = LinkedInConnector()
        self.assertFalse(connector.is_configured())
    
    def test_platform_manager(self):
        """Test platform manager initialization"""
        manager = PlatformManager()
        self.assertIn('twitter', manager.platforms)
        self.assertIn('linkedin', manager.platforms)
        self.assertIn('instagram', manager.platforms)


class TestIntegration(unittest.TestCase):
    """Integration tests"""
    
    def test_config_and_platforms(self):
        """Test config integration with platforms"""
        config = Config('config.yaml')
        enabled = config.get_enabled_platforms()
        
        self.assertIsInstance(enabled, dict)
        # At least one platform should be defined
        self.assertGreater(len(enabled), 0)


if __name__ == '__main__':
    # Run tests
    unittest.main()
