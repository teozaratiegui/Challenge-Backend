export interface IFileDataUseCase {
    execute(uuid: string, page: number): Promise<{ data: any[], next: boolean } | { message: string } | null>;
  }