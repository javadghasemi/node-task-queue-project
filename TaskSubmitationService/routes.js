import express from 'express';

import {TaskController} from "./Controllers/TaskController.js";

const router = express.Router();

const taskController = new TaskController();

router.get('api/v1/tasks', taskController.getAll.bind(taskController));
router.post('api/v1/tasks', taskController.create.bind(taskController));
router.get('api/v1/tasks/:taskId', taskController.status.bind(taskController));
router.get('api/v1/tasks/:taskId/result', taskController.result.bind(taskController));
router.delete('api/v1/tasks/:taskId', taskController.cancel.bind(taskController));

export const routes = router;