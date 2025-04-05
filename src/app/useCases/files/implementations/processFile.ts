import { IFileRepository } from "app/repositories/iFileRepository"
import { IFileDataRepository } from "app/repositories/iFileDataRepository"
import { IFileErrorsRepository } from "app/repositories/iFileErrorsRepository"
import { FileStatus } from "domain/enums/files/fileStatus"
import ExcelJS from "exceljs"
import { DomainError } from "domain/entities/domainError"
import fs from 'fs'
import { logger } from "infra/logger/logger"

export class ProcessFileUseCase {
  constructor(
    private fileRepo: IFileRepository,
    private validRepo: IFileDataRepository,
    private errorRepo: IFileErrorsRepository
  ) {}

  async execute(uuid: string, filePath: string): Promise<void> {
    await this.fileRepo.updateStatus(uuid, FileStatus.PROCESSING)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.read(fs.createReadStream(filePath))
    const worksheet = workbook.worksheets[0]

    const validRecords: any[] = []
    const errorRecords: { row: number; col: number }[] = []

    for (let i = 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i)
      if (i === 1) continue

      const errors = []
      const nameCell = row.getCell(1).value
      const ageCell = row.getCell(2).value
      const numsCell = row.getCell(3).value

      if (typeof nameCell !== 'string') errors.push({ row: i, col: 1 })
      if (typeof ageCell !== 'number') errors.push({ row: i, col: 2 })

      let numsArray: number[] = []
      try {
        if (!numsCell) throw new Error()
        numsArray = numsCell.toString().split(',').map(n => parseInt(n.trim()))
        if (numsArray.some(isNaN)) throw new Error()
        numsArray.sort((a, b) => a - b)
      } catch {
        errors.push({ row: i, col: 3 })
      }

      for (let col = 4; col <= row.cellCount; col++) {
        if (row.getCell(col).value !== null && row.getCell(col).value !== undefined) {
          errors.push({ row: i, col: 4 })
          break
        }
      }

      if (errors.length) {
        errorRecords.push(...errors)
      } else {
        validRecords.push({ uuid, name: nameCell, age: ageCell, nums: numsArray })
      }
    }

    if (validRecords.length > 0) {
      await this.validRepo.bulkInsert(validRecords)
    }

    if (errorRecords.length > 0) {
      await this.errorRepo.bulkInsert(uuid, errorRecords)
    }

    await this.fileRepo.updateStatus(uuid, FileStatus.DONE)

    try {
      await fs.promises.unlink(filePath)
      console.log(`🧹 Archivo eliminado del sistema: ${filePath}`)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        logger.warn(`⚠️ Archivo ya eliminado o no encontrado: ${filePath}`)
      } else {
        logger.error(`⚠️ No se pudo eliminar el archivo: ${filePath}`, err)
      }
    }
  }
}