# Quick Start Guide

Get the Okta Realm Management UI running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js v22.11+ installed
- [ ] Okta account with admin access
- [ ] Okta API token created
- [ ] Okta SPA application configured

## Step 1: Okta Setup (5 minutes)

### Create Okta Application
1. Log into Okta Admin Dashboard
2. **Applications** → **Create App Integration**
3. Select **OIDC - OpenID Connect**
4. Select **Single-Page Application**
5. Configure:
   - **Name**: Realm Management UI
   - **Sign-in redirect URIs**: `http://localhost:5173/login/callback`
   - **Sign-out redirect URIs**: `http://localhost:5173`
   - **Controlled access**: Allow everyone (or specific groups)
6. Save and note the **Client ID**

### Generate API Token
1. **Security** → **API** → **Tokens**
2. **Create Token**
3. Name: "Realm Management API"
4. Save the token securely (only shown once)

### Configure Trusted Origins
1. **Security** → **API** → **Trusted Origins**
2. **Add Origin**:
   - **Name**: Local Development
   - **Origin URL**: `http://localhost:5173`
   - **Type**: Check both CORS and Redirect

### Create Admin Group
1. **Directory** → **Groups**
2. **Add Group**:
   - **Name**: `RealmAdmins`
   - **Description**: Administrators who can manage partner realms
3. **Save** and **add your user** to this group

### Configure Authorization Server (Groups Claim)
1. **Security** → **API** → **Authorization Servers**
2. Select **default** authorization server
3. Go to **Claims** tab
4. **Add Claim**:
   - **Name**: `groups`
   - **Include in token type**: Access Token
   - **Value type**: Groups
   - **Filter**: Matches regex `.*`
   - **Include in**: Any scope
5. **Create**

## Step 2: Backend Configuration (2 minutes)

```bash
cd backend

# Copy and edit environment file
cp .env.example .env
```

Edit `backend/.env` (no client secret needed for SPAs):
```env
OKTA_DOMAIN=your-domain.okta.com
OKTA_API_TOKEN=your_api_token_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Replace `your-domain.okta.com` with your actual Okta domain (without `https://`).
Replace `your_api_token_here` with the API token you created in Step 1.

```bash
# Install and start
npm install
npm run dev
```

You should see: `🚀 Server running on http://localhost:3001`

## Step 3: Frontend Configuration (2 minutes)

```bash
cd frontend

# Copy and edit environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_OKTA_DOMAIN=your-domain.okta.com
VITE_OKTA_CLIENT_ID=your_client_id_here
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_URL=http://localhost:3001
```

```bash
# Install and start
npm install
npm run dev
```

You should see: `Local: http://localhost:5173/`

## Step 4: Test the Application

1. Open browser to http://localhost:5173
2. Click "Sign In" (redirects to Okta)
3. Sign in with your Okta admin credentials
4. You'll be redirected back to the dashboard
5. Use `sample-organizations.csv` from the root directory to test uploads

## Troubleshooting

### "Authentication failed"
- Verify Client ID in `frontend/.env` matches Okta app
- Check redirect URIs are exact matches (no trailing slashes)
- Ensure your user is assigned to the Okta application

### "API connection failed"
- Check backend is running on port 3001
- Verify `VITE_API_URL` in frontend .env is correct
- Check CORS settings on backend

### "Unauthorized API calls"
- Verify API token has admin privileges
- Check token isn't expired
- Ensure OKTA_DOMAIN doesn't include `https://`

### CSV Upload Errors
- Check CSV has `name` and `domain` columns
- Ensure file is valid CSV format
- Check file size is under 5MB

### "Insufficient permissions" Error
- Verify you're in the `RealmAdmins` group in Okta (Directory → Groups)
- Check authorization server has `groups` claim configured
- Log out and back in to refresh your access token

## Next Steps

- Customize Material UI theme in `frontend/src/App.tsx`
- Add additional CSV fields in backend types
- Implement realm deletion or modification features
- Add logging and monitoring
- Deploy to production environment

## Sample CSV Format

See `sample-organizations.csv` in the root directory for a working example.

Required columns: `name`, `domain`
Optional columns: `description`
