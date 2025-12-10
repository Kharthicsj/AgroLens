# 🌱 AgroLens ML API

Production-ready Plant Disease Detection API using MobileNetV2 and PyTorch.

## 🎯 Features

-   ✅ **97 Plant Disease Classes** - Comprehensive disease detection
-   ✅ **MobileNetV2 Architecture** - Optimized for production
-   ✅ **CPU Inference** - Fast and cost-effective
-   ✅ **Cloudinary Integration** - Download images from URLs
-   ✅ **RESTful API** - Easy integration with any frontend/backend
-   ✅ **Production Logging** - Monitor API health and performance
-   ✅ **Dynamic Class Loading** - No hardcoded values

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

2. **Generate Class Names** (first time only):

    ```bash
    python generate_class_names.py
    ```

3. **Run the API**:

    ```bash
    python app.py
    ```

4. **Test**:
    ```bash
    curl http://localhost:5000/health
    ```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Render deployment guide.

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
	"status": "healthy",
	"model_loaded": true,
	"device": "cpu",
	"model_type": "MobileNetV2",
	"num_classes": 97
}
```

### Get Classes

```http
GET /api/classes
```

Response:

```json
{
  "success": true,
  "classes": ["Apple___Apple_scab", "Apple___Black_rot", ...],
  "num_classes": 97
}
```

### Disease Detection

```http
POST /api/predict
Content-Type: application/json

{
  "imageUrl": "https://res.cloudinary.com/your-image.jpg"
}
```

Response:

```json
{
  "success": true,
  "prediction": "Apple___Apple_scab",
  "confidence": 0.9532,
  "confidence_percentage": 95.32,
  "class_index": 0,
  "all_predictions": [
    {
      "class": "Apple___Apple_scab",
      "confidence": 0.9532,
      "percentage": 95.32
    },
    ...
  ]
}
```

## 🏗️ Architecture

### Model

-   **Type**: MobileNetV2 (transfer learning)
-   **Classes**: 97 plant diseases
-   **Input**: 224x224 RGB images
-   **Preprocessing**: ImageNet normalization

### Stack

-   **Framework**: Flask 3.0.0
-   **Server**: Gunicorn (production)
-   **ML**: PyTorch 2.5.1 (CPU)
-   **Image Processing**: Pillow 10.1.0

## 📁 Project Structure

```
ML_Model_API/
├── app.py                      # Main Flask application
├── best_mobilenetv2.pth       # Trained model (Git LFS)
├── class_names.txt            # Disease class names (97 lines)
├── requirements.txt           # Production dependencies
├── Procfile                   # Render startup command
├── runtime.txt                # Python version
├── render.yaml                # Render blueprint
├── generate_class_names.py   # Script to extract class names
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

| Variable           | Default                | Description                  |
| ------------------ | ---------------------- | ---------------------------- |
| `PORT`             | `5000`                 | Server port                  |
| `MODEL_PATH`       | `best_mobilenetv2.pth` | Model file path              |
| `CLASS_NAMES_FILE` | `class_names.txt`      | Class names file             |
| `DATA_DIR`         | `None`                 | Dataset directory (dev only) |

### Local Development

```bash
export PORT=5000
export MODEL_PATH=best_mobilenetv2.pth
python app.py
```

### Production (Render)

Render automatically sets `PORT`. Other variables are optional.

## 🧪 Testing

### Test Script

```bash
python test_ml_api_url.py
```

### Manual Test with cURL

```bash
# Health check
curl http://localhost:5000/health

# Get classes
curl http://localhost:5000/api/classes

# Predict from URL
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/plant.jpg"}'
```

## 📊 Performance

### Inference Time

-   **CPU**: ~500ms per image
-   **Batch Processing**: Not implemented (single image API)

### Resource Usage

-   **RAM**: ~300-400 MB (model loaded)
-   **Disk**: ~50-100 MB (model file)

### Scalability

-   **Gunicorn Workers**: 2 (free tier)
-   **Threads per Worker**: 4
-   **Max Timeout**: 120 seconds

## 🔒 Security

-   ✅ CORS enabled for all origins (adjust for production)
-   ✅ Request timeout: 10 seconds for image downloads
-   ✅ Error handling: No sensitive information in errors
-   ✅ Input validation: Checks for required fields

## 📝 Class Names

The API supports 97 plant disease classes including:

-   Apple diseases (scab, black rot, cedar rust, healthy)
-   Tomato diseases (bacterial spot, early blight, late blight, etc.)
-   Grape diseases (black rot, esca, leaf blight, healthy)
-   Corn diseases (cercospora, common rust, northern leaf blight, healthy)
-   And many more...

See `class_names.txt` for complete list.

## 🐛 Troubleshooting

### Model Not Loading

-   Verify `best_mobilenetv2.pth` exists
-   Check file integrity: Should be ~50-100 MB
-   Ensure Git LFS is installed: `git lfs install`

### Class Names Not Found

-   Run `generate_class_names.py` first
-   Verify `class_names.txt` has 97 lines
-   Check file encoding (should be UTF-8)

### Import Errors

-   Install all dependencies: `pip install -r requirements.txt`
-   Use Python 3.10.x (specified in `runtime.txt`)

### Out of Memory

-   Model requires ~400 MB RAM minimum
-   Upgrade to paid tier if on free tier
-   Reduce Gunicorn workers to 1

## 📚 Documentation

-   [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment to Render
-   [API Documentation](./API.md) - Detailed API reference (if needed)

## 🤝 Integration

### Node.js Backend

```javascript
const ML_API_URL = "https://your-app.onrender.com";

async function detectDisease(imageUrl) {
	const response = await axios.post(`${ML_API_URL}/api/predict`, {
		imageUrl,
	});
	return response.data;
}
```

### React Native Frontend

```javascript
const diseaseAPI = {
	detect: async (imageUrl) => {
		const response = await fetch(
			"https://your-app.onrender.com/api/predict",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageUrl }),
			},
		);
		return response.json();
	},
};
```

## 📄 License

Part of AgroLens Project - Agricultural AI Assistant

## 👨‍💻 Author

Developed for full-stack agricultural disease detection system.

---

**Ready for Production** ✅ | **Render Optimized** 🚀 | **97 Classes** 🌿
