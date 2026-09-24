import { Injectable } from '@nestjs/common';
import {
  parseWbsBuffer,
  parseResponseBuffer,
  extractWbsSerialNumbers,
  IWbsParseResult,
  IResponseParseResult,
  IWbsRecord,
} from './utils/sd-excel-parser.util';
import {
  dataVerification,
  crossVerifyOntCheck,
  buildFinalOutput,
  IDataVerificationRecord,
  ICrossVerifyOntRecord,
  IFinalOutputRecord,
} from './utils/sd-validation.util';

@Injectable()
export class ServiceDeliveryService {
  // In-memory buffers for uploaded sheets
  private wbsBuffer: Buffer | null = null;
  private responseBuffer: Buffer | null = null;

  // Parsed results
  private wbsResult: IWbsParseResult | null = null;
  private responseResult: IResponseParseResult | null = null;

  // ─────────── Upload handlers ───────────

  uploadWbs(buffer: Buffer, targetDate?: string): IWbsParseResult {
    this.wbsBuffer = buffer;
    this.wbsResult = parseWbsBuffer(buffer, targetDate);
    return this.wbsResult;
  }

  uploadResponse(buffer: Buffer): IResponseParseResult {
    this.responseBuffer = buffer;
    this.responseResult = parseResponseBuffer(buffer);
    return this.responseResult;
  }

  // ─────────── Date change ───────────

  changeDate(selectedDate: string): IWbsParseResult {
    if (!this.wbsBuffer) {
      throw new Error('No WBS data available. Please upload the WBS sheet first.');
    }
    this.wbsResult = parseWbsBuffer(this.wbsBuffer, selectedDate);
    return this.wbsResult;
  }

  // ─────────── Tab 1: Data Verification ───────────

  dataVerification(): {
    results: IDataVerificationRecord[];
    totalRecords: number;
    foundCount: number;
    notFoundCount: number;
  } {
    if (!this.wbsResult) {
      throw new Error('No WBS data available. Please upload the WBS sheet first.');
    }
    if (!this.responseResult) {
      throw new Error('No Response data available. Please upload the Response sheet first.');
    }

    const results = dataVerification(this.wbsResult.records, this.responseResult.records);
    const foundCount = results.filter((r) => r.orderMatch).length;
    const notFoundCount = results.filter((r) => !r.orderMatch).length;

    return {
      results,
      totalRecords: results.length,
      foundCount,
      notFoundCount,
    };
  }

  // ─────────── Tab 2: Cross Verification & ONT Check ───────────

  crossVerifyOntCheck(): {
    results: ICrossVerifyOntRecord[];
    totalRecords: number;
    foundInOnt: number;
    needsInvestigation: number;
    scenarioACount: number;
    scenarioBCount: number;
  } {
    if (!this.wbsResult) {
      throw new Error('No WBS data available. Please upload the WBS sheet first.');
    }

    const results = crossVerifyOntCheck(
      this.wbsResult.records,
      this.responseResult?.records,
    );
    const foundInOnt = results.filter((r) => r.foundInOnt).length;
    const needsInvestigation = results.filter((r) => r.status === 'Investigate').length;
    const scenarioACount = results.filter((r) => r.scenario === 'A').length;
    const scenarioBCount = results.filter((r) => r.scenario === 'B').length;

    return {
      results,
      totalRecords: results.length,
      foundInOnt,
      needsInvestigation,
      scenarioACount,
      scenarioBCount,
    };
  }

  // ─────────── Tab 3: Final Output ───────────

  finalOutput(): {
    results: IFinalOutputRecord[];
    totalRecords: number;
    totalLabourCharge: number;
    totalCpeCharge: number;
    warnings: string[];
  } {
    if (!this.wbsResult) {
      throw new Error('No WBS data available. Please upload the WBS sheet first.');
    }

    // Use allRecords (all delivered records across ALL dates) for Final Output
    const results = buildFinalOutput(this.wbsResult.allRecords);
    const warnings = [...new Set(results.flatMap((row) => row.warnings))];
    return {
      results,
      totalRecords: results.length,
      totalLabourCharge: results.reduce((sum, row) => sum + row.labourCharge, 0),
      totalCpeCharge: results.reduce((sum, row) => sum + row.cpeCharge, 0),
      warnings,
    };
  }

  // ─────────── Status ───────────

  getStatus(): {
    wbsLoaded: boolean;
    responseLoaded: boolean;
    wbsRecordCount: number;
    responseRecordCount: number;
    selectedDate: string;
    allDates: string[];
  } {
    return {
      wbsLoaded: !!this.wbsResult,
      responseLoaded: !!this.responseResult,
      wbsRecordCount: this.wbsResult?.records.length || 0,
      responseRecordCount: this.responseResult?.records.length || 0,
      selectedDate: this.wbsResult?.selectedDate || '',
      allDates: this.wbsResult?.allDates || [],
    };
  }
}
