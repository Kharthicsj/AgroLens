import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import json

class DiseaseDetectionModel:
    def __init__(self, model_path='best_mobilenetv2.pth', num_classes=None, data_dir=r"E:\data\dataset_split"):
        """
        Initialize the disease detection model
        
        Args:
            model_path: Path to the trained model weights
            num_classes: Number of disease classes (auto-detected if None)
            data_dir: Path to dataset directory to extract class names
        """
        self.model_path = model_path
        self.data_dir = data_dir
        self.device = self._setup_device()
        self.num_classes = num_classes if num_classes else self._detect_num_classes()
        self.class_names = self._load_class_names()
        self.model = self._load_model()
        self.transform = self._get_transforms()
        
    def _setup_device(self):
        """Setup the device (DirectML/CUDA/CPU)"""
        try:
            import torch_directml
            device = torch_directml.device()
            print("Using device: DirectML (AMD GPU)")
        except ImportError:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            print(f"Using device: {device}")
        return device
    
    def _detect_num_classes(self):
        """Detect number of classes from the saved model"""
        try:
            state_dict = torch.load(self.model_path, map_location='cpu', weights_only=False)
            # Get the classifier weight shape
            classifier_weight = state_dict['classifier.1.weight']
            num_classes = classifier_weight.shape[0]
            print(f"Detected {num_classes} classes from model")
            return num_classes
        except Exception as e:
            print(f"Could not auto-detect classes: {e}")
            return 38  # Default fallback
    
    def _load_class_names(self):
        """Load class names from the dataset directory"""
        try:
            train_dir = os.path.join(self.data_dir, "train")
            if os.path.exists(train_dir):
                class_names = sorted([d for d in os.listdir(train_dir) 
                                     if os.path.isdir(os.path.join(train_dir, d))])
                print(f"Loaded {len(class_names)} class names")
                return class_names
            else:
                print(f"Warning: Training directory not found at {train_dir}")
                return [f"Class_{i}" for i in range(self.num_classes)]
        except Exception as e:
            print(f"Could not load class names: {e}")
            return [f"Class_{i}" for i in range(self.num_classes)]
    
    def _load_model(self):
        """Load the trained MobileNetV2 model"""
        print(f"Loading model from {self.model_path}...")
        
        # Create model architecture
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, self.num_classes)
        
        # Load trained weights
        try:
            state_dict = torch.load(self.model_path, map_location='cpu', weights_only=False)
            model.load_state_dict(state_dict)
            model.to(self.device)
            model.eval()
            print("✓ Model loaded successfully")
            return model
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            raise
    
    def _get_transforms(self):
        """Get image transformation pipeline"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                               [0.229, 0.224, 0.225])
        ])
    
    def predict_image(self, image_path):
        """
        Predict disease from a single image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            dict: Prediction results with class index, class name, confidence, and probabilities
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0)
        image_tensor = image_tensor.to(self.device)
        
        # Make prediction
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)
        
        predicted_idx = predicted_class.item()
        predicted_name = self.class_names[predicted_idx] if predicted_idx < len(self.class_names) else f"Class_{predicted_idx}"
        
        return {
            'predicted_class': predicted_idx,
            'predicted_name': predicted_name,
            'confidence': confidence.item(),
            'all_probabilities': probabilities.cpu().numpy()[0].tolist()
        }
    
    def predict_batch(self, image_paths):
        """
        Predict diseases from multiple images
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            list: List of prediction results
        """
        results = []
        for image_path in image_paths:
            try:
                result = self.predict_image(image_path)
                result['image_path'] = image_path
                results.append(result)
            except Exception as e:
                results.append({
                    'image_path': image_path,
                    'error': str(e)
                })
        return results
    
    def get_top_k_predictions(self, image_path, k=5):
        """
        Get top K predictions for an image
        
        Args:
            image_path: Path to the image file
            k: Number of top predictions to return
            
        Returns:
            list: Top K predictions with class indices, names, and confidences
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0)
        image_tensor = image_tensor.to(self.device)
        
        # Make prediction
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            top_probs, top_indices = torch.topk(probabilities, k)
        
        top_predictions = []
        for i in range(k):
            class_idx = top_indices[0][i].item()
            class_name = self.class_names[class_idx] if class_idx < len(self.class_names) else f"Class_{class_idx}"
            top_predictions.append({
                'class_index': class_idx,
                'class_name': class_name,
                'confidence': top_probs[0][i].item()
            })
        
        return top_predictions


def main():
    """Main function to demonstrate model testing"""
    
    # Initialize the model
    print("=" * 60)
    print("Disease Detection Model Testing")
    print("=" * 60)
    
    try:
        detector = DiseaseDetectionModel(
            model_path='best_mobilenetv2.pth'
            # num_classes will be auto-detected from the model
        )
    except Exception as e:
        print(f"Failed to initialize model: {e}")
        return
    
    print("\n" + "=" * 60)
    print("Model is ready for predictions!")
    print("=" * 60)
    
    # Interactive mode - ask user for image path
    print("\n📸 Enter the path to an image to analyze")
    print("   (or type 'exit' to quit)")
    print("-" * 60)
    
    while True:
        image_path = input("\nImage path: ").strip()
        
        if image_path.lower() in ['exit', 'quit', 'q']:
            print("\n👋 Goodbye!")
            break
        
        if not image_path:
            print("⚠️  Please enter a valid image path")
            continue
        
        # Remove quotes if user copied path with quotes
        image_path = image_path.strip('"').strip("'")
        
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            print("   Please check the path and try again")
            continue
        
        try:
            print(f"\n🔍 Analyzing image: {os.path.basename(image_path)}")
            print("=" * 60)
            
            # Get prediction
            result = detector.predict_image(image_path)
            
            print(f"\n✅ PREDICTION RESULT:")
            print(f"   Disease Detected: {result['predicted_name']}")
            print(f"   Confidence: {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
            print(f"   Class Index: {result['predicted_class']}")
            
            # Show confidence level
            confidence_pct = result['confidence'] * 100
            if confidence_pct >= 90:
                confidence_level = "🟢 Very High"
            elif confidence_pct >= 75:
                confidence_level = "🟡 High"
            elif confidence_pct >= 60:
                confidence_level = "🟠 Moderate"
            else:
                confidence_level = "🔴 Low"
            print(f"   Confidence Level: {confidence_level}")
            
            # Get top 5 predictions
            print(f"\n📊 Top 5 Possible Diagnoses:")
            top_predictions = detector.get_top_k_predictions(image_path, k=5)
            for i, pred in enumerate(top_predictions, 1):
                bar_length = int(pred['confidence'] * 40)
                bar = "█" * bar_length + "░" * (40 - bar_length)
                print(f"   {i}. {pred['class_name']}")
                print(f"      {bar} {pred['confidence']:.4f} ({pred['confidence']*100:.2f}%)")
            
            print("\n" + "=" * 60)
            
        except Exception as e:
            print(f"❌ Error processing image: {e}")
            print("   Please try another image")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
