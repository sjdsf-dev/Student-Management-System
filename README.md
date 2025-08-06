# SJDSF-Student-Management-System

This repository contains the source code for the Web App, Mobile App, and Backend of the SJDSF Student Management Portal.

## 🏗️ Project Structure

The project consists of three main components:

- **Go Backend** - RESTful API server built with Go
- **React Web App** - Modern web application for desktop/browser access
- **React Native Mobile App** - Cross-platform mobile application for iOS and Android

## 📱 Mobile App

### Getting Started

To run the mobile application:

```bash
cd mobile-app/student-management-app
npm install
npx expo start
```

### Health Check

Run a comprehensive health check for your Expo project:

```bash
npx expo-doctor
```

### Configuration

Update the base URL configuration:

- **File**: `sjdsf-portal/mobile-app/student-management-app/config/config.ts`
- Modify the `BASE_URL` constant to point to your backend service

### Play Store Deployment

When pushing an update to the Google Play Store:

1. Navigate to `app.json`
2. Increment the `versionCode` field:
   ```json
   {
     "expo": {
       "android": {
         "versionCode": 2
       }
     }
   }
   ```
3. Build and submit the updated version

## 🌐 Web App

### Getting Started

To run the React web application:

```bash
cd web-app
npm install
npm start
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🔧 Backend

### Getting Started

To run the Go backend server:

```bash
cd backend
go run main.go
```

### Prerequisites

- Go 1.19 or higher
- Required Go modules (install with `go mod tidy`)

### API Documentation

The backend provides RESTful endpoints for:

- Student management
- Authentication
- Data processing
- File uploads/downloads

## 🚀 Deployment with Choreo

### Publishing Backend Service

1. **Choreo Dev Console**:

   - Navigate to Management → Life Cycle → Publish
   - Deploy your backend service

2. **Dev Portal Access**:
   - After publishing, access the API through the Dev Portal
   - Go to Applications → Application Name → Subscriptions
   - Subscribe to the corresponding backend service

### Environment Setup

Setup Environmental Variables
Setup CORS headers
otp-code
student-id
employer-id
supervisor-id

create connection to backend in the frontend in choreo
Configure your environment variables for different deployment stages:

- Development
- Staging
- Production

## 🛠️ Development Workflow

### Prerequisites

- Node.js 16+ and npm
- Go 1.19+
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Local Development Setup

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd SJDSF-Student-Management-System
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```

3. **Web App Setup**:

   ```bash
   cd web-app
   npm install
   npm start
   ```

4. **Mobile App Setup**:
   ```bash
   cd mobile-app/student-management-app
   npm install
   npx expo start
   ```

## 📋 Available Scripts

### Backend

- `go run main.go` - Start development server
- `go build` - Build production binary
- `go test` - Run tests

### Web App

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Mobile App

- `npx expo start` - Start development server
- `npx expo build:android` - Build Android APK
- `npx expo build:ios` - Build iOS IPA
- `npx expo-doctor` - Health check

## 🔒 Security

- Environment variables should be stored securely
- API keys and sensitive data should not be committed to the repository
- Use HTTPS in production environments
- Implement proper authentication and authorization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For technical support or questions, please contact the development team or create an issue in the repository.

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

**Note**: Make sure to update configuration files and environment variables according to your deployment environment before running the applications.

OLD

# SJDSF-Student-Management-System

This repository contains the source code for the Web App, Mobile App, and Backend of the SJDSF Student Management Portal.

# Mobile

npx expo-doctor for a health check

BASE_URL: sjdsf-portal/mobile-app/student-management-app/config/config.ts

When pushing an update to the playstore update version increase the "versionCode": 2 in app.json

# Backend

go run main.go

Choreo Dev Portal is used to link service and the frontend
Choreo Dev Console - > Management -> Life Cycle -> Publish
Now you can access this api in the Dev Portal
In Dev Portal go to Applications -> SJDSF Portal -> Subscriptions -> Subscribe to the corresponding backend service
