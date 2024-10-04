import {Postgres} from "../Loaders/Postgres.js";
import {DataTypes} from "sequelize";
import {TaskStatus} from "../Enums/TaskStatus.js";

const connection = Postgres.getConnection();

export const User = connection.define('task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: TaskStatus.Queued
  },
  data: {
    type: DataTypes.STRING,
  }
});