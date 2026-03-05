import express from 'express';
import multer from 'multer';
import { RealmController } from '../controllers/realmController';
import { verifyToken, requireRealmAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export function createRealmRoutes(realmController: RealmController) {
  // Upload CSV and create realms
  // Protected: Requires valid JWT token and admin role
  router.post(
    '/upload',
    verifyToken,
    requireRealmAdmin,
    upload.single('file'),
    (req, res) => {
      realmController.uploadAndCreateRealms(req, res);
    }
  );

  // List all realms
  // Protected: Requires valid JWT token and admin role
  router.get('/list', verifyToken, requireRealmAdmin, (req, res) => {
    realmController.listRealms(req, res);
  });

  return router;
}
