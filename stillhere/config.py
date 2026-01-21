"""
Configuration Management Module
Handles loading and managing configuration
"""

import os
import yaml
from typing import Dict, Any


class Config:
    """Configuration manager for Stillhere"""
    
    def __init__(self, config_path: str = None):
        """
        Initialize configuration
        
        Args:
            config_path: Path to config.yaml file (defaults to ./config.yaml)
        """
        if config_path is None:
            config_path = os.path.join(os.getcwd(), "config.yaml")
        
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        return config
    
    def get_schedule_settings(self) -> Dict[str, Any]:
        """Get scheduling settings"""
        return self.config.get('schedule', {})
    
    def get_platform_settings(self) -> Dict[str, Any]:
        """Get platform settings"""
        return self.config.get('platforms', {})
    
    def get_content_settings(self) -> Dict[str, Any]:
        """Get content generation settings"""
        return self.config.get('content', {})
    
    def get_enabled_platforms(self) -> Dict[str, bool]:
        """Get dict of enabled platforms"""
        platforms = self.get_platform_settings()
        return {
            name: settings.get('enabled', False) 
            for name, settings in platforms.items()
        }
    
    def get_platform_max_length(self, platform_name: str) -> int:
        """Get max content length for a platform"""
        platforms = self.get_platform_settings()
        platform = platforms.get(platform_name, {})
        return platform.get('max_length', 280)
    
    def get_topics(self) -> list:
        """Get list of content topics"""
        content = self.get_content_settings()
        return content.get('topics', [])
    
    def get_business_info(self) -> Dict[str, str]:
        """Get business information"""
        content = self.get_content_settings()
        return content.get('business', {})
    
    def get_style_preferences(self) -> Dict[str, Any]:
        """Get content style preferences"""
        content = self.get_content_settings()
        return content.get('style', {})
