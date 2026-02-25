import { Module } from '@nestjs/common';
import { RabbitMqConsumer } from 'src/common/rabbitMQ/rabbitmq.consumer';
import { RabbitMqProducer } from 'src/common/rabbitMQ/rabbitmq.producer';

@Module({
  controllers: [RabbitMqConsumer],
  providers: [RabbitMqProducer],
  exports: [RabbitMqProducer],
})
export class EventsModule {}
