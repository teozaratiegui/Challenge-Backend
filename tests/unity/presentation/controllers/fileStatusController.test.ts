import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { GetFileStatusController } from 'presentation/http/controllers/files/fileStatus'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { DomainError } from 'domain/entities/domainError'

describe('GetFileStatusController', () => {
  let useCase: GetFileStatusUseCase
  let controller: GetFileStatusController

  beforeEach(() => {
    useCase = {
      execute: vi.fn()
    } as any
    controller = new GetFileStatusController(useCase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return file status and errors', async () => {
    const result = {
      status: 'done',
      errors: [{ row: 1, col: 1 }],
      total: 1,
      hasNext: false,
      limit: 10,
      offset: 0
    }
    const httpRequest: IHttpRequest = {
      path: { id: '123' },
      query: { limit: '10', offset: '0' }
    }

    useCase.execute = vi.fn().mockResolvedValueOnce(result)
    const response = await controller.handle(httpRequest)

    expect(response.statusCode).toBe(new HttpSuccess().success_200().statusCode)
    expect(response.body).toEqual(result)
  })

  it('should throw error if id, limit or offset is missing', async () => {
    const httpRequest: IHttpRequest = { path: {}, query: {} }
    await expect(controller.handle(httpRequest)).rejects.toThrow(DomainError)
  })
})