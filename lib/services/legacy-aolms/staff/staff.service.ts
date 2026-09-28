import 'server-only';

import { OperationsDatabase } from '../operations-database';
import { IStaffMember, IStaffResponse } from './interfaces/staff.interface';
import { StaffQueryDto } from './dto/staff.dto';



export class StaffService {
  constructor(private readonly database: OperationsDatabase) {}
  private async records():Promise<IStaffMember[]> {
    const rows=await this.database.db.query('SELECT id,data FROM staff_members ORDER BY id');
    return rows.map((r:any)=>({...r.data,id:r.id}));
  }

  async getAll(query: StaffQueryDto): Promise<IStaffResponse> {
    const staffRecords=await this.records();
    let filtered = [...staffRecords];

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

  async getById(id: number): Promise<IStaffMember | undefined> {
    const staffRecords=await this.records();
    return staffRecords.find((s) => s.id === id);
  }

  async getStats() {
    const staffRecords=await this.records();
    const total = staffRecords.length;
    const active = staffRecords.filter((s) =>
      s.status.toLowerCase().includes('active'),
    ).length;
    const onLeave = staffRecords.filter((s) =>
      s.status.toLowerCase().includes('leave'),
    ).length;
    const willRelease = staffRecords.filter((s) =>
      s.status.toLowerCase().includes('release'),
    ).length;

    const nationalities = [...new Set(staffRecords.map((s) => s.nationality).filter(Boolean))];
    const categories = [...new Set(staffRecords.map((s) => s.staffCategory).filter(Boolean))];
    const statuses = [...new Set(staffRecords.map((s) => s.status).filter(Boolean))];

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

    for (const record of staffRecords) {
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

}
