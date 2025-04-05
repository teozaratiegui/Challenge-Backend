import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GetFileDataPageController } from 'presentation/http/controllers/files/fileData'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { HttpErrors } from 'presentation/http/helpers/implementations/HttpErrors'
import { FileErrors } from 'domain/enums/files/fileErrors'
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

  it('should return data and next', async () => {
    const httpRequest: IHttpRequest = {
      path: { uuid: '123' },
      query: { page: '1' }
    }

    const data = { data: ['row1'], next: false }
    useCase.execute = vi.fn().mockResolvedValueOnce(data)

    const response = await controller.handle(httpRequest)
    expect(response.statusCode).toBe(new HttpSuccess().success_200().statusCode)
    expect(response.body).toEqual(data)
  })

  it('should throw error when uuid or page is missing', async () => {
    const httpRequest: IHttpRequest = { path: {}, query: {} }
    await expect(controller.handle(httpRequest)).rejects.toThrow(DomainError)
  })
})