import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UploadXlsxController } from 'presentation/http/controllers/files/queueFile'
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

describe('UploadXlsxController', () => {
  let useCase: QueueFileUseCase
  let controller: UploadXlsxController

  beforeEach(() => {
    useCase = {
      execute: vi.fn()
    } as any
    controller = new UploadXlsxController(useCase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return 202 and task id', async () => {
    const httpRequest: IHttpRequest = {
      file: { path: '/tmp/test.xlsx' }
    } as any

    useCase.execute = vi.fn().mockResolvedValueOnce('uuid-task')

    const response = await controller.handle(httpRequest)
    expect(response.statusCode).toBe(new HttpSuccess().success_202().statusCode)
    expect(response.body).toEqual({ taskId: 'uuid-task' })
  })

  it('should throw error if file is missing', async () => {
    const httpRequest: IHttpRequest = {}
    await expect(controller.handle(httpRequest)).rejects.toThrow(DomainError)
  })
})