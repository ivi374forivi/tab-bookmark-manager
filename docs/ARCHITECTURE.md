# Architecture Overview

## System Components

### 1. Browser Extension
- **Purpose**: Capture tabs and bookmarks from the browser
- **Technology**: JavaScript (Chrome Extension API)
- **Features**:
  - Automatic tab capture on creation/update
  - Bookmark synchronization
  - Content extraction from web pages
  - UI for search and suggestions

### 2. Backend API
- **Purpose**: Core application logic and data management
- **Technology**: Node.js, Express
- **Responsibilities**:
  - REST API endpoints
  - Database operations (PostgreSQL)
  - Job queue management (Redis/Bull)
  - Integration with ML service
  - Archive orchestration

### 3. ML Service
- **Purpose**: Natural language processing and content analysis
- **Technology**: Python, Flask
- **Capabilities**:
  - Text summarization (BART model)
  - Content classification
  - Named entity recognition (spaCy)
  - Semantic embeddings (Sentence Transformers)
  - Keyword extraction (TF-IDF)

### 4. Database (PostgreSQL)
- **Purpose**: Persistent data storage
- **Features**:
  - Tab and bookmark metadata
  - Vector embeddings with pgvector
  - Archived content
  - Suggestions and analytics
  - Efficient similarity search

### 5. Job Queue (Redis + Bull)
- **Purpose**: Asynchronous task processing
- **Jobs**:
  - Content analysis
  - Page archival
  - Suggestion generation
  - Background processing

### 6. Archive System
- **Purpose**: Web page preservation
- **Technology**: Puppeteer
- **Outputs**:
  - Full HTML content
  - Screenshots (PNG)
  - PDF documents

## Data Flow

1. **Capture Flow**:
   ```
   Browser → Extension → Backend API → Database
                              ↓
                         Job Queue → ML Service
                              ↓
                         Update Database
   ```

2. **Search Flow**:
   ```
   Extension → Backend API → ML Service (embeddings)
                     ↓
               PostgreSQL (vector search)
                     ↓
               Results → Extension
   ```

3. **Suggestion Flow**:
   ```
   Scheduled Job → Backend → Database Analysis
                      ↓
              Suggestion Service
                      ↓
              Store Suggestions → Notify User
   ```

## Scalability Considerations

- **Horizontal Scaling**: Backend API and ML Service can be scaled independently
- **Database**: PostgreSQL with read replicas for high-traffic scenarios
- **Queue**: Redis cluster for distributed job processing
- **Caching**: Redis for frequently accessed data
- **Load Balancing**: Multiple backend instances behind a load balancer

## Security

- **API Authentication**: JWT tokens (to be implemented)
- **Data Encryption**: SSL/TLS for all communications
- **Input Validation**: Joi schemas for request validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Helmet middleware
