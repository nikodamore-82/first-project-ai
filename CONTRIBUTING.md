# Contributing to First Project AI

## 🚀 Development Setup

### Prerequisites
- WSL2 or Linux environment
- Docker Desktop
- Lando
- Node.js & npm
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/nikodamore-82/first-project-ai.git
cd first-project-ai

# Check and install dependencies
bash scripts/check-deps.sh

# Start development environment
bash scripts/generate-scaffold.sh

# Start file watcher (optional)
tmux new-session -d -s watcher 'bash scripts/run-watcher.sh'
```

### Development URLs
- Main site: `http://mywebsite.lndo.site/`
- Auth test: `http://mywebsite.lndo.site/auth-test.html`
- Showcase: `http://mywebsite.lndo.site/showcase.html`

## 📁 Project Structure
```
├── .lando.yml              # Lando configuration
├── src/                    # Source code
│   ├── index.html         # Main page
│   ├── auth-test.html     # Authentication testing
│   ├── showcase.html      # Features showcase
│   └── assets/            # CSS, JS, images
├── scripts/               # Automation scripts
└── README.md              # Documentation
```

## 🛠️ Available Scripts
- `bash scripts/check-deps.sh` - Check dependencies
- `bash scripts/generate-scaffold.sh` - Setup environment
- `bash scripts/run-watcher.sh` - File watcher
- `lando start` - Start Lando
- `lando info` - Environment info

## 🎨 Code Style
- Use modern CSS3 features
- Follow HTML5 semantic standards
- Keep JavaScript modular and commented
- Maintain responsive design principles

## 🧪 Testing
Test all authentication features:
1. User registration
2. Login/logout
3. User list functionality
4. Responsive design on different devices

## 📝 Commit Convention
Use conventional commits with emojis:
- `🚀 feat: new feature`
- `🐛 fix: bug fix`
- `📚 docs: documentation`
- `🎨 style: formatting`
- `♻️ refactor: code refactoring`

## 🤝 Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit PR with clear description

## 📞 Support
- Check documentation in README.md
- Review troubleshooting section
- Open GitHub issues for bugs