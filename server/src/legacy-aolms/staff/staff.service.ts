import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { IStaffMember, IStaffResponse } from './interfaces/staff.interface';
import { StaffQueryDto } from './dto/staff.dto';
import { parseExcelFile, parseExcelBuffer, findExcelFiles } from './utils/excel-parser.util';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private staffRecords: IStaffMember[] = [];

  constructor() {
    this.loadFromDisk();
  }

  /**
   * On startup, scan the project root for Excel files and load the first one found.
   */
  private loadFromDisk(): void {
    // Unified project data directory. An external path can be supplied for deployments.
    const projectRoot = process.env.AOLMS_DATA_DIR || path.resolve(process.cwd(), 'data');
    this.logger.log(`Scanning for Excel files in: ${projectRoot}`);

    const excelFiles = findExcelFiles(projectRoot);

    if (excelFiles.length === 0) {
      this.logger.warn('No Excel files found in project root. Upload one via the API.');
      return;
    }

    const filePath = excelFiles[0];
    this.logger.log(`Found Excel file: ${filePath}`);

    try {
      this.staffRecords = parseExcelFile(filePath);
      this.logger.log(`âœ… Loaded ${this.staffRecords.length} staff records from "${path.basename(filePath)}"`);
    } catch (error: any) {
      this.logger.error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  getAll(query: StaffQueryDto): IStaffResponse {
    let filtered = [...this.staffRecords];

    // Search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.cpr.toLowerCase().includes(searchLower) ||
          s.nationality.toLowerCase().includes(searchLower) ||
          s.contactPersonal.toLowerCase().includes(searchLower),
      );
    }

    // Nationality filter
    if (query.nationality) {
      filtered = filtered.filter(
        (s) => s.nationality.toLowerCase() === query.nationality!.toLowerCase(),
      );
    }

    // Status filter
    if (query.status) {
      filtered = filtered.filter(
        (s) => s.status.toLowerCase().includes(query.status!.toLowerCase()),
      );
    }

    // Category filter
    if (query.category) {
      filtered = filtered.filter(
        (s) => s.staffCategory.toLowerCase().includes(query.category!.toLowerCase()),
      );
    }

    // Document expiry filter
    if (query.docExpiry) {
      const expiryFields: (keyof IStaffMember)[] = [
        'cprExpiry',
        'bnetIdExpiry',
        'batelcoExpiry',
        'rpExpiry',
        'passportExpiry',
      ];
      const invalidValues = ['n/a', 'need to fill', 'under process', ''];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((s) => {
        let hasMatch = false;
        for (const field of expiryFields) {
          const raw = String(s[field] || '').trim();
          if (!raw || invalidValues.includes(raw.toLowerCase())) continue;

          const date = new Date(raw);
          if (isNaN(date.getTime())) continue;
          date.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (query.docExpiry === 'expired' && diffDays < 0) {
            hasMatch = true; break;
          } else if (query.docExpiry === 'expiringSoon' && diffDays >= 0 && diffDays <= 90) {
            hasMatch = true; break;
          } else if (query.docExpiry === 'valid' && diffDays > 90) {
            hasMatch = true; break;
          }
        }
        return hasMatch;
      });
    }

    // Sorting
    if (query.sortBy) {
      const sortKey = query.sortBy as keyof IStaffMember;
      const order = query.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = String(a[sortKey] || '');
        const bVal = String(b[sortKey] || '');
        return aVal.localeCompare(bVal) * order;
      });
    }

    const total = filtered.length;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 100;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return { data: paginated, total, page, limit };
  }

  getById(id: number): IStaffMember | undefined {
    return this.staffRecords.find((s) => s.id === id);
  }

  getStats() {
    const total = this.staffRecords.length;
    const active = this.staffRecords.filter((s) =>
      s.status.toLowerCase().includes('active'),
    ).length;
    const onLeave = this.staffRecords.filter((s) =>
      s.status.toLowerCase().includes('leave'),
    ).length;
    const willRelease = this.staffRecords.filter((s) =>
      s.status.toLowerCase().includes('release'),
    ).length;

    const nationalities = [...new Set(this.staffRecords.map((s) => s.nationality).filter(Boolean))];
    const categories = [...new Set(this.staffRecords.map((s) => s.staffCategory).filter(Boolean))];
    const statuses = [...new Set(this.staffRecords.map((s) => s.status).filter(Boolean))];

    // Document expiry statistics
    const expiryFields: (keyof IStaffMember)[] = [
      'cprExpiry',
      'bnetIdExpiry',
      'batelcoExpiry',
      'rpExpiry',
      'passportExpiry',
    ];

    const invalidValues = ['n/a', 'need to fill', 'under process', ''];

    let validCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    for (const record of this.staffRecords) {
      for (const field of expiryFields) {
        const raw = String(record[field] || '').trim();
        if (!raw || invalidValues.includes(raw.toLowerCase())) continue;

        const date = new Date(raw);
        if (isNaN(date.getTime())) continue;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil(
          (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays < 0) {
          expiredCount++;
        } else if (diffDays <= 90) {
          expiringSoonCount++;
        } else {
          validCount++;
        }
      }
    }

    return {
      total,
      active,
      onLeave,
      willRelease,
      nationalities,
      categories,
      statuses,
      documentExpiry: {
        valid: validCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        total: validCount + expiringSoonCount + expiredCount,
      },
    };
  }

  uploadExcel(buffer: Buffer): { count: number } {
    const parsed = parseExcelBuffer(buffer);
    this.staffRecords = parsed;
    this.logger.log(`Uploaded and parsed ${parsed.length} staff records from Excel`);
    return { count: parsed.length };
  }
}
