import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GetFileDataPageController } from 'presentation/http/controllers/files/fileData'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { DomainError } from 'domain/entities/domainError'

describe('GetFileDataPageController', () => {
  let useCase: FileDataUseCase
  let controller: GetFileDataPageController

  beforeEach(() => {
    useCase = {
      execute: vi.fn()
    } as any
    controller = new GetFileDataPageController(useCase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated data', async () => {
    const httpRequest: IHttpRequest = {
      path: { uuid: '123' },
      query: { limit: '10', offset: '0' }
    }

    const result = {
      data: [{ name: 'Alice', age: 30, nums: [1, 2] }],
      total: 1,
      hasNext: false,
      limit: 10,
      offset: 0
    }
    useCase.execute = vi.fn().mockResolvedValueOnce(result)

    const response = await controller.handle(httpRequest)
    expect(response.statusCode).toBe(new HttpSuccess().success_200().statusCode)
    expect(response.body).toEqual(result)
  })

  it('should throw error when uuid, limit or offset is missing', async () => {
    const httpRequest: IHttpRequest = { path: {}, query: {} }
    await expect(controller.handle(httpRequest)).rejects.toThrow(DomainError)
  })
})