# Okta SPA One-Click Setup

A full-stack application for Okta administrators to deploy complete Secure Partner Access (SPA) infrastructure with a single CSV upload.

## ⚠️ Important Disclaimer

**This tool is a proof of concept and is NOT officially supported by Okta.**

Before using this application in your environment:
- The codebase should be thoroughly reviewed by your organization's security team
- All code should be tested in a non-production Okta environment
- Ensure compliance with your organization's security policies and procedures
- This tool is provided as-is without any warranties or support from Okta

## Features

- **OAuth 2.0 Authentication**: Secure login using Okta's OIDC flow with PKCE
- **JWT Token Validation**: Backend validates all API requests with cryptographic JWT verification
- **Authorization Controls**: Role-based access control requiring admin group membership
- **Input Validation**: Comprehensive sanitization protecting against CSV injection, XSS, and regex injection
- **CSV Upload**: Bulk upload partner organizations from a CSV file
- **Automated Realm Creation**: Automatically creates Okta Realms for each organization using the Realm API
- **Automatic User Assignment**: Creates and activates realm assignment rules that automatically assign users to realms based on email domain
- **Group Management**: Automatically creates admin and user groups for each realm
- **Resource Sets**: Creates scoped resource sets for delegated administration of each realm
- **Role Assignment**: Automatically assigns Partner Admin role to admin groups with resource sets
- **Partner Portal Integration**: Automatically assigns admin groups to the Partner Portal application
- **Real-time Results**: View success/failure status for each organization processed with detailed IDs
- **Material UI**: Professional, responsive interface

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Material UI (MUI)
- Okta React SDK
- React Router
- Axios

### Backend
- Node.js with Express
- TypeScript
- Okta Node.js SDK
- Multer (file upload)
- csv-parser

## Project Structure

```
SPA-admin-UI/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── config/        # Configuration files
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (Okta integration)
│   │   ├── middleware/    # Custom middleware (CSV parser)
│   │   └── types/         # TypeScript type definitions
│   └── package.json
└── CLAUDE.md         # Development guidance
```

## Setup Instructions

### Prerequisites
- Node.js (v22.11.0 or higher)
- npm or yarn
- An Okta account with admin access

### Okta Configuration

1. **Create an Okta Application**:
   - Log into your Okta Admin Dashboard
   - Go to Applications → Create App Integration
   - Choose "OIDC - OpenID Connect"
   - Choose "Single-Page Application"
   - Set Sign-in redirect URIs: `http://localhost:5173/login/callback`
   - Set Sign-out redirect URIs: `http://localhost:5173`
   - Save the Client ID

2. **Generate an API Token**:
   - Go to Security → API → Tokens
   - Create a new token with admin privileges
   - Save this token securely

3. **Create Admin Group**:
   - Go to Directory → Groups
   - Click "Add Group"
   - Name: `RealmAdmins`
   - Description: "Administrators who can manage partner realms"
   - Click "Save"
   - Add users to this group who should have access to the application

4. **Configure Authorization Server** (to include groups claim):
   - Go to Security → API → Authorization Servers
   - Select "default" (or your custom authorization server)
   - Go to the "Claims" tab
   - Click "Add Claim"
   - Configure the groups claim:
     - **Name**: `groups`
     - **Include in token type**: Access Token
     - **Value type**: Groups
     - **Filter**: Matches regex `.*` (to include all groups)
     - **Include in**: Any scope
   - Click "Create"

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=your-spa-client-id
OKTA_API_TOKEN=your-api-token
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Important**:
- `OKTA_CLIENT_ID` must match your SPA application's client ID (same as frontend)
- `OKTA_API_TOKEN` should use a least-privilege token with only realm management permissions
- See [SECURITY.md](SECURITY.md) for security configuration details

4. Install dependencies:
```bash
npm install
```

5. Start development server:
```bash
npm run dev
```

