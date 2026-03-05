import { Request } from 'express';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { PartnerOrganization } from '../types/index';
import { validateOrganization } from './inputValidation';

export async function parseCSV(file: Express.Multer.File): Promise<PartnerOrganization[]> {
  return new Promise((resolve, reject) => {
    const results: PartnerOrganization[] = [];
    const errors: string[] = [];
    let lineNumber = 1; // CSV header is line 1
    const stream = Readable.from(file.buffer);

    stream
      .pipe(csvParser())
      .on('data', (data: any) => {
        lineNumber++;

        // Map CSV columns to PartnerOrganization
        // Expected CSV columns: name, domain, description (optional)
        const org = {
          name: data.name || data.Name,
          domain: data.domain || data.Domain,
          description: data.description || data.Description,
        };

        // Validate and sanitize organization data
        const validation = validateOrganization(org);

        if (validation.valid && validation.sanitized) {
          results.push(validation.sanitized);
        } else {
          errors.push(`Line ${lineNumber}: ${validation.error}`);
          console.warn(`⚠️ Invalid CSV row at line ${lineNumber}: ${validation.error}`);
        }
      })
      .on('end', () => {
        if (errors.length > 0 && results.length === 0) {
          // All rows were invalid
          reject(new Error(`CSV validation failed:\n${errors.join('\n')}`));
        } else if (errors.length > 0) {
          // Some rows were invalid but we have valid ones
          console.warn(`⚠️ ${errors.length} invalid rows skipped`);
          resolve(results);
        } else {
          resolve(results);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
