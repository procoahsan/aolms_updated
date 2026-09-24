import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpeInventory } from './cpe-inventory.entity';
import { CpeInventoryController } from './cpe-inventory.controller';
import { CpeInventoryService } from './cpe-inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([CpeInventory])],
  controllers: [CpeInventoryController],
  providers: [CpeInventoryService],
})
export class CpeInventoryModule {}