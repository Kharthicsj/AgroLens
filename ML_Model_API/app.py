import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import base64
import requests
from io import BytesIO

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS Configuration - Allow all origins for development/production
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Configuration - Use environment variables for production
MODEL_PATH = os.getenv('MODEL_PATH', 'best_mobilenetv2.pth')
DATA_DIR = os.getenv('DATA_DIR', None)  # Optional dataset directory
CLASS_NAMES_FILE = os.getenv('CLASS_NAMES_FILE', 'class_names.txt')
PORT = int(os.getenv('PORT', 5000))

# Auto-detect number of classes from model
def detect_num_classes():
    """Detect number of classes from the saved model"""
    try:
        state_dict = torch.load(MODEL_PATH, map_location='cpu', weights_only=False)
        classifier_weight = state_dict['classifier.1.weight']
        num_classes = classifier_weight.shape[0]
        logger.info(f"Detected {num_classes} classes from model")
        return num_classes
    except Exception as e:
        logger.error(f"Could not auto-detect classes: {e}")
        return 97  # Default fallback

def load_class_names():
    """Load class names from file (production) or dataset directory (development)"""
    # Priority 1: Load from class_names.txt file (for production deployment)
    if os.path.exists(CLASS_NAMES_FILE):
        try:
            with open(CLASS_NAMES_FILE, 'r', encoding='utf-8') as f:
                class_names = [line.strip() for line in f if line.strip()]
            logger.info(f"✓ Loaded {len(class_names)} class names from {CLASS_NAMES_FILE}")
            return class_names
        except Exception as e:
            logger.warning(f"Could not load from {CLASS_NAMES_FILE}: {e}")
    
    # Priority 2: Load from dataset directory (for development)
    if DATA_DIR:
        try:
            train_dir = os.path.join(DATA_DIR, "train")
            if os.path.exists(train_dir):
                class_names = sorted([d for d in os.listdir(train_dir) 
                                     if os.path.isdir(os.path.join(train_dir, d))])
                logger.info(f"✓ Loaded {len(class_names)} class names from dataset")
                
                # Save to file for future use
                try:
                    with open(CLASS_NAMES_FILE, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(class_names))
                    logger.info(f"✓ Saved class names to {CLASS_NAMES_FILE}")
                except Exception as e:
                    logger.warning(f"Could not save class names: {e}")
                
                return class_names
        except Exception as e:
            logger.warning(f"Could not load from dataset: {e}")
    
    # Priority 3: Fallback to generic class names
    logger.warning("Using fallback class names")
    num_classes = detect_num_classes()
    return [f"Class_{i}" for i in range(num_classes)]

NUM_CLASSES = detect_num_classes()
CLASS_NAMES = load_class_names()

# Validate class names match model
if len(CLASS_NAMES) != NUM_CLASSES:
    logger.warning(f"CLASS_NAMES count ({len(CLASS_NAMES)}) doesn't match NUM_CLASSES ({NUM_CLASSES})")
    if len(CLASS_NAMES) > NUM_CLASSES:
        CLASS_NAMES = CLASS_NAMES[:NUM_CLASSES]
        logger.info(f"Trimmed to first {NUM_CLASSES} class names")
    else:
        CLASS_NAMES = CLASS_NAMES + [f"Class_{i}" for i in range(len(CLASS_NAMES), NUM_CLASSES)]
        logger.info(f"Added generic names for remaining classes")

# Image preprocessing pipeline (matching training pipeline)
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Initialize model architecture (MobileNetV2)
def create_model():
    """Create MobileNetV2 model with modified classifier"""
    model = models.mobilenet_v2(weights=None)  # Updated API - no pretrained parameter
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, NUM_CLASSES)
    return model

# Load model once at startup
logger.info("Loading MobileNetV2 model...")
device = torch.device('cpu')  # Force CPU for deployment stability
model = create_model()

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device, weights_only=False))
    model.to(device)
    model.eval()  # Set to evaluation mode
    logger.info(f"✓ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    logger.error(f"✗ Error loading model: {e}")
    raise

def download_image_from_url(image_url):
    """Download image from URL (Cloudinary or any URL)"""
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e:
        raise Exception(f"Failed to download image from URL: {str(e)}")

def preprocess_image(image_bytes):
    """Convert uploaded image bytes to preprocessed tensor"""
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply transformations
    image_tensor = image_transform(image)
    
    # Add batch dimension [1, 3, 224, 224]
    image_tensor = image_tensor.unsqueeze(0)
    
    return image_tensor

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'Plant Disease Detection API',
        'model': 'MobileNetV2',
        'classes': CLASS_NAMES,
        'version': '1.0'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to receive image and return prediction
    Accepts:
    1. JSON with 'imageUrl' field (Cloudinary URL from Node.js)
    2. multipart/form-data with 'image' or 'file' field (direct upload)
    3. JSON with base64 encoded image
    Returns: JSON with prediction, confidence_score, and class_index
    """
    try:
        image_bytes = None
        source_type = None
        
        # Priority 1: Handle JSON with imageUrl (from Node.js backend)
        if request.is_json:
            data = request.get_json()
            
            # Check for Cloudinary URL
            if 'imageUrl' in data:
                image_url = data['imageUrl']
                logger.info(f"📥 Downloading image from URL: {image_url[:50]}...")
                image_bytes = download_image_from_url(image_url)
                source_type = 'url'
            
            # Check for base64 image
            elif 'image' in data:
                image_data = data['image']
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                source_type = 'base64'
        
        # Priority 2: Handle multipart/form-data (direct file upload)
        elif 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                image_bytes = file.read()
                source_type = 'file'
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                image_bytes = file.read()
                source_type = 'file'
        
        if image_bytes is None:
            logger.warning("No image provided in request")
            return jsonify({
                'success': False,
                'error': 'No image provided. Send JSON with imageUrl or upload image file'
            }), 400
        
        logger.info(f"🔄 Processing image (source: {source_type})...")
        
        # Preprocess image
        image_tensor = preprocess_image(image_bytes)
        image_tensor = image_tensor.to(device)
        
        # Perform inference
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
            # Get all class probabilities for detailed response
            all_probabilities = probabilities[0].cpu().numpy()
            
            predicted_class_idx = predicted_idx.item()
            confidence_score = confidence.item()
            
            # Handle dynamic class names
            if predicted_class_idx < len(CLASS_NAMES):
                predicted_class_name = CLASS_NAMES[predicted_class_idx]
            else:
                predicted_class_name = f"Class_{predicted_class_idx}"
        
        logger.info(f"✅ Prediction: {predicted_class_name} ({confidence_score*100:.2f}%)")
        
        # Return prediction results (Node.js friendly format)
        return jsonify({
            'success': True,
            'prediction': predicted_class_name,
            'confidence': float(confidence_score),
            'confidence_percentage': float(confidence_score * 100),
            'class_index': int(predicted_class_idx),
            'all_predictions': [
                {
                    'class': CLASS_NAMES[i] if i < len(CLASS_NAMES) else f"Class_{i}",
                    'confidence': float(all_probabilities[i]),
                    'percentage': float(all_probabilities[i] * 100)
                }
                for i in range(len(all_probabilities))
            ]
        }), 200
    
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error processing image: {str(e)}'
        }), 500

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Return list of available classes"""
    return jsonify({
        'success': True,
        'classes': CLASS_NAMES,
        'num_classes': len(CLASS_NAMES)
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Detailed health check for monitoring"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(device),
        'model_type': 'MobileNetV2',
        'num_classes': len(CLASS_NAMES)
    })

if __name__ == '__main__':
    # Run Flask app
    logger.info(f"\n{'='*50}")
    logger.info(f"🚀 Plant Disease Detection API Server")
    logger.info(f"{'='*50}")
    logger.info(f"Model: MobileNetV2")
    logger.info(f"Device: {device}")
    logger.info(f"Classes: {len(CLASS_NAMES)}")
    logger.info(f"Port: {PORT}")
    logger.info(f"Environment: {'Production' if os.getenv('RENDER') else 'Development'}")
    logger.info(f"{'='*50}\n")
    app.run(host='0.0.0.0', port=PORT, debug=False, threaded=True)
