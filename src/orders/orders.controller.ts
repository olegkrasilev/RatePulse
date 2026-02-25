import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './create-order.dto';
import { RabbitMqProducer } from 'src/common/rabbitMQ/rabbitmq.producer';

@Controller('orders')
export class OrdersController {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly producer: RabbitMqProducer,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = this.ordersRepository.create({
      userId: dto.userId,
      total: dto.total.toString(),
      status: 'CREATED',
    });

    const saved = await this.ordersRepository.save(order);
    await this.producer.emitOrderCreated({
      orderId: saved.id,
      userId: saved.userId,
      total: Number(saved.total),
    });

    return saved;
  }
}
