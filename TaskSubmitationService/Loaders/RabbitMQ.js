import amqp from "amqplib";

export class RabbitMQ {
  static #connection;

  static async connection() {
    if (!this.#connection) {
      this.#connection = await this.#createConnection();
    }

    return this.#connection;
  };

  static async #createConnection() {
    const host = process.env.RABBITMQ_PORT;
    const port = process.env.RABBITMQ_PORT;
    const user = process.env.RABBITMQ_USER;
    const pass = process.env.RABBITMQ_PASS;

    const connectionUrl = `amqp://${user}:${pass}@${host}:${port}`;
    return amqp.connect(connectionUrl);
  }
}