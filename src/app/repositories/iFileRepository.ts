export interface IFileRepository {
    create(data: { filePath: string; status: string }): Promise<{ uuid: string }>

    findById(id: string): Promise<{ status: string } | null>

    updateStatus(id: string, status: string): Promise<void>
    
}