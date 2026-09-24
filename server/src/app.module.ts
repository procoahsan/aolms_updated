import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmConfigService } from './typeorm.config.js';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ProjectsModule } from './projects/projects.module';
import { OrdersModule } from './orders/orders.module';
import { OrderAssignmentsModule } from './order-assignments/order-assignments.module';
import { DeliverySubmissionsModule } from './delivery-submissions/delivery-submissions.module';
import { AssuranceTicketsModule } from './assurance-tickets/assurance-tickets.module';
import { AssuranceSubmissionsModule } from './assurance-submissions/assurance-submissions.module';
import { OntInventoryModule } from './ont-inventory/ont-inventory.module';
import { CpeInventoryModule } from './cpe-inventory/cpe-inventory.module';
import { CpeReplacementsModule } from './cpe-replacements/cpe-replacements.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SupabaseModule } from './supabase/supabase.module';
import { StaffModule } from './legacy-aolms/staff/staff.module';
import { LogisticsModule } from './legacy-aolms/logistics/logistics.module';
import { ServiceDeliveryModule } from './legacy-aolms/service-delivery/service-delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.example', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      inject: [TypeOrmConfigService],
    }),
    AuthModule,
    ProfilesModule,
    ProjectsModule,
    OrdersModule,
    OrderAssignmentsModule,
    DeliverySubmissionsModule,
    AssuranceTicketsModule,
    AssuranceSubmissionsModule,
    OntInventoryModule,
    CpeInventoryModule,
    CpeReplacementsModule,
    AttachmentsModule,
    AuditLogsModule,
    SupabaseModule,
    // Migrated from E:\AOLMS: Excel-driven operational workflows.
    StaffModule,
    LogisticsModule,
    ServiceDeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypeOrmConfigService],
})
export class AppModule {}
