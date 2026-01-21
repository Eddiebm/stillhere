#!/bin/bash

# Stillhere Setup Script
# This script helps you set up Stillhere for the first time

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║             STILLHERE SETUP                               ║"
echo "║     Your Social Media House-Sitter                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✓ Python 3 is installed"

# Check if pip is installed
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

echo "✓ pip is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt || pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your API credentials:"
    echo "   - OPENAI_API_KEY (required)"
    echo "   - Platform credentials (Twitter, LinkedIn, etc.)"
else
    echo ""
    echo "✓ .env file already exists"
fi

# Check config.yaml
if [ ! -f config.yaml ]; then
    echo ""
    echo "⚠️  config.yaml not found. Please create one or copy from the example."
else
    echo "✓ config.yaml exists"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE!                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API credentials"
echo "2. Edit config.yaml to customize your settings"
echo "3. Test with: python3 main.py --post-now"
echo "4. Run continuously: python3 main.py"
echo ""
echo "For help, see the README.md file"
echo ""
