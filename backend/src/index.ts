// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { OktaService } from './services/oktaService';
import { RealmController } from './controllers/realmController';
import { createRealmRoutes } from './routes/realmRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Validate required environment variables
const requiredEnvVars = ['OKTA_DOMAIN', 'OKTA_API_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Okta service
const oktaService = new OktaService(
  process.env.OKTA_DOMAIN!,
  process.env.OKTA_API_TOKEN!
);

// Initialize controllers
const realmController = new RealmController(oktaService);

// Routes
app.use('/api/realms', createRealmRoutes(realmController));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Okta Admin API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Okta Domain: ${process.env.OKTA_DOMAIN}`);
});
