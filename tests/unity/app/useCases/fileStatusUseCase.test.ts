import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { DomainError } from 'domain/entities/domainError'

const mockFileRepo = {
  findById: vi.fn()
}
const mockErrorRepo = {
  findPage: vi.fn()
}

describe('GetFileStatusUseCase', () => {
  let useCase: GetFileStatusUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetFileStatusUseCase(mockFileRepo as any, mockErrorRepo as any)
  })

  it('should throw if page is <= 0', async () => {
    await expect(useCase.execute('uuid', 0)).rejects.toThrowError(DomainError)
  })

  it('should throw if file not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('uuid', 1)).rejects.toThrowError(DomainError)
  })

  it('should return status if not done', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'processing' })
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ status: 'processing' })
  })

  it('should return errors and next if file is done and page exists', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockErrorRepo.findPage.mockResolvedValueOnce({ fileErrors: ['e1'] })
    mockErrorRepo.findPage.mockResolvedValueOnce(null)
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ status: 'done', errors: ['e1'], next: false })
  })

  it('should return message if file is done but page not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockErrorRepo.findPage.mockResolvedValueOnce(null)
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ status: 'done', message: 'page not found' })
  })
})
