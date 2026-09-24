import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Use DB_HOST from env if provided, otherwise construct from SUPABASE_URL
    const dbHost = this.configService.get<string>('DB_HOST');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';

    let host = dbHost;
    if (!host && supabaseUrl) {
      // Extract project reference from SUPABASE_URL and construct DB host
      // SUPABASE_URL format: https://[project-ref].supabase.co
      // DB host format: db.[project-ref].supabase.co
      const projectRef = supabaseUrl
        .replace('https://', '')
        .replace('http://', '')
        .replace('.supabase.co', '');
      host = `db.${projectRef}.supabase.co`;
    }

    return {
      type: 'postgres',
      host: host || 'localhost',
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'postgres'),
      autoLoadEntities: true,
      synchronize: false, // Never use synchronize in production
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }
}