import amqp from 'amqplib'
import { IFilePublisher } from 'app/protocols/filePublisher'
import { DomainError } from 'domain/entities/domainError'
import { logger } from 'infra/logger/logger'
import { FileErrors } from 'domain/enums/files/fileErrors'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

const connectWithRetry = async (
  retries = 3,
  delay = 2000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL)
      const channel = await connection.createChannel()
      logger.info(`✅ Connected to RabbitMQ after ${i + 1} attempt(s)`)
      return { connection, channel }
    } catch (err) {
      logger.error(`❌ RabbitMQ connection failed (attempt ${i + 1}/${retries}):`, err)
      await new Promise((res) => setTimeout(res, delay))
    }
  }

  throw new DomainError(FileErrors.RABBITMQ_ERROR, 'Failed to connect to RabbitMQ after retries')
}

export class RabbitMQPublisher implements IFilePublisher {
  async send(queue: string, message: { uuid: string; path: string }): Promise<void> {
    try {
      const { connection, channel } = await connectWithRetry()

      await channel.assertQueue(queue, { durable: true })

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true
      })

      logger.info(`📤 Mensaje enviado a la cola "${queue}":`, message)

      await channel.close()
      await connection.close()
    } catch (error) {
      logger.error(`❌ Error enviando mensaje a la cola "${queue}":`, error)
      throw new DomainError(FileErrors.RABBITMQ_ERROR, 'Failed to send message to RabbitMQ')
    }
  }
}
