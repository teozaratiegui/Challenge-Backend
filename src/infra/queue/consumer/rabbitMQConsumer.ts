import amqp from 'amqplib'
import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import { ProcessFileUseCase } from 'app/useCases/files/implementations/processFile'
import { logger } from 'infra/logger/logger'
import FileDataRepository from 'infra/repositories/mongodb/fileDataRepository'
import FileErrorsRepository from 'infra/repositories/mongodb/fileErrorsRepository'
import connectDB from 'infra/databases/mongoDatabase'

const RABBITMQ_URL = 'amqp://localhost'
const QUEUE_NAME = 'xlsx.upload'

async function bootstrap() {
  await connectDB()
  logger.info('✅ MongoDB connected from worker')
  const connection = await amqp.connect(RABBITMQ_URL)
  const channel = await connection.createChannel()
  await channel.assertQueue(QUEUE_NAME, { durable: true })

  const repository = new FileRepository()
  const fileDataRepository = new FileDataRepository()
  const fileErrorsRepository = new FileErrorsRepository()
  const useCase = new ProcessFileUseCase(repository, fileDataRepository, fileErrorsRepository)

  logger.info(`📡 Waiting for messages in ${QUEUE_NAME}`)
  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return

    try {
      const content = JSON.parse(msg.content.toString())
      const { uuid, path } = content

      logger.info(`📥 Message received: uuid=${uuid}, path=${path}`)
      await useCase.execute(uuid, path)

      channel.ack(msg)
      logger.info(`✅ File ${uuid} processed and acknowledged`)
    } catch (err) {
      logger.error('❌ Error processing message:', err)
      channel.nack(msg, false, false) // descartar mensaje en caso de error
    }
  })
}

bootstrap().catch((err) => {
  logger.error('❌ Worker failed to start:', err)
})
