import { IFileRepository } from "app/repositories/iFileRepository";
import { IFileDataRepository } from "app/repositories/iFileDataRepository";
import { IFileErrorsRepository } from "app/repositories/iFileErrorsRepository";
import { FileStatus } from "domain/enums/files/fileStatus";
import ExcelJS from "exceljs";
import { DomainError } from "domain/entities/domainError";
import fs from "fs";
import { logger } from "infra/logger/logger";

export class ProcessFileUseCase {
  constructor(
    private fileRepo: IFileRepository,
    private validRepo: IFileDataRepository,
    private errorRepo: IFileErrorsRepository
  ) {}

  async execute(uuid: string, filePath: string): Promise<void> {
    await this.fileRepo.updateStatus(uuid, FileStatus.PROCESSING);

    const validRecords: any[] = [];
    const errorRecords: { row: number; col: number }[] = [];

    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(fs.createReadStream(filePath), {
      entries: "emit",
      sharedStrings: "cache",
      worksheets: "emit",
    });

    let rowIndex = 0;

    for await (const worksheet of workbook) {
      for await (const row of worksheet) {
        rowIndex++;

        if (rowIndex === 1) continue; // Skip header row

        const errors = [];
        const nameCell = row.getCell(1).value;
        const ageCell = row.getCell(2).value;
        const numsCell = row.getCell(3).value;

        if (typeof nameCell !== "string") errors.push({ row: rowIndex, col: 1 });
        if (typeof ageCell !== "number") errors.push({ row: rowIndex, col: 2 });

        let numsArray: number[] = [];
        try {
          if (!numsCell) throw new Error();
          numsArray = numsCell.toString().split(",").map((n) => parseInt(n.trim()));
          if (numsArray.some(isNaN)) throw new Error();
          numsArray.sort((a, b) => a - b);
        } catch {
          errors.push({ row: rowIndex, col: 3 });
        }

        for (let col = 4; col <= row.cellCount; col++) {
          if (row.getCell(col).value !== null && row.getCell(col).value !== undefined) {
            errors.push({ row: rowIndex, col: 4 });
            break;
          }
        }

        if (errors.length) {
          errorRecords.push(...errors);
        } else {
          validRecords.push({ uuid, name: nameCell, age: ageCell, nums: numsArray });
        }

        // Periodically flush valid and error records to the database to avoid memory issues
        if (validRecords.length >= 1000) {
          await this.validRepo.bulkInsert(validRecords);
          validRecords.length = 0;
        }

        if (errorRecords.length >= 1000) {
          await this.errorRepo.bulkInsert(uuid, errorRecords);
          errorRecords.length = 0;
        }
      }
    }

    // Insert remaining records
    if (validRecords.length > 0) {
      await this.validRepo.bulkInsert(validRecords);
    }

    if (errorRecords.length > 0) {
      await this.errorRepo.bulkInsert(uuid, errorRecords);
    }

    await this.fileRepo.updateStatus(uuid, FileStatus.DONE);

    try {
      await fs.promises.unlink(filePath);
      console.log(`🧹 Archivo eliminado del sistema: ${filePath}`);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        logger.warn(`⚠️ Archivo ya eliminado o no encontrado: ${filePath}`);
      } else {
        logger.error(`⚠️ No se pudo eliminar el archivo: ${filePath}`, err);
      }
    }
  }
}