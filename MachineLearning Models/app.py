import os
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

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend communication

# Configuration
MODEL_PATH = 'best_mobilenetv2.pth'
DATA_DIR = r"E:\data\dataset_split"  # Path to dataset directory

# Auto-detect number of classes from model
def detect_num_classes():
    """Detect number of classes from the saved model"""
    try:
        state_dict = torch.load(MODEL_PATH, map_location='cpu', weights_only=False)
        classifier_weight = state_dict['classifier.1.weight']
        num_classes = classifier_weight.shape[0]
        print(f"Detected {num_classes} classes from model")
        return num_classes
    except Exception as e:
        print(f"Could not auto-detect classes: {e}")
        return 97  # Default fallback

def load_class_names():
    """Load class names from the dataset directory (same as test_controller.py)"""
    try:
        train_dir = os.path.join(DATA_DIR, "train")
        if os.path.exists(train_dir):
            class_names = sorted([d for d in os.listdir(train_dir) 
                                 if os.path.isdir(os.path.join(train_dir, d))])
            print(f"✓ Loaded {len(class_names)} class names from dataset")
            return class_names
        else:
            print(f"⚠️ Warning: Training directory not found at {train_dir}")
            num_classes = detect_num_classes()
            return [f"Class_{i}" for i in range(num_classes)]
    except Exception as e:
        print(f"⚠️ Could not load class names: {e}")
        num_classes = detect_num_classes()
        return [f"Class_{i}" for i in range(num_classes)]

NUM_CLASSES = detect_num_classes()
CLASS_NAMES = load_class_names()

# Validate class names match model
if len(CLASS_NAMES) != NUM_CLASSES:
    print(f"⚠️ Warning: CLASS_NAMES count ({len(CLASS_NAMES)}) doesn't match NUM_CLASSES ({NUM_CLASSES})")
    print(f"   Using first {NUM_CLASSES} class names")
    CLASS_NAMES = CLASS_NAMES[:NUM_CLASSES] if len(CLASS_NAMES) > NUM_CLASSES else CLASS_NAMES + [f"Class_{i}" for i in range(len(CLASS_NAMES), NUM_CLASSES)]

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
print("Loading MobileNetV2 model...")
device = torch.device('cpu')  # Force CPU for deployment stability
model = create_model()

try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device, weights_only=False))
    model.to(device)
    model.eval()  # Set to evaluation mode
    print(f"✓ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"✗ Error loading model: {e}")
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
                print(f"📥 Downloading image from URL: {image_url[:50]}...")
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
            return jsonify({
                'success': False,
                'error': 'No image provided. Send JSON with imageUrl or upload image file'
            }), 400
        
        print(f"🔄 Processing image (source: {source_type})...")
        
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
        
        print(f"✅ Prediction: {predicted_class_name} ({confidence_score*100:.2f}%)")
        
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
        print(f"❌ Error: {str(e)}")
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
    print(f"\n{'='*50}")
    print(f"🚀 Plant Disease Detection API Server")
    print(f"{'='*50}")
    print(f"Model: MobileNetV2")
    print(f"Device: {device}")
    print(f"Classes: {len(CLASS_NAMES)}")
    print(f"Port: 5000")
    print(f"{'='*50}\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
