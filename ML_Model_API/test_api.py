"""
Test ML API locally or on Render
Usage: python test_api.py [API_URL]
"""
import requests
import sys
import json

def test_health(api_url):
    """Test health endpoint"""
    print(f"\n{'='*60}")
    print("Testing Health Endpoint")
    print(f"{'='*60}")
    try:
        response = requests.get(f"{api_url}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(json.dumps(data, indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_classes(api_url):
    """Test classes endpoint"""
    print(f"\n{'='*60}")
    print("Testing Classes Endpoint")
    print(f"{'='*60}")
    try:
        response = requests.get(f"{api_url}/api/classes", timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Classes: {data.get('num_classes', 0)}")
        print(f"First 5 Classes:")
        for i, cls in enumerate(data.get('classes', [])[:5], 1):
            print(f"  {i}. {cls}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict(api_url, image_url=None):
    """Test prediction endpoint"""
    print(f"\n{'='*60}")
    print("Testing Prediction Endpoint")
    print(f"{'='*60}")
    
    # Use a sample image URL (Cloudinary test image)
    if not image_url:
        image_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    
    print(f"Image URL: {image_url}")
    
    try:
        response = requests.post(
            f"{api_url}/api/predict",
            json={"imageUrl": image_url},
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        
        if data.get('success'):
            print(f"\n✅ Prediction: {data.get('prediction')}")
            print(f"   Confidence: {data.get('confidence_percentage', 0):.2f}%")
            print(f"   Class Index: {data.get('class_index')}")
            print(f"\nTop 5 Predictions:")
            for i, pred in enumerate(data.get('all_predictions', [])[:5], 1):
                print(f"  {i}. {pred['class']}: {pred['percentage']:.2f}%")
        else:
            print(f"❌ Prediction Failed: {data.get('error', 'Unknown error')}")
        
        return response.status_code == 200 and data.get('success', False)
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    # Get API URL from command line or use localhost
    api_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    print(f"\n{'='*60}")
    print(f"🧪 Testing AgroLens ML API")
    print(f"{'='*60}")
    print(f"API URL: {api_url}\n")
    
    # Run tests
    results = {
        'health': test_health(api_url),
        'classes': test_classes(api_url),
        'predict': test_predict(api_url)
    }
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test.capitalize()}: {status}")
    
    all_passed = all(results.values())
    print(f"\n{'='*60}")
    if all_passed:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the logs above.")
    print(f"{'='*60}\n")
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("AgroLens ML API Test Suite")
    print("="*60)
    print("\nUsage:")
    print("  Local:      python test_api.py")
    print("  Production: python test_api.py https://your-app.onrender.com")
    print("\nPress Ctrl+C to cancel...\n")
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Tests cancelled by user")
        sys.exit(1)
