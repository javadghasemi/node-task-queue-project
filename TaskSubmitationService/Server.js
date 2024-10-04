import {createServer} from 'node:http';

import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import {routes} from "./routes.js";
import {RabbitMQ} from "./Loaders/RabbitMQ.js";
import {TasksChannel} from "./Channels/TasksChannel.js";

class TaskQueue {
  static #app = express();
  static #server;

  static async initialize() {
    this.startServer();
    this.injectMiddlewares();
    this.initRouter();
    // await this.initRabbitMQConnection();
  }

  static startServer() {
    this.#server = createServer(this.#app);
    this.#server.listen(process.env.PORT, () => {
      console.log(`Server started on port http://localhost:${process.env.PORT}`);
    });
  }

  static injectMiddlewares() {
    this.#app.use(bodyParser.json());
    this.#app.use(morgan('dev'));
  }

  static initRouter() {
    this.#app.use(routes);
  }

  static async initRabbitMQConnection() {
    await RabbitMQ.connection();
    await TasksChannel.createChannel();
  }

  static stopServer() {
    this.#server.close();
  }
}

await TaskQueue.initialize();