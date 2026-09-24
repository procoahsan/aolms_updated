import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpeReplacement } from './cpe-replacements.entity';
import { CpeReplacementsController } from './cpe-replacements.controller';
import { CpeReplacementsService } from './cpe-replacements.service';

@Module({
  imports: [TypeOrmModule.forFeature([CpeReplacement])],
  controllers: [CpeReplacementsController],
  providers: [CpeReplacementsService],
})
export class CpeReplacementsModule {}