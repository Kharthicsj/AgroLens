"""
Test script to verify ML API with image URL
"""
import requests
import json

# Configuration
ML_API_URL = "http://localhost:5000"

# Test image URL (using a publicly accessible image)
TEST_IMAGE_URL = "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400"  # Apple image

def test_health_check():
    """Test if ML API is running"""
    print("\n" + "="*60)
    print("Testing ML API Health Check")
    print("="*60)
    
    try:
        response = requests.get(f"{ML_API_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ ML API is online")
            print(f"   Model: {data.get('model')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Classes: {len(data.get('classes', []))}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to ML API: {e}")
        print(f"   Make sure the Flask server is running on {ML_API_URL}")
        return False

def test_prediction_with_url():
    """Test prediction with image URL"""
    print("\n" + "="*60)
    print("Testing Disease Prediction with URL")
    print("="*60)
    
    try:
        print(f"📷 Image URL: {TEST_IMAGE_URL}")
        
        payload = {
            "imageUrl": TEST_IMAGE_URL
        }
        
        response = requests.post(
            f"{ML_API_URL}/api/predict",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                print("\n✅ Prediction successful!")
                print(f"   Disease: {data['prediction']}")
                print(f"   Confidence: {data['confidence_percentage']:.2f}%")
                print(f"   Class Index: {data['class_index']}")
                
                print("\n📊 All Predictions:")
                for i, pred in enumerate(data['all_predictions'][:5], 1):
                    print(f"   {i}. {pred['class']}: {pred['percentage']:.2f}%")
                
                return True
            else:
                print(f"❌ Prediction failed: {data.get('error')}")
                return False
        else:
            print(f"❌ API error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_with_custom_url():
    """Test with user-provided URL"""
    print("\n" + "="*60)
    print("Test with Custom Image URL")
    print("="*60)
    
    url = input("\nEnter image URL (or press Enter to skip): ").strip()
    
    if not url:
        print("Skipped.")
        return
    
    try:
        payload = {"imageUrl": url}
        
        response = requests.post(
            f"{ML_API_URL}/api/predict",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                print("\n✅ Prediction successful!")
                print(f"   Disease: {data['prediction']}")
                print(f"   Confidence: {data['confidence_percentage']:.2f}%")
            else:
                print(f"❌ Prediction failed: {data.get('error')}")
        else:
            print(f"❌ API error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("\n" + "="*60)
    print("🧪 AgroLens ML API Integration Test")
    print("="*60)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n⚠️  ML API is not running. Start it with:")
        print("   python app.py")
        return
    
    # Test 2: Prediction with test URL
    test_prediction_with_url()
    
    # Test 3: Custom URL (optional)
    test_with_custom_url()
    
    print("\n" + "="*60)
    print("✅ Testing Complete!")
    print("="*60)
    print("\nNext Steps:")
    print("1. Start Node.js backend: cd server && npm run dev")
    print("2. Test full integration with Postman or frontend")
    print("3. Configure Cloudinary for image uploads")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
