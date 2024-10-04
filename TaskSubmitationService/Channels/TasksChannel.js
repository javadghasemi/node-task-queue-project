import {RabbitMQ} from "../Loaders/RabbitMQ.js";

export class TasksChannel {
  static channel;

  static async createChannel() {
    const connection = await RabbitMQ.connection();
    const channel = await connection.createChannel();

    await channel.assertQueue('tasks');
    this.channel = channel;
  }
}