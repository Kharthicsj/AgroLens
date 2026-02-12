# 🌱 AgroLens - Smart Agricultural Management App

![AgroLens](https://img.shields.io/badge/React%20Native-Expo-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

AgroLens is a modern agricultural management mobile application built with React Native (Expo) and Node.js. It helps farmers manage their agricultural activities, monitor crops, track weather forecasts, and optimize farming operations with an intuitive, theme-adaptive interface.

## 📱 Features

- **🔐 User Authentication** - Secure signup/signin with JWT tokens
- **👤 Profile Management** - Complete user profile with edit capabilities
- **🏠 Smart Dashboard** - Agricultural overview with crop analytics
- **🌤️ Weather Integration** - Real-time weather forecasts and alerts
- **💧 Irrigation Management** - Smart water usage monitoring
- **🐛 Pest Control** - Early detection and management tools
- **🗺️ Field Mapping** - GPS-based field tracking
- **⚙️ Settings & Themes** - Light/Dark theme support with persistence
- **🔄 Real-time Updates** - Live data synchronization

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native** with **Expo SDK 53**
- **React Navigation** for screen navigation
- **AsyncStorage** for local data persistence
- **Axios** for API communication
- **Expo Linear Gradient** for beautiful UI
- **Context API** for state management
- **JWT Decode** for token handling

### Backend (API Server)
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **dotenv** for environment variables

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software
1. **Node.js** (v16.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **Yarn**
   - Verify npm: `npm --version`
   - Or install Yarn: `npm install -g yarn`

3. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

4. **MongoDB** (Choose one option):
   - **Local MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud): Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)

### Mobile Development Setup
5. **Expo Go App** on your mobile device:
   - **Android**: Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)

6. **Android Studio** (Optional - for Android emulator):
   - Download from [developer.android.com](https://developer.android.com/studio)

7. **Xcode** (Optional - for iOS simulator, macOS only):
   - Download from Mac App Store

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Kharthicsj/AgroLens.git
cd AgroLens
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Install dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the `server` directory:
```bash
touch .env
```

Add the following environment variables to `.env`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/agrolens
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/agrolens

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Add your own values
API_VERSION=v1
```

#### Start MongoDB (if using local installation)
```bash
# For Windows
mongod

# For macOS (using Homebrew)
brew services start mongodb-community

# For Linux (Ubuntu)
sudo systemctl start mongod
```

#### Start the Backend Server
```bash
# Development mode with auto-restart
nodemon server.js

# Or production mode
node server.js
```

You should see:
```
Server running on port 3000
Connected to MongoDB successfully
```

### 3. Frontend Setup

#### Open a new terminal and navigate to client directory
```bash
cd ../client
```

#### Install dependencies
```bash
npm install
```

#### Start the Expo Development Server
```bash
npm run start
```

This will open the Expo Developer Tools in your browser and display a QR code.

### 4. Running on Mobile Device

#### Using Expo Go App (Recommended for beginners)
1. Open **Expo Go** app on your mobile device
2. **Android**: Scan the QR code from the terminal/browser
3. **iOS**: Scan the QR code using the Camera app, then tap the notification

#### Using Emulator/Simulator
```bash
# Android Emulator (Android Studio required)
npm run android

# iOS Simulator (Xcode required, macOS only)
npm run ios

# Web Browser
npm run web
```

## 🔧 Configuration

### Backend Configuration
The server uses the following default ports and settings:
- **API Server**: `http://localhost:5000`
- **MongoDB**: `mongodb://localhost:27017/agrolens`

### Frontend Configuration
Update API base URL in `client/services/api.js` if needed:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For physical devices, replace `localhost` with your computer's IP address:
```javascript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

## 📱 App Usage

### First Time Setup
1. **Register Account**: Create a new account with name, email, and password
2. **Login**: Sign in with your credentials
3. **Complete Profile**: Add phone number and location details
4. **Explore Features**: Navigate through Home, Profile, and Settings

### Main Features
- **Home Dashboard**: View crop analytics, weather, and quick stats
- **Profile Management**: Edit personal information and view account details
- **Theme Settings**: Toggle between light and dark themes
- **Navigation**: Use bottom tab navigation between Home and Profile

## 🗂️ Project Structure

```
AgroLens/
├── client/                 # React Native Frontend
│   ├── components/         # Reusable UI components
│   │   ├── Header.js
│   │   ├── TabNavigator.js
│   │   ├── ModernInput.js
│   │   └── ...
│   ├── context/           # React Context providers
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── pages/             # Screen components
│   │   ├── Home.js
│   │   ├── Signin.js
│   │   ├── Signup.js
│   │   ├── UserProfile.js
│   │   └── Settings.js
│   ├── router/            # Navigation configuration
│   ├── services/          # API service layer
│   ├── styles/            # Styling configurations
│   ├── utils/             # Utility functions
│   └── package.json
├── server/                # Node.js Backend
│   ├── controllers/       # Route controllers
│   │   └── User/
│   ├── middlewares/       # Custom middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── package.json
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **"Cannot connect to Metro bundler"**
```bash
# Clear Expo cache
expo start --clear

# Or reset cache completely
npx expo start --clear
```

#### 2. **"Network request failed" in app**
- Check if backend server is running on `http://localhost:5000`
- For physical devices, update API URL to use your computer's IP address
- Ensure both devices are on the same Wi-Fi network

#### 3. **MongoDB connection issues**
```bash
# Check if MongoDB is running
mongo --version

# For local MongoDB, ensure it's started
mongod

# Check connection string in .env file
```

#### 4. **"Module not found" errors**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For Expo specific issues
npx expo install --fix
```

#### 5. **Expo Go app crashes**
- Ensure you're using compatible Expo SDK version
- Check for JavaScript errors in the terminal
- Try restarting the Expo development server

### Getting Help
If you encounter issues:
1. Check the terminal for error messages
2. Verify all prerequisites are installed correctly
3. Ensure MongoDB is running and accessible
4. Check network connectivity between frontend and backend

## 🔄 Development Workflow

### Making Changes
1. **Frontend changes**: Saved automatically, app reloads instantly
2. **Backend changes**: Server restarts automatically with `npm run dev`
3. **Database changes**: Update models in `server/models/`

### Testing
- **Frontend**: Test on multiple devices and screen sizes
- **Backend**: Use tools like Postman to test API endpoints
- **Database**: Use MongoDB Compass or command line to inspect data

## 📦 Building for Production

### Frontend (Mobile App)
```bash
cd client

# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### Backend (API Server)
```bash
cd server

# Set production environment
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer Information

- **Repository**: [AgroLens GitHub](https://github.com/Kharthicsj/AgroLens)
- **Developer**: Kharthicsj
- **Version**: 1.0.0
- **Last Updated**: August 2025

## 🆘 Support

If you need help or have questions:
1. Check this README for common solutions
2. Look at existing issues on GitHub
3. Create a new issue with detailed description
4. Include error messages and steps to reproduce

---

**Happy Farming! 🌾**

Built with ❤️ for the agricultural community.
