export interface IFileErrorsRepository {
    bulkInsert(uuid: string, fileErrors: { row: number; col: number }[]): Promise<void>
    findByUuidWithPagination(uuid: string, limit: number, offset: number): Promise<{ fileErrors: any[]; total: number; hasNext: boolean }>
    deleteMany(): Promise<void>
  }