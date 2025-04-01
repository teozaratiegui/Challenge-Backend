export interface IFileRepository {
    create(data: { filePath: string; status: string }): Promise<{ _id: string }>

    findById(id: string): Promise<{ status: string } | null>
}