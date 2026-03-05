import { Request, Response } from 'express';
import { OktaService } from '../services/oktaService';
import { parseCSV } from '../middleware/csvParser';

export class RealmController {
  private oktaService: OktaService;

  constructor(oktaService: OktaService) {
    this.oktaService = oktaService;
  }

  /**
   * Handles CSV file upload and creates realms for each organization
   */
  async uploadAndCreateRealms(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No CSV file uploaded' });
        return;
      }

      // Parse CSV file
      const organizations = await parseCSV(req.file);

      if (organizations.length === 0) {
        res.status(400).json({ error: 'No valid organizations found in CSV' });
        return;
      }

      console.log(`Processing ${organizations.length} organizations...`);

      // Create realms for all organizations
      const results = await this.oktaService.createMultipleRealms(organizations);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.json({
        message: `Processed ${organizations.length} organizations`,
        summary: {
          total: organizations.length,
          successful: successCount,
          failed: failureCount,
        },
        results,
      });
    } catch (error: any) {
      console.error('Error processing CSV:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Lists all existing realms
   */
  async listRealms(req: Request, res: Response): Promise<void> {
    try {
      const realms = await this.oktaService.listRealms();
      res.json({ realms });
    } catch (error: any) {
      console.error('Error listing realms:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
