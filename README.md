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

// Optional: CSV data import (enabled by default)
// APP_DATA_CSV_ENABLED=true
// APP_DATA_CSV_PATH=data/initial_combinations.csv

```

**Environment Variables:**
- `APP_USERS`: Defines user accounts that can login to the admin UI
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins for API requests
- `APP_DATA_CSV_ENABLED`: Enable/disable CSV import on startup (default: true)
- `APP_DATA_CSV_PATH`: Path to CSV file with initial word combinations (default: data/initial_combinations.csv)

Run:
```
docker compose up --build -d
```

**What Happens on First Startup:**
1. PostgreSQL database is created
2. Flyway migrations create the schema
3. Admin users from `APP_USERS` are created
4. **CSV data is automatically imported** (if database is empty):
   - Finnish words (subjects, verbs, objects) from `backend/src/main/resources/data/initial_combinations.csv`
   - Valid word combinations (30 example combinations included)
5. Backend API starts at `http://localhost:8080`
6. Frontend starts at `http://localhost:8081`

To **disable CSV import**, set `APP_DATA_CSV_ENABLED=false` in your `.env` file.

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
