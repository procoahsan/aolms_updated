import 'server-only';
export class StaffQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  nationality?: string;
  status?: string;
  category?: string;
  docExpiry?: 'valid' | 'expiringSoon' | 'expired';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
