# 🔖 Tab & Bookmark Manager

An intelligent tab and bookmark management system with AI-powered content analysis, smart suggestions, and automated archival capabilities.

## ✨ Features

- **Browser Extension**: Capture tabs and bookmarks automatically from Chrome/Edge
- **Backend API**: RESTful API built with Node.js/Express for managing tabs and bookmarks
- **ML Service**: Python/Flask-based NLP service with:
  - Text summarization
  - Content classification
  - Named entity extraction
  - Semantic embeddings for similarity search
  - Keyword extraction
- **Smart Suggestions**:
  - Duplicate detection
  - Stale tab identification
  - Related content discovery
- **Archival System**: Preserve web pages with Puppeteer (HTML, screenshots, PDFs)
- **Semantic Search**: Find similar content using vector embeddings
- **Job Queue**: Redis-based background processing with Bull
- **Database**: PostgreSQL with pgvector for efficient similarity search
- **Docker Support**: Complete containerization with Docker Compose
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment

## 🏗️ Architecture

```
┌─────────────────┐
│ Browser         │
│ Extension       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Backend API     │◄─────┤ ML Service      │
│ (Node.js)       │      │ (Python/Flask)  │
└────────┬────────┘      └─────────────────┘
         │
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
   ┌─────────┐ ┌────────┐ ┌───────┐ ┌──────────┐
   │PostgreSQL│ │ Redis  │ │Puppeteer│ │Bull Queue│
   └─────────┘ └────────┘ └───────┘ └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/ivi374forivi/tab-bookmark-manager.git
cd tab-bookmark-manager
```

2. Run the setup script:
```bash
./scripts/setup.sh
```

This will start all services:
- Backend API: http://localhost:3000
- ML Service: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

3. Load the browser extension:
   - Open Chrome/Edge and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` directory

### Local Development

1. Run the development setup:
```bash
./scripts/dev-setup.sh
```

2. Start PostgreSQL and Redis (via Docker or locally)

3. Start the backend:
```bash
cd backend
npm run dev
```

4. Start the ML service:
```bash
cd ml-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python src/app.py
```

## 📚 API Documentation

Interactive API documentation is available at `http://localhost:3000/api-docs` when the backend server is running. The documentation is automatically generated using OpenAPI/Swagger and includes:

- Complete endpoint descriptions
- Request/response schemas
- Authentication requirements
- Interactive testing interface

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout and revoke token

#### User Profile Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update username
- `PUT /api/user/email` - Update email address
- `PUT /api/user/password` - Change password
- `DELETE /api/user/account` - Delete user account

#### Tabs
- `POST /api/tabs` - Create a new tab
- `GET /api/tabs` - List all tabs
- `GET /api/tabs/:id` - Get tab by ID
- `PUT /api/tabs/:id` - Update tab
- `DELETE /api/tabs/:id` - Delete tab
- `POST /api/tabs/:id/archive` - Archive tab
- `GET /api/tabs/stale/detect` - Detect stale tabs

#### Bookmarks
- `POST /api/bookmarks` - Create a new bookmark
- `GET /api/bookmarks` - List all bookmarks
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `POST /api/bookmarks/:id/archive` - Archive bookmark

#### Search
- `POST /api/search/semantic` - Semantic search using embeddings
- `GET /api/search/text` - Text-based search
- `GET /api/search/similar/:id` - Find similar items

#### Suggestions
- `GET /api/suggestions` - Get all suggestions
- `GET /api/suggestions/duplicates` - Get duplicate suggestions
- `GET /api/suggestions/stale` - Get stale tab suggestions
- `GET /api/suggestions/related/:id` - Get related content
- `POST /api/suggestions/generate` - Generate new suggestions
- `PUT /api/suggestions/:id/accept` - Accept suggestion
- `PUT /api/suggestions/:id/reject` - Reject suggestion

#### Archive
- `POST /api/archive` - Archive a page
- `GET /api/archive/:id` - Get archived page
- `GET /api/archive` - List archived pages

### ML Service Endpoints

- `POST /api/analyze` - Comprehensive content analysis
- `POST /api/summarize` - Generate text summary
- `POST /api/classify` - Classify content into categories
- `POST /api/entities` - Extract named entities
- `POST /api/embed` - Generate embedding vector
- `POST /api/keywords` - Extract keywords

## 🔧 Configuration

### Backend (.env)
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tab_bookmark_manager
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
ML_SERVICE_URL=http://localhost:5000
ARCHIVE_DIR=./archives
LOG_LEVEL=info
```

### ML Service (.env)
```
PORT=5000
DEBUG=False
LOG_LEVEL=INFO
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml-service
pytest
```

## 📦 Deployment

### Docker Compose
```bash
cd infrastructure/docker
docker-compose up -d
```

### Kubernetes
Kubernetes manifests are available in `infrastructure/kubernetes/` (to be implemented).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Node.js, Express, Python, Flask
- ML models from Hugging Face Transformers
- Vector similarity with pgvector
- Job processing with Bull Queue
- Web archival with Puppeteer

## 📞 Support

For issues and questions, please open an issue on GitHub.
