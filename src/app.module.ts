import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './common/config/database/typeorm.config';
import { allConfigs } from './common/config';
import { EventsModule } from './events/events.module';
import { RabbitMqProducer } from './common/rabbitMQ/rabbitmq.producer';
import { OrdersModule } from './orders/orders.module';

@Module({
  controllers: [],
  providers: [RabbitMqProducer],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: allConfigs,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    EventsModule,
    OrdersModule,
  ],
})
export class AppModule {}
