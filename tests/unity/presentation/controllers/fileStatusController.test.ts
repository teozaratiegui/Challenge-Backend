import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { GetFileStatusController } from 'presentation/http/controllers/files/fileStatus'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

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

  it('should return file status', async () => {
    const result = { status: 'done' }
    const httpRequest: IHttpRequest = {
      path: { id: '123' },
      query: { page: '1' }
    }

    useCase.execute = vi.fn().mockResolvedValueOnce(result)
    const response = await controller.handle(httpRequest)

    expect(response.statusCode).toBe(new HttpSuccess().success_200().statusCode)
    expect(response.body).toEqual(result)
  })

  it('should throw error if id is missing', async () => {
    const httpRequest: IHttpRequest = { path: {}, query: {} }
    await expect(controller.handle(httpRequest)).rejects.toThrow(DomainError)
  })
})