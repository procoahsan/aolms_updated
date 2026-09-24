import { Injectable } from '@nestjs/common';
import { parseLogisticsExcelBuffer, extractNewSerialNumbers, ILogisticsParseResult } from './utils/logistics-excel-parser.util';
import { compareLogisticsWithTeam, ITeamComparisonResult } from './utils/team-comparison.util';
import { checkOntUpdate, IOntCheckResult } from './utils/ont-update-checker.util';

@Injectable()
export class LogisticsService {
  // In-memory store for the last uploaded logistics buffer (needed for comparison)
  private lastLogisticsBuffer: Buffer | null = null;
  private lastLogisticsResult: ILogisticsParseResult | null = null;
  private lastTeamBuffer: Buffer | null = null;

  processExcelBuffer(buffer: Buffer): ILogisticsParseResult {
    this.lastLogisticsBuffer = buffer;
    this.lastLogisticsResult = parseLogisticsExcelBuffer(buffer);
    // Clear team data on new logistics upload
    this.lastTeamBuffer = null;
    return this.lastLogisticsResult;
  }

  compareWithTeamBuffer(
    teamBuffer: Buffer,
    selectedDate?: string,
  ): ITeamComparisonResult {
    if (!this.lastLogisticsResult || !this.lastLogisticsBuffer) {
      throw new Error('No logistics data available. Please upload the logistics sheet first.');
    }
    this.lastTeamBuffer = teamBuffer;
    const selectedSerial = selectedDate ? parseInt(selectedDate, 10) : undefined;
    return compareLogisticsWithTeam(
      this.lastLogisticsResult.records,
      this.lastLogisticsBuffer,
      teamBuffer,
      selectedSerial,
    );
  }

  changeDate(selectedDate: string): ITeamComparisonResult | ILogisticsParseResult {
    if (!this.lastLogisticsBuffer) {
      throw new Error('No logistics data available. Please upload the logistics sheet first.');
    }

    // If team data exists, re-compare with new date
    if (this.lastTeamBuffer) {
      const selectedSerial = parseInt(selectedDate, 10);
      // Re-parse logistics for the date that corresponds to the team date
      const teamResult = compareLogisticsWithTeam(
        this.lastLogisticsResult!.records,
        this.lastLogisticsBuffer,
        this.lastTeamBuffer,
        selectedSerial,
      );
      return teamResult;
    }

    // Otherwise just re-parse logistics with the new date
    this.lastLogisticsResult = parseLogisticsExcelBuffer(this.lastLogisticsBuffer, selectedDate);
    return this.lastLogisticsResult;
  }

  checkOntSerials(): IOntCheckResult[] {
    if (!this.lastLogisticsBuffer) {
      throw new Error('No logistics data available. Please upload the logistics sheet first.');
    }

    const serialNumbers = extractNewSerialNumbers(this.lastLogisticsBuffer);
    if (serialNumbers.length === 0) {
      return [];
    }

    return checkOntUpdate(serialNumbers);
  }
}
