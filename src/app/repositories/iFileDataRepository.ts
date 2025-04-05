export interface IFileDataRepository {
    bulkInsert(records: { uuid: string; name: string; age: number; nums: number[] }[]): Promise<void>
    findByUuidWithPagination(uuid: string, limit: number, offset: number): Promise<{ data: any[]; total: number; hasNext: boolean }>
  }