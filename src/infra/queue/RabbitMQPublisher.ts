import amqp from 'amqplib'
import { IFilePublisher } from 'app/protocols/filePublisher'
import { DomainError } from 'domain/entities/domainError';
import { FileErrors } from 'domain/enums/files/fileErrors';

export class RabbitMQPublisher implements IFilePublisher {
  private readonly url = 'amqp://localhost'

  async send(queue: string, message: { taskId: string; path: string }): Promise<void> {
    try {
      const connection = await amqp.connect(this.url)
      const channel = await connection.createChannel()

      await channel.assertQueue(queue, { durable: true })

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true
      })

      console.log(`📤 Mensaje enviado a la cola "${queue}":`, message)

      await channel.close()
      await connection.close()
    } catch (error) {
      console.error(`❌ Error enviando mensaje a la cola "${queue}":`, error)
      throw new DomainError(FileErrors.RABBITMQ_ERROR, 'Failed to send message to RabbitMQ')
    }
  }
}
