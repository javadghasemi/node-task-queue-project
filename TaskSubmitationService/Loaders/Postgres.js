import {Sequelize} from "sequelize";

export class Postgres {
  static #connection;

  static getConnection() {
    if (!this.#connection) {
      const host = process.env.POSTGRES_HOST;
      const port = process.env.POSTGRES_PORT;
      const user = process.env.POSTGRES_USER;
      const pass = process.env.POSTGRES_PASSWORD;
      const db = process.env.POSTGRES_DB;
      const connectionUrl = `postgres://${user}:${pass}@${host}:${port}/${db}`;
      this.#connection = new Sequelize(connectionUrl);
    }

    return this.#connection;
  }
}