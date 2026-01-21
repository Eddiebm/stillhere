"""
Content Generator Module
Uses OpenAI to generate authentic-sounding social media posts
"""

import os
from typing import List, Dict
from openai import OpenAI


class ContentGenerator:
    """Generates social media content using AI"""
    
    def __init__(self, api_key: str = None):
        """
        Initialize the content generator
        
        Args:
            api_key: OpenAI API key (if not provided, uses OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        self.client = OpenAI(api_key=self.api_key)
    
    def generate_post(
        self, 
        topic: str, 
        platform: str, 
        business_info: Dict[str, str],
        style_preferences: Dict[str, any],
        max_length: int = 280
    ) -> str:
        """
        Generate a social media post
        
        Args:
            topic: The topic to write about
            platform: Target platform (twitter, linkedin, instagram)
            business_info: Business name, industry, and tone
            style_preferences: Style settings (emojis, hashtags, etc.)
            max_length: Maximum character length
            
        Returns:
            Generated post content
        """
        # Build the prompt
        prompt = self._build_prompt(
            topic, platform, business_info, style_preferences, max_length
        )
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media manager who writes authentic, engaging posts that sound natural and human."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            post = response.choices[0].message.content.strip()
            
            # Remove quotes if the AI added them
            if post.startswith('"') and post.endswith('"'):
                post = post[1:-1]
            if post.startswith("'") and post.endswith("'"):
                post = post[1:-1]
            
            return post
            
        except Exception as e:
            raise Exception(f"Failed to generate content: {str(e)}")
    
    def _build_prompt(
        self, 
        topic: str, 
        platform: str, 
        business_info: Dict[str, str],
        style_preferences: Dict[str, any],
        max_length: int
    ) -> str:
        """Build the prompt for content generation"""
        business_name = business_info.get("name", "our business")
        industry = business_info.get("industry", "our industry")
        tone = business_info.get("tone", "professional but friendly")
        
        use_emojis = style_preferences.get("use_emojis", False)
        use_hashtags = style_preferences.get("use_hashtags", True)
        max_hashtags = style_preferences.get("max_hashtags", 3)
        
        prompt = f"""Write a {platform} post for {business_name}, a business in the {industry} industry.

Topic: {topic}
Tone: {tone}
Max length: {max_length} characters

Requirements:
- Sound natural and human, not like AI or a robot
- Be engaging and authentic
- Keep it under {max_length} characters
"""
        
        if use_emojis:
            prompt += "- Include 1-2 relevant emojis\n"
        else:
            prompt += "- Do NOT use emojis\n"
        
        if use_hashtags:
            prompt += f"- Include {max_hashtags} relevant hashtags at the end\n"
        else:
            prompt += "- Do NOT use hashtags\n"
        
        prompt += "\nWrite only the post content, nothing else."
        
        return prompt
