# OAuth Server for zkLogin

Simple Express.js backend that handles OAuth authentication flow for Google and 42 École.

## Setup

### 1. Install Dependencies
```bash
cd oauth-server
npm install
```

### 2. Configure OAuth Credentials

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
4. Choose "Web application"
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` file

#### 42 École OAuth (Optional):
1. Go to [42 API](https://profile.intra.42.fr/oauth/applications)
2. Create new application
3. Set redirect URI: `http://localhost:3001/auth/42/callback`
4. Copy UID and Secret to `.env` file

### 3. Edit .env File
```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

FORTY_TWO_CLIENT_ID=your-42-uid-here
FORTY_TWO_CLIENT_SECRET=your-42-secret-here
FORTY_TWO_REDIRECT_URI=http://localhost:3001/auth/42/callback

PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Start Server
```bash
npm start
```

Server will run on http://localhost:3001

## How It Works

1. Frontend redirects to backend OAuth endpoints
2. Backend handles OAuth flow with provider (Google/42)
3. Backend receives tokens and user info
4. Backend redirects back to frontend with user data
5. Frontend uses data to create Sui profile

## Endpoints

- `GET /health` - Health check
- `GET /auth/google` - Start Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/42` - Start 42 OAuth
- `GET /auth/42/callback` - 42 OAuth callback

## Security

- Client secrets are never exposed to frontend
- CORS configured for frontend URL only
- All OAuth tokens handled server-side
