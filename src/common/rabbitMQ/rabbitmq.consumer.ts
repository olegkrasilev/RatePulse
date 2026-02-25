import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RMQ_QUEUES } from '../constants/rabbitMQ/rabbitMQ.constants';

@Controller()
export class RabbitMqConsumer {
  private readonly logger = new Logger(RabbitMqConsumer.name);

  @EventPattern(RMQ_QUEUES.ORDERS_CREATED)
  handleOrderCreated(@Payload() data: any) {
    this.logger.log(`Received: ${JSON.stringify(data)}`);
  }
}
