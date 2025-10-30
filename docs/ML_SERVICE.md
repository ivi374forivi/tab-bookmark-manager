# ML Service Documentation

## Overview

The ML Service provides NLP capabilities for analyzing tab and bookmark content. It's built with Flask and uses state-of-the-art models for various tasks.

## Models Used

### 1. Summarization
- **Model**: facebook/bart-large-cnn
- **Purpose**: Generate concise summaries of web page content
- **Input**: Text content (up to 1024 tokens)
- **Output**: Summary (50-150 words)

### 2. Embeddings
- **Model**: all-MiniLM-L6-v2 (Sentence Transformers)
- **Purpose**: Generate 384-dimensional vectors for semantic search
- **Input**: Text content (up to 512 characters)
- **Output**: Vector embedding

### 3. Named Entity Recognition
- **Model**: spaCy en_core_web_sm
- **Purpose**: Extract entities (people, organizations, locations, etc.)
- **Input**: Text content
- **Output**: Dictionary of entity types and values

### 4. Classification
- **Method**: Keyword-based classification
- **Categories**:
  - Technology
  - News
  - Education
  - Entertainment
  - Business
  - Social
  - Shopping
  - Health
  - Science
  - Other

### 5. Keyword Extraction
- **Method**: TF-IDF with sklearn
- **Purpose**: Extract important keywords from content
- **Output**: Top N keywords (default: 5)

## API Endpoints

### Comprehensive Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "text": "Your content here",
  "url": "https://example.com"
}

Response:
{
  "summary": "...",
  "category": "Technology",
  "entities": {...},
  "keywords": [...],
  "embedding": [...]
}
```

### Summarization
```http
POST /api/summarize
Content-Type: application/json

{
  "text": "Long text to summarize",
  "max_length": 150
}

Response:
{
  "summary": "Concise summary"
}
```

### Classification
```http
POST /api/classify
Content-Type: application/json

{
  "text": "Content to classify"
}

Response:
{
  "category": "Technology"
}
```

### Entity Extraction
```http
POST /api/entities
Content-Type: application/json

{
  "text": "Content with entities"
}

Response:
{
  "entities": {
    "PERSON": ["John Doe"],
    "ORG": ["Company Name"],
    "GPE": ["New York"]
  }
}
```

### Embedding Generation
```http
POST /api/embed
Content-Type: application/json

{
  "text": "Text to embed"
}

Response:
{
  "embedding": [0.123, -0.456, ...]
}
```

### Keyword Extraction
```http
POST /api/keywords
Content-Type: application/json

{
  "text": "Content for keyword extraction",
  "top_n": 5
}

Response:
{
  "keywords": ["keyword1", "keyword2", ...]
}
```

## Performance Considerations

- **Model Loading**: Models are loaded once at startup
- **Batch Processing**: Consider batching requests for better throughput
- **GPU Support**: Models use CPU by default; can be configured for GPU
- **Text Length**: Long texts are automatically truncated
- **Caching**: Consider implementing result caching for repeated content

## Error Handling

All endpoints return standard error responses:
```json
{
  "error": "Error message description"
}
```

## Monitoring

- Health check endpoint: `GET /health`
- Logs: INFO level by default
- Metrics: Consider adding Prometheus metrics for production

## Future Improvements

1. Add custom fine-tuned models for better classification
2. Implement batch processing endpoints
3. Add model versioning and A/B testing
4. GPU support for faster inference
5. Caching layer for repeated analyses
6. Support for multiple languages
