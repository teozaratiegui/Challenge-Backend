export interface IFileRepository {
    create(data: { filePath: string; status: string }): Promise<{ _id: string }>
}