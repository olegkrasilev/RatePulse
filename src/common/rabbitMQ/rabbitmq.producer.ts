import { Injectable } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { getRmqUrl } from '../config/rabbitMQ/rabbitMQ.config';
import { RMQ_QUEUES } from '../constants/rabbitMQ/rabbitMQ.constants';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMqProducer {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [getRmqUrl()],
        queue: RMQ_QUEUES.ORDERS_CREATED,
        queueOptions: { durable: true },
      },
    });
  }

  emitOrderCreated(data: any) {
    return lastValueFrom(this.client.emit('orders.created', data));
  }
}
