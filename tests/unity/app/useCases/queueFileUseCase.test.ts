import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { FileStatus } from 'domain/enums/files/fileStatus'

const mockFileRepo = {
  create: vi.fn()
}
const mockPublisher = {
  send: vi.fn()
}

describe('QueueFileUseCase', () => {
  let useCase: QueueFileUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new QueueFileUseCase(mockFileRepo as any, mockPublisher as any)
  })

  it('should create file and publish message', async () => {
    const filePath = 'path/to/file.xlsx'
    const uuid = '1234-uuid'
    mockFileRepo.create.mockResolvedValueOnce({ uuid })

    const result = await useCase.execute(filePath)

    expect(mockFileRepo.create).toHaveBeenCalledWith({ filePath, status: FileStatus.PENDING })
    expect(mockPublisher.send).toHaveBeenCalledWith('xlsx.upload', { uuid, path: filePath })
    expect(result).toBe(uuid)
  })
})
