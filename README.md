# vnest monorepo

This is a monorepo containing frontend and api application. They can be started individually or by using docker compose on the root.

## How to run

Add values to .env based on the environment.
```
APP_USERS=admin@example.com:VerySecurePassword123!:Admin:ADMIN;user@example.com:AnotherSecurePass456!:User:USER

POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=database

SERVER_SERVLET_SESSION_TIMEOUT=30m

// Depending on the frontend ip
CORS_ALLOWED_ORIGINS=http://195.148.20.75:8081

```
APP_USERS defines user accounts that can login to the admin UI.

Run:
```
docker compose up --build -d
```

## How to test
npm Test is defined in root package.json. Non-jest tests can be added there.

Run:
```
npm install
npm test
```

## Development build instruction for Expo 
Prerequisite: React version 19.1.0

Build on EAS

### Install npm packages
```
cd frontend
npm install
```

### Install expo-dev-client
```
npx expo install expo-dev-client
```

### Check version, should be React 19.1.0
```
npm list react react-dom react-native
```

### Clear cache and reinstall if needed
```
rm -rf node_modules package-lock.json && npm cache clean --force && npm install
```

### Build the native app (Android) with AndroidStudio
```
eas build --platform android --profile development
```
Or this for APK for direct install 
```
eas build --platform android --profile preview
```

### Build the native app (iOS simulator) with Xcode
Have an Expo account

EAS CLI
```
npm install -g eas-cli && eas login
```

Edit development profile in eas.json and set the simulator option to true like this
```
{
  "build": {
    "development": {
      "ios": {
        "simulator": true
      }
    }
  }
}
```

Run this command
```
eas build --platform ios --profile development
```

### Build the native app (iOS device)
You need an Expo account, EAS CLI, and a paid Apple Developer account for creating signing credentials so the app could be installed on an iOS device ;-;

If so then run this
```
eas build --platform ios --profile development
```

### Start the bundle
After app is installed on emulator, run this
```
npx expo start
```
Then press a for android and i for ios emulators
