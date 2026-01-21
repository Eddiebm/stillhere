# Contributing to Stillhere

Thank you for your interest in contributing to Stillhere!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`python3 -m unittest tests/test_stillhere.py`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stillhere.git
cd stillhere

# Install dependencies
pip install -r requirements.txt

# Run tests
python3 -m unittest tests/test_stillhere.py

# Run demo
python3 demo.py
```

## Code Style

- Follow PEP 8 guidelines
- Add docstrings to all functions and classes
- Write tests for new features
- Keep functions focused and small

## Testing

Make sure all tests pass before submitting a PR:

```bash
python3 -m unittest tests/test_stillhere.py -v
```

## Adding New Features

When adding new features:

1. Add tests in `tests/test_stillhere.py`
2. Update documentation in `README.md`
3. Add configuration options to `config.yaml` if needed
4. Update `.env.example` if new credentials are required

## Bug Reports

When reporting bugs, please include:

- Operating system and Python version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages or logs

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Explain the use case
- Provide examples if possible

## Questions?

Open an issue with the "question" label and we'll help you out!
