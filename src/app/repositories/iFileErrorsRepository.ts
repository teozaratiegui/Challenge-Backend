export interface IFileErrorsRepository {

    savePage(uuid: string, page: number, fileErrors: any[]): Promise<void>
    findPage(uuid: string, page: number): Promise<{ fileErrors: any[] } | null>
    bulkInsertPages(pages: { uuid: string, page: number, fileErrors: any[] }[]): Promise<void>
    
}