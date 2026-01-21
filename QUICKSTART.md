# Quick Start Guide for Stillhere

Get up and running with Stillhere in 5 minutes!

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- An OpenAI API key (get one at https://platform.openai.com/api-keys)
- Social media API credentials (at least one platform)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Eddiebm/stillhere.git
cd stillhere
```

### 2. Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

Or install manually:

```bash
pip install -r requirements.txt
cp .env.example .env
```

### 3. Add Your API Keys

Edit the `.env` file:

```bash
nano .env  # or use your preferred editor
```

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

**At least one platform:**
- Twitter: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
- LinkedIn: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN`

### 4. Configure Your Settings

Edit `config.yaml`:

```bash
nano config.yaml
```

Update:
- `business.name` - Your business name
- `business.industry` - Your industry
- `topics` - What you want to post about
- `platforms` - Enable/disable platforms

### 5. Test It

```bash
# See the demo
python3 demo.py

# Try a test post (won't actually post without real credentials)
python3 main.py --post-now
```

### 6. Run It

```bash
# Start the scheduler (runs continuously)
python3 main.py
```

## What Happens Next?

Stillhere will:

1. ✅ Generate posts based on your topics
2. ✅ Match your business's tone and style
3. ✅ Post at scheduled times to enabled platforms
4. ✅ Keep your social media active automatically

## Stopping Stillhere

Press `Ctrl+C` to stop the scheduler.

## Need Help?

- See the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development info
- Open an issue on GitHub for support

## Tips for Success

✅ **Start Small**: Enable just one platform first (Twitter is easiest)

✅ **Review First**: Use `--post-now` to test before running the scheduler

✅ **Customize Topics**: Edit your topics to match your business

✅ **Check Logs**: Watch the console output to see what's being posted

✅ **Adjust Frequency**: Start with 2-3 posts per week, then adjust

## Common Issues

**"OpenAI API key not found"**
- Make sure `.env` file exists
- Verify `OPENAI_API_KEY` is set correctly

**"Platform is not configured"**
- Check that all required credentials are in `.env`
- Verify credentials are correct

**No posts showing up?**
- Check that at least one platform is enabled in `config.yaml`
- Verify credentials are valid
- Look at console output for error messages

---

**You're all set! Stillhere is now your social media house-sitter. 🏠**
