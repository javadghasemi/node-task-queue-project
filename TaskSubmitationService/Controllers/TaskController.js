import {TasksChannel} from "../Channels/TasksChannel.js";

export class TaskController {
  #taskService;

  constructor(taskService) {
    this.#taskService = taskService;
  }

  async getAll(req, res) {
    const result = this.#taskService.getAll();

    return res.json(result);
  }

  async create(req, res) {}

  status(req, res) {}

  result(req, res) {}

  cancel(req, res) {}
}