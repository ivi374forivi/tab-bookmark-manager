from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import logging
import pickle
import os

logger = logging.getLogger(__name__)

class ClassificationService:
    def __init__(self):
        logger.info('Initializing Classification Service...')
        
        # Define categories
        self.categories = [
            'Technology',
            'News',
            'Education',
            'Entertainment',
            'Business',
            'Social',
            'Shopping',
            'Health',
            'Science',
            'Other'
        ]
        
        # Initialize simple keyword-based classifier
        self.keyword_map = {
            'Technology': ['software', 'programming', 'code', 'tech', 'computer', 'api', 'developer', 'github', 'python', 'javascript'],
            'News': ['news', 'article', 'report', 'breaking', 'update', 'media', 'press'],
            'Education': ['learn', 'tutorial', 'course', 'education', 'study', 'school', 'university', 'training'],
            'Entertainment': ['movie', 'music', 'video', 'game', 'entertainment', 'show', 'series', 'film'],
            'Business': ['business', 'finance', 'market', 'stock', 'company', 'corporate', 'startup', 'investment'],
            'Social': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'network', 'community'],
            'Shopping': ['shop', 'buy', 'purchase', 'store', 'product', 'price', 'cart', 'amazon'],
            'Health': ['health', 'medical', 'fitness', 'wellness', 'doctor', 'medicine', 'exercise'],
            'Science': ['science', 'research', 'study', 'experiment', 'data', 'analysis', 'academic']
        }
        
        logger.info('Classification Service initialized')
    
    def classify(self, text):
        """Classify text into a category"""
        try:
            if not text or len(text.strip()) == 0:
                return 'Other'
            
            text_lower = text.lower()
            
            # Score each category based on keyword matches
            scores = {}
            for category, keywords in self.keyword_map.items():
                score = sum(1 for keyword in keywords if keyword in text_lower)
                scores[category] = score
            
            # Get category with highest score
            max_score = max(scores.values())
            
            if max_score == 0:
                return 'Other'
            
            best_category = max(scores.items(), key=lambda x: x[1])[0]
            
            return best_category
            
        except Exception as e:
            logger.error(f'Error classifying text: {e}')
            return 'Other'
    
    def get_categories(self):
        """Get list of available categories"""
        return self.categories
