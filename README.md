# Stillhere 🏠

**Your Social Media House-Sitter**

We keep your social media alive while you focus on what matters.

## The Problem

You're busy running your business. Weeks go by, and suddenly you realize you haven't posted anything on Twitter, LinkedIn, or Instagram. Your accounts look abandoned. Customers wonder if you're still in business.

## The Solution

Stillhere is your automated social media house-sitter that:

- ✅ **Posts regularly** on your behalf across all your platforms
- ✅ **Sounds authentic** - Uses AI to match your voice, not a robot
- ✅ **Keeps you active** - Your accounts never "go dark"

Think of it like a house-sitter for your online presence.

## Features

- 🤖 **AI-Powered Content Generation** - Uses OpenAI to create posts that sound like you
- 📅 **Flexible Scheduling** - Configure how often and when to post
- 🎯 **Multi-Platform Support** - Twitter, LinkedIn, and Instagram
- ⚙️ **Highly Configurable** - Customize topics, tone, style, and more
- 🔒 **Secure** - Your credentials stay local in environment variables

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Eddiebm/stillhere.git
cd stillhere

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

**Set up environment variables:**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API credentials
nano .env  # or use your preferred editor
```

Required credentials:
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- Platform credentials (at least one):
  - Twitter: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
  - LinkedIn: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN`
  - Instagram: `INSTAGRAM_USERNAME`, `INSTAGRAM_PASSWORD`

**Configure your settings:**

Edit `config.yaml` to customize:
- Posting frequency (posts per week)
- Preferred posting times
- Which platforms to use
- Topics to post about
- Your business info and tone
- Content style preferences

### 3. Run Stillhere

**Test it first:**

```bash
# Generate and post content immediately (for testing)
python main.py --post-now
```

**Run the scheduler:**

```bash
# Start the scheduler (runs continuously)
python main.py
```

**View the schedule:**

```bash
# See when posts are scheduled
python main.py --schedule
```

## Configuration Reference

### Schedule Settings

```yaml
schedule:
  posts_per_week: 3          # How many times to post per week
  preferred_times:            # What times of day (24-hour format)
    - "09:00"
    - "14:00"
    - "18:00"
```

### Platform Settings

```yaml
platforms:
  twitter:
    enabled: true            # Enable/disable platform
    max_length: 280          # Character limit
  linkedin:
    enabled: true
    max_length: 3000
  instagram:
    enabled: false           # Note: Instagram requires images
    max_length: 2200
```

### Content Settings

```yaml
content:
  topics:                    # What to post about
    - "business updates"
    - "industry insights"
    - "motivational quotes"
    - "tips and tricks"
  
  business:
    name: "Your Business Name"
    industry: "Your Industry"
    tone: "professional but friendly"
  
  style:
    use_emojis: false       # Include emojis in posts
    use_hashtags: true      # Add hashtags
    max_hashtags: 3         # How many hashtags
```

## How to Get API Credentials

### OpenAI (Required)

1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env` file as `OPENAI_API_KEY`

### Twitter

1. Go to https://developer.twitter.com/
2. Create a developer account and app
3. Generate API keys and access tokens
4. Add them to your `.env` file

### LinkedIn

1. Create a LinkedIn app at https://www.linkedin.com/developers/
2. Get an access token with `w_member_social` permission
3. Get your person URN from the API
4. Add them to your `.env` file

### Instagram

⚠️ **Note**: Instagram requires images for posts. Text-only posting is not supported by Instagram's API. This integration is included but limited.

## Usage Examples

**Testing a single post:**
```bash
python main.py --post-now
```

**Running continuously:**
```bash
python main.py
```

**Checking the schedule:**
```bash
python main.py --schedule
```

**Using a custom config file:**
```bash
python main.py --config /path/to/custom-config.yaml
```

## Architecture

Stillhere is built with these core components:

- **Content Generator** - Uses OpenAI GPT to create authentic posts
- **Platform Connectors** - Interfaces with Twitter, LinkedIn, Instagram APIs
- **Scheduler** - Manages timing and execution of posts
- **Configuration Manager** - Handles settings and preferences

## Security Best Practices

- ✅ Never commit your `.env` file (it's in `.gitignore`)
- ✅ Keep your API keys secure
- ✅ Use environment variables, not hardcoded credentials
- ✅ Review generated content before it goes live (use `--post-now` for testing)

## Troubleshooting

**"OpenAI API key not found"**
- Make sure you've created a `.env` file with `OPENAI_API_KEY`
- Make sure you've run `pip install python-dotenv`

**"Platform is not configured"**
- Check that all required credentials for that platform are in `.env`
- Verify the credentials are correct

**"Failed to generate content"**
- Check your OpenAI API key is valid
- Ensure you have credits available in your OpenAI account

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your business!

## Support

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Review your configuration in `config.yaml`
3. Verify your API credentials in `.env`
4. Open an issue on GitHub

---

**Made with ❤️ for busy entrepreneurs who want to stay active on social media**
