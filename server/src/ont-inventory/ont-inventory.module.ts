import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OntInventory } from './ont-inventory.entity';
import { OntInventoryController } from './ont-inventory.controller';
import { OntInventoryService } from './ont-inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([OntInventory])],
  controllers: [OntInventoryController],
  providers: [OntInventoryService],
})
export class OntInventoryModule {}