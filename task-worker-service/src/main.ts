import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClusteringService } from './clustering.service';

async function bootstrap() {
  const env = process.env;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`,
        ],
        queue: 'task_queue',
        noAck: false,
        queueOptions: { durable: true },
      },
    },
  );
  await app.listen();
}

ClusteringService.clusterize(bootstrap);