The backend will run on http://localhost:3001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
VITE_OKTA_DOMAIN=your-domain.okta.com
VITE_OKTA_CLIENT_ID=your-client-id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_URL=http://localhost:3001
```

4. Install dependencies:
```bash
npm install
```

5. Start development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

1. **Access the Application**: Navigate to http://localhost:5173
2. **Sign In**: You'll be redirected to Okta for authentication
3. **Upload CSV**: After authentication, upload a CSV file with partner organizations
4. **View Results**: For each organization, the application will:
   - Create a realm with the organization name and domain
   - Create an assignment rule to automatically assign users with matching email domains to the realm
   - Activate the assignment rule
   - Create an admin group (`{OrgName}-Admins`)
   - Create a user group (`{OrgName}-Users`)
   - Create a resource set containing the realm, users, and both groups
   - Assign the Partner Admin role to the admin group with the resource set
   - Assign the admin group to the Partner Portal application
   - Display success/failure status with all created resource IDs

### CSV Format

The CSV file should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| name | Yes | Organization name |
| domain | Yes | Organization domain |
| description | No | Organization description |

**Example CSV:**
```csv
name,domain,description
Acme Corp,acme.com,Acme Corporation
Widget Inc,widget.io,Widget Industries
Global Tech,globaltech.net,Global Technology Solutions
```

## Development

### Available Scripts

#### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with hot reload (tsx)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript

## API Endpoints

### POST `/api/realms/upload`
Upload a CSV file and create realms for each organization.

**Request**: multipart/form-data with `file` field
**Response**:
```json
{
  "message": "Processed N organizations",
  "summary": {
    "total": 10,
    "successful": 9,
    "failed": 1
  },
  "results": [...]
}
```

### GET `/api/realms/list`
List all existing authorization servers (realms).

### GET `/health`
Health check endpoint.

## Security

This application implements multiple security layers:
- **JWT validation** on all API requests
- **Role-based authorization** requiring admin group membership
- **Input sanitization** protecting against injection attacks
- **CORS restrictions** limiting requests to authorized frontend
- **File validation** enforcing CSV-only uploads with size limits

**⚠️ Before Deployment:**
- Review the [SECURITY.md](SECURITY.md) file for complete security configuration
- Ensure only authorized users are in the `RealmAdmins` or `Administrators` groups
- Use a least-privilege API token with only necessary permissions
- Complete security audit and penetration testing

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## Troubleshooting

### "No valid organizations found in CSV"
- Ensure your CSV has `name` and `domain` columns
- Check for proper CSV formatting

### Authentication Issues
- Verify your Okta domain and client ID are correct
- Ensure redirect URIs match exactly in Okta app configuration
- Check that your Okta app is assigned to your user

### Backend Connection Issues
- Ensure backend is running on port 3001
- Check CORS configuration in backend
- Verify `VITE_API_URL` in frontend .env matches backend URL

### "Insufficient permissions" Error
- Ensure your user is in the `RealmAdmins` or `Administrators` group in Okta
- Verify the authorization server has the `groups` claim configured (see Okta Configuration step 4)
- Check that the groups claim is included in the access token
- Try logging out and back in to refresh your token

## Screenshots

<img width="1225" height="776" alt="Image" src="https://github.com/user-attachments/assets/f9735d77-dd6b-4f10-928c-3753d0739e6d" />

<img width="1225" height="676" alt="Image" src="https://github.com/user-attachments/assets/946370ad-d27b-4f08-828e-429c488c08f6" />

<img width="1009" height="484" alt="Image" src="https://github.com/user-attachments/assets/fc3106bd-0916-4652-a147-bb75f4569ea9" />

<img width="1009" height="609" alt="Image" src="https://github.com/user-attachments/assets/326c0cfc-e044-4b65-8a16-75822a07ba02" />

<img width="873" height="161" alt="Image" src="https://github.com/user-attachments/assets/eb5e084f-a8fe-4ba2-81b2-5ad4b0596fa6" />


## Credits

Built by **James Daly** with the assistance of **[Claude Code](https://claude.ai/code)**.
