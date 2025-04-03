export interface IFileDataRepository {

    savePage(uuid: string, page: number, errors: any[]): Promise<void>
    findPage(uuid: string, page: number): Promise<{ data: any[] } | null>
    bulkInsertPages(pages: { uuid: string, page: number, data: any[] }[]): Promise<void>
}