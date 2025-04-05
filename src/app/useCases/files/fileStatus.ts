export interface IFileStatusUseCase {
  execute(uuid: string, limit: number, offset: number): Promise<any>;
}
