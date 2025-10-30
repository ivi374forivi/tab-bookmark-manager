from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import spacy
from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
import logging

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        logger.info('Initializing NLP Service...')
        
        # Download required NLTK data
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
        except:
            pass
        
        # Initialize summarization model
        try:
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=-1  # CPU
            )
        except Exception as e:
            logger.warning(f'Could not load summarization model: {e}')
            self.summarizer = None
        
        # Initialize spaCy for entity extraction
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except:
            logger.warning('spaCy model not found, downloading...')
            import subprocess
            subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
            self.nlp = spacy.load('en_core_web_sm')
        
        logger.info('NLP Service initialized')
    
    def summarize(self, text, max_length=150, min_length=50):
        """Generate a summary of the text"""
        try:
            if not text or len(text.strip()) < 100:
                return text[:200] if text else ''
            
            if self.summarizer is None:
                # Fallback: return first few sentences
                sentences = sent_tokenize(text)
                return ' '.join(sentences[:3])
            
            # Truncate text if too long
            max_input = 1024
            if len(text) > max_input:
                text = text[:max_input]
            
            summary = self.summarizer(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=False
            )
            
            return summary[0]['summary_text']
            
        except Exception as e:
            logger.error(f'Error summarizing text: {e}')
            # Fallback: return first few sentences
            sentences = sent_tokenize(text)
            return ' '.join(sentences[:3]) if sentences else text[:200]
    
    def extract_entities(self, text):
        """Extract named entities from text"""
        try:
            doc = self.nlp(text[:10000])  # Limit text length
            
            entities = {}
            for ent in doc.ents:
                entity_type = ent.label_
                entity_text = ent.text
                
                if entity_type not in entities:
                    entities[entity_type] = []
                
                if entity_text not in entities[entity_type]:
                    entities[entity_type].append(entity_text)
            
            return entities
            
        except Exception as e:
            logger.error(f'Error extracting entities: {e}')
            return {}
    
    def extract_keywords(self, text, top_n=5):
        """Extract keywords using TF-IDF"""
        try:
            if not text or len(text.strip()) < 50:
                return []
            
            # Use TF-IDF to extract keywords
            vectorizer = TfidfVectorizer(
                max_features=top_n,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            vectors = vectorizer.fit_transform([text])
            keywords = vectorizer.get_feature_names_out()
            
            return list(keywords)
            
        except Exception as e:
            logger.error(f'Error extracting keywords: {e}')
            return []
