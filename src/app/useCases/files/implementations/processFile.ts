import { IFileRepository } from "app/repositories/iFileRepository"
import { IFileDataRepository } from "app/repositories/iFileDataRepository"
import { IFileErrorsRepository } from "app/repositories/iFileErrorsRepository"
import { FileStatus } from "domain/enums/files/fileStatus"
import ExcelJS from "exceljs"
import { DomainError } from "domain/entities/domainError"
import fs from 'fs'
import { logger } from "infra/logger/logger"

export class ProcessFileUseCase {
  private VALID_PAGE_SIZE = 300
  private ERROR_PAGE_SIZE = 500

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

    let validRows: any[] = []
    let errorRows: { row: number; col: number }[] = []
    let validPage = 1
    let errorPage = 1

    const validPageDocs: any[] = []
    const errorPageDocs: any[] = []

    const flushPages = async () => {
      if (validPageDocs.length > 0) {
        await this.validRepo.bulkInsertPages(validPageDocs)
        validPageDocs.length = 0
      }
      if (errorPageDocs.length > 0) {
        await this.errorRepo.bulkInsertPages(errorPageDocs)
        errorPageDocs.length = 0
      }
    }

    const saveIfFull = async () => {
      if (validRows.length >= this.VALID_PAGE_SIZE) {
        const chunk = validRows.splice(0, this.VALID_PAGE_SIZE)
        validPageDocs.push({ uuid, page: validPage++, data: chunk })
      }
      if (errorRows.length >= this.ERROR_PAGE_SIZE) {
        const chunk = errorRows.splice(0, this.ERROR_PAGE_SIZE)
        errorPageDocs.push({ uuid, page: errorPage++, fileErrors: chunk })
      }
    }

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

      // Strict column validation (aligned with header)
      for (let col = 4; col <= row.cellCount; col++) {
        if (row.getCell(col).value !== null && row.getCell(col).value !== undefined) {
          errors.push({ row: i, col: 4 })
          break
        }
      }

      if (errors.length) {
        errorRows.push(...errors)
      } else {
        validRows.push({ name: nameCell, age: ageCell, nums: numsArray })
      }

      await saveIfFull()
    }

    if (validRows.length > 0) {
      validPageDocs.push({ uuid, page: validPage++, data: validRows })
    }
    if (errorRows.length > 0) {
      errorPageDocs.push({ uuid, page: errorPage++, fileErrors: errorRows })
    }
    await flushPages()
    await this.fileRepo.updateStatus(uuid, FileStatus.DONE)

    try {
      await fs.promises.unlink(filePath)
      console.log(`🧹 Archivo eliminado del sistema: ${filePath}`)
    } catch (err) {
      console.warn(`⚠️ No se pudo eliminar el archivo: ${filePath}`, err)
    }
  }
}
