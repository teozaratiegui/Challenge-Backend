export interface IFileDataUseCase {
  execute(uuid: string, limit: number, offset: number): Promise<{ data: any[]; total: number } | { message: string } | null>;
}
