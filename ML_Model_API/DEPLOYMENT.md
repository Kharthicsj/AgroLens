# 🚀 AgroLens ML API - Render Deployment Guide

## 📋 Prerequisites

1. **Model File**: `best_mobilenetv2.pth` (97 classes, MobileNetV2 architecture)
2. **Class Names**: `class_names.txt` (generated from dataset)
3. **Render Account**: Free tier is sufficient

## 🔧 Pre-Deployment Setup

### Step 1: Generate Class Names File

Run this script locally to extract class names from your dataset:

```bash
cd ML_Model_API
python generate_class_names.py
```

This creates `class_names.txt` with all 97 class names.

### Step 2: Verify Required Files

Ensure these files exist in `ML_Model_API/` directory:

-   ✅ `app.py` (optimized Flask application)
-   ✅ `best_mobilenetv2.pth` (your trained model)
-   ✅ `class_names.txt` (generated class names)
-   ✅ `requirements.txt` (production dependencies)
-   ✅ `Procfile` (Render startup command)
-   ✅ `runtime.txt` (Python version)
-   ✅ `.gitattributes` (Git LFS for large files)

### Step 3: Setup Git LFS (Large File Storage)

Your model file is too large for regular Git. Use Git LFS:

```bash
# Install Git LFS
git lfs install

# Track .pth files
git lfs track "*.pth"

# Add and commit
git add .gitattributes
git add best_mobilenetv2.pth
git commit -m "Add model with Git LFS"
```

## 🌐 Deploy to Render

### Option A: Deploy via GitHub

1. **Push to GitHub**:

    ```bash
    git add .
    git commit -m "Prepare ML API for Render deployment"
    git push origin main
    ```

2. **Create New Web Service on Render**:

    - Go to [Render Dashboard](https://dashboard.render.com/)
    - Click **"New +"** → **"Web Service"**
    - Connect your GitHub repository
    - Select the repository

3. **Configure Service**:

    - **Name**: `agrolens-ml-api`
    - **Root Directory**: `ML_Model_API`
    - **Environment**: `Python 3`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120`
    - **Instance Type**: Free

4. **Environment Variables** (Optional):

    - `MODEL_PATH` = `best_mobilenetv2.pth`
    - `CLASS_NAMES_FILE` = `class_names.txt`
    - `PYTHON_VERSION` = `3.10.12`

5. **Deploy**: Click "Create Web Service"

### Option B: Deploy via render.yaml (Blueprint)

1. Push your code with `render.yaml` included
2. On Render Dashboard, click **"New +"** → **"Blueprint"**
3. Select your repository
4. Render will automatically configure based on `render.yaml`

## 🧪 Testing Your Deployment

### Health Check

```bash
curl https://your-app-name.onrender.com/health
```

Expected response:

```json
{
	"status": "healthy",
	"model_loaded": true,
	"device": "cpu",
	"model_type": "MobileNetV2",
	"num_classes": 97
}
```

### Test Prediction

```bash
curl -X POST https://your-app-name.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/your-image-url.jpg"
  }'
```

Expected response:

```json
{
  "success": true,
  "prediction": "Apple___Apple_scab",
  "confidence": 0.9532,
  "confidence_percentage": 95.32,
  "class_index": 0,
  "all_predictions": [...]
}
```

## 🔗 Update Backend Configuration

Once deployed, update your Node.js backend:

```javascript
// server/.env
ML_API_URL=https://your-app-name.onrender.com
```

Or in your backend code:

```javascript
const ML_API_URL =
	process.env.ML_API_URL || "https://your-app-name.onrender.com";
```

## ⚙️ Configuration Options

### Environment Variables

| Variable           | Default                | Description                                  |
| ------------------ | ---------------------- | -------------------------------------------- |
| `PORT`             | `5000`                 | Server port (Render sets automatically)      |
| `MODEL_PATH`       | `best_mobilenetv2.pth` | Path to model file                           |
| `CLASS_NAMES_FILE` | `class_names.txt`      | Path to class names file                     |
| `DATA_DIR`         | `None`                 | Dataset directory (not needed in production) |

### Gunicorn Settings

Configured in `Procfile`:

-   **Workers**: 2 (suitable for free tier)
-   **Threads**: 4 per worker
-   **Timeout**: 120 seconds (for image processing)
-   **Log Level**: info

## 📊 Performance Considerations

### Free Tier Limitations

-   **Spin Down**: After 15 minutes of inactivity
-   **First Request**: May take 30-60 seconds (cold start)
-   **RAM**: 512 MB (sufficient for CPU inference)
-   **Build Time**: ~5-10 minutes (PyTorch installation)

### Optimization Tips

1. Model is CPU-only for deployment (faster startup)
2. Gunicorn pre-loads model before accepting requests
3. Class names loaded from file (no dataset needed)
4. Image preprocessing optimized for production

## 🐛 Troubleshooting

### Model Not Found

-   Ensure `best_mobilenetv2.pth` is tracked by Git LFS
-   Check file size: `ls -lh best_mobilenetv2.pth`
-   Verify Git LFS: `git lfs ls-files`

### Class Names Not Loading

-   Run `generate_class_names.py` locally
-   Verify `class_names.txt` contains 97 lines
-   Ensure file is committed to Git

### Out of Memory

-   Upgrade to paid tier for more RAM
-   Reduce Gunicorn workers to 1
-   Optimize image size before sending to API

### Slow Cold Starts

-   Expected on free tier (Render spins down after 15 min)
-   Consider upgrading to paid tier for 24/7 uptime
-   Use health check endpoint to keep service warm

## 📝 Deployment Checklist

-   [ ] Run `generate_class_names.py` to create class_names.txt
-   [ ] Install Git LFS: `git lfs install`
-   [ ] Track model file: `git lfs track "*.pth"`
-   [ ] Commit all files including .gitattributes
-   [ ] Push to GitHub
-   [ ] Create Web Service on Render
-   [ ] Configure root directory as `ML_Model_API`
-   [ ] Wait for build to complete (~5-10 min)
-   [ ] Test health endpoint
-   [ ] Test prediction endpoint
-   [ ] Update backend ML_API_URL
-   [ ] Deploy backend to production

## 🎉 Success!

Your ML API is now deployed and accessible at:

-   Health Check: `https://your-app-name.onrender.com/health`
-   Predictions: `https://your-app-name.onrender.com/api/predict`
-   API Info: `https://your-app-name.onrender.com/`

## 📞 Support

For issues:

1. Check Render logs: Dashboard → Service → Logs
2. Verify model file size: Should be ~50-100 MB
3. Test locally: `python app.py` → `curl localhost:5000/health`

---

**Note**: First deployment takes ~5-10 minutes due to PyTorch installation. Subsequent deployments are faster.
