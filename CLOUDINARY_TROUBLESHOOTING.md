# Cloudinary Upload Troubleshooting Guide

## Common Error: "Failed to upload image to Cloudinary"

### ✅ Step 1: Verify Cloudinary Credentials on Render

1. Login to [Render Dashboard](https://dashboard.render.com)
2. Select your **Backend Service** (agrolensbackend)
3. Click **Environment** tab
4. Verify these variables exist:
    ```
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

### ✅ Step 2: Get Cloudinary Credentials

1. Login to [Cloudinary Console](https://cloudinary.com/console)
2. On Dashboard, you'll see:
    - **Cloud Name**: (example: `dxxxx`)
    - **API Key**: (example: `123456789012345`)
    - **API Secret**: Click "👁 Reveal" to see it

### ✅ Step 3: Add Credentials to Render

**Important**: After adding environment variables, you must redeploy:

1. Go to Render Dashboard → Backend Service
2. Click **Environment** tab
3. Add the three variables above
4. Click **Save Changes**
5. Click **Manual Deploy** → **Deploy latest commit**
6. Wait for deployment to complete (2-3 minutes)

### ✅ Step 4: Verify Backend Logs

After redeploying, test again and check logs:

1. Go to Render Dashboard → Backend Service
2. Click **Logs** tab
3. Look for these messages when uploading:
    ```
    ☁️  Cloudinary config check: ✅ All credentials present
    📤 Uploading to Cloudinary folder: AgroLens/disease-detection/...
    ✅ Cloudinary upload successful!
    ```

### ❌ Error Messages & Solutions

#### Error: "Cloudinary credentials are not configured"

**Cause**: Missing environment variables on Render

**Solution**:

1. Add all three Cloudinary variables to Render
2. Redeploy the service
3. Test again

---

#### Error: "Invalid image format"

**Cause**: Image data is corrupted or invalid base64

**Solution**:

1. Try with a different image
2. Ensure image is JPEG or PNG
3. Check image file size (max 10MB)

---

#### Error: "Upload timeout"

**Cause**: Image too large or slow network

**Solution**:

1. Use smaller image (< 5MB recommended)
2. Check Cloudinary storage quota
3. Try again (may be temporary network issue)

---

#### Error: "Invalid Cloudinary credentials"

**Cause**: Wrong API key or secret

**Solution**:

1. Double-check credentials from Cloudinary dashboard
2. Ensure no extra spaces in environment variables
3. Copy-paste carefully (API secret is case-sensitive)

---

## 🧪 Test Cloudinary Upload Manually

### Using curl (from terminal):

```bash
curl -X POST https://agrolensbackend.onrender.com/api/disease/detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "cropType": "test"
  }'
```

Replace `YOUR_JWT_TOKEN` with actual token from login.

---

## 📊 Cloudinary Dashboard Checks

### 1. Verify Storage Quota

-   Login to Cloudinary Console
-   Check **Usage** section
-   Free tier: **25GB storage**, **25GB bandwidth/month**
-   If exceeded, upgrade or clean up old images

### 2. Check Upload Settings

-   Go to **Settings** → **Upload**
-   Ensure **Unsigned uploads** are allowed (optional)
-   Check **Upload presets** if using custom settings

### 3. View Uploaded Images

-   Go to **Media Library**
-   Navigate to `AgroLens/disease-detection/` folder
-   Should see uploaded images by userId

---

## 🔍 Debug Mode: Check What's Being Sent

Add this to your backend temporarily to log image data:

```javascript
// In diseaseDetection.js, add before Cloudinary upload:
console.log("🔍 DEBUG - Image info:", {
	hasDataURI: base64Data.startsWith("data:image"),
	length: base64Data.length,
	prefix: base64Data.substring(0, 50),
});
```

Expected output:

```
🔍 DEBUG - Image info: {
  hasDataURI: true,
  length: 245678,
  prefix: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASAB...'
}
```

---

## 🆘 Still Not Working?

### Check Backend Logs in Real-Time:

```bash
# Terminal command
curl -N https://agrolensbackend.onrender.com/
```

Or use Render Dashboard → Logs tab

### Common Issues:

1. **Render Free Tier Sleep**: Service wakes up in 50-90 seconds
2. **MongoDB Connection**: Check if MongoDB Atlas is accessible
3. **CORS Issues**: Should be fixed, but check browser console
4. **Image Format**: Only JPEG, PNG, WebP supported

---

## 📞 Need More Help?

1. **Check Render Logs**: Most detailed error information
2. **Check Cloudinary Activity Log**: Shows upload attempts
3. **Test with Postman**: Isolate frontend vs backend issues
4. **MongoDB Issues**: Verify connection string in environment variables

---

## ✅ Success Indicators

When everything works correctly, you should see:

### In Render Logs:

```
📸 Starting disease detection...
📦 Image info: { width: 1024, height: 768, ... }
☁️  Cloudinary config check: ✅ All credentials present
📤 Uploading to Cloudinary folder: AgroLens/disease-detection/6753abc...
✅ Cloudinary upload successful!
   - Public ID: AgroLens/disease-detection/6753abc/xyz123
   - URL: https://res.cloudinary.com/dxxxx/image/upload/...
🤖 Step 2: Sending to ML API...
✅ ML API response received
   - Prediction: Apple___Apple_scab
   - Confidence: 89.5%
💾 Step 3: Saving to database...
✅ Detection saved successfully!
```

### In Mobile App:

```
📷 Image uploaded for analysis
🔍 Analyzing your plant image...
📊 Analysis Results:
🟢 Disease: Apple Apple scab
📈 Confidence: 89.5%
✅ High confidence detection!
```

---

## 🎯 Quick Checklist

-   [ ] Cloudinary credentials added to Render
-   [ ] Backend redeployed after adding credentials
-   [ ] Cloudinary account is active (not expired)
-   [ ] Storage quota not exceeded
-   [ ] Test image is valid JPEG/PNG
-   [ ] Test image is < 10MB
-   [ ] Backend logs show "Cloudinary config check: ✅"
-   [ ] Frontend .env points to production URL
-   [ ] APK rebuilt after .env changes
