from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from services.nlp_service import NLPService
from services.embeddings_service import EmbeddingsService
from services.classification_service import ClassificationService
import os

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
nlp_service = NLPService()
embeddings_service = EmbeddingsService()
classification_service = ClassificationService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'ml-service'})

@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    """Comprehensive NLP analysis of content"""
    try:
        data = request.json
        text = data.get('text', '')
        url = data.get('url', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Perform all analyses
        summary = nlp_service.summarize(text)
        category = classification_service.classify(text)
        entities = nlp_service.extract_entities(text)
        keywords = nlp_service.extract_keywords(text)
        embedding = embeddings_service.generate_embedding(text)
        
        result = {
            'summary': summary,
            'category': category,
            'entities': entities,
            'keywords': keywords,
            'embedding': embedding
        }
        
        logger.info(f'Analyzed content for URL: {url}')
        return jsonify(result)
        
    except Exception as e:
        logger.error(f'Error analyzing content: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """Generate summary of text"""
    try:
        data = request.json
        text = data.get('text', '')
        max_length = data.get('max_length', 150)
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        summary = nlp_service.summarize(text, max_length=max_length)
        
        return jsonify({'summary': summary})
        
    except Exception as e:
        logger.error(f'Error summarizing: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/classify', methods=['POST'])
def classify():
    """Classify text into categories"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        category = classification_service.classify(text)
        
        return jsonify({'category': category})
        
    except Exception as e:
        logger.error(f'Error classifying: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/entities', methods=['POST'])
def extract_entities():
    """Extract named entities from text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        entities = nlp_service.extract_entities(text)
        
        return jsonify({'entities': entities})
        
    except Exception as e:
        logger.error(f'Error extracting entities: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/embed', methods=['POST'])
def generate_embedding():
    """Generate embedding vector for text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        embedding = embeddings_service.generate_embedding(text)
        
        return jsonify({'embedding': embedding})
        
    except Exception as e:
        logger.error(f'Error generating embedding: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/keywords', methods=['POST'])
def extract_keywords():
    """Extract keywords from text"""
    try:
        data = request.json
        text = data.get('text', '')
        top_n = data.get('top_n', 5)
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        keywords = nlp_service.extract_keywords(text, top_n=top_n)
        
        return jsonify({'keywords': keywords})
        
    except Exception as e:
        logger.error(f'Error extracting keywords: {str(e)}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False') == 'True')
