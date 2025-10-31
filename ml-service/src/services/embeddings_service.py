from sentence_transformers import SentenceTransformer
import logging
import numpy as np

logger = logging.getLogger(__name__)

class EmbeddingsService:
    def __init__(self):
        logger.info('Initializing Embeddings Service...')
        
        # Initialize sentence transformer model
        # Using a lightweight model for efficiency
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        logger.info('Embeddings Service initialized')
    
    def generate_embedding(self, text):
        """Generate embedding vector for text"""
        try:
            if not text or len(text.strip()) == 0:
                # Return zero vector for empty text
                return [0.0] * 384
            
            # Truncate text if too long
            max_length = 512
            if len(text) > max_length:
                text = text[:max_length]
            
            # Generate embedding
            embedding = self.model.encode(text, convert_to_numpy=True)
            
            # Convert to list for JSON serialization
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f'Error generating embedding: {e}')
            # Return zero vector on error
            return [0.0] * 384
    
    def compute_similarity(self, embedding1, embedding2):
        """Compute cosine similarity between two embeddings"""
        try:
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)
            
            # Cosine similarity
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f'Error computing similarity: {e}')
            return 0.0
