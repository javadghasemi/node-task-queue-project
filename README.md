# Task Queue Project

This project involves two primary services, Task Submission Service and Task Worker Service, which communicate via
RabbitMQ and PostgreSQL is used as the database.

### Prerequisites

- Docker

- Docker Compose

## Project Overview

1. **Task Submission Service**   
   A REST API service responsible for submitting tasks to the queue and storing them in PostgreSQL.
2. **Task Worker Service**  
   A service that processes tasks from the queue and sends results back.

## Setting Up using Docker

1. **Clone the repository**
   ```shell
   git clone https://github.com/javadghasemi/task-queue-project.git
   cd task-queue-project
   ```
2. **Create an .env file (optional)**   
   You can define your environment variables in an .env file at the root of the project. Below is an example:

   ```
   NODE_ENV=production
   CLUSTER_SIZE=1
   
   RABBITMQ_HOST=rabbitmq
   RABBITMQ_PORT=5672
   RABBITMQ_USER=guest
   RABBITMQ_PASS=guest
   
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=licence_market
   
   SUBMISSION_SERVICE_PORT=3000
   ```
3. **Build and run the services**  
   To build and start the containers, use the following command:
   ```shell 
   docker-compose up --build
   ```

## Task Submission Service API:

This part of document describes the REST API endpoints provided by the Task Submission Service. These APIs allow users
to create tasks, check the status of a task, and retrieve the results.

### Endpoints

1. #### Create a New Task
   **Endpoint**
   ```shell
   POST /tasks
   ```

   #### Description

   Creates a new task and submits it to the queue for processing.

   #### Request Body

    - **type (string)**: Type of the task. This can be used to categorize or define different kinds of tasks.
    - **data (any)**: The data associated with the task. This can be any format depending on the task type.

   #### Request Example

   ```json
   {
     "type": "ImageProcessing",
     "data": {
       "imageUrl": "https://example.com/sample.jpg"
     }
   }
   ```

   #### Response

   A successful response will return a JSON object containing the taskId for the newly created task.

   #### Response Example

   ```json
   {
     "taskId": "bfcac71a-1e00-4ef7-9ab1-386de3b5a6a0",
     "status": "QUEUED",
     "message": "Task queued successfully"
   }
   ```

2. #### Get Task Status

   **Endpoint**
   ```shell
   GET /tasks/:taskId/status
   ```

   #### Description
   Retrieves the current processing status of a specific task by its `taskId`.

   #### Path Parameter
    - **taskId (string)**: The ID of the task for which the status is being requested.

   #### Response
   A successful response will return the current status of the task.

   ```json
   {
      "taskId": "bfcac71a-1e00-4ef7-9ab1-386de3b5a6a0",
      "status": "COMPLETED",
      "createdAt": "2024-10-10T04:03:14.162Z",
      "updatedAt": "2024-10-10T04:03:40.563Z"
   }
   ```

   #### Possible Statuses
    - **PENDING:** Task is waiting to add to queue.
    - **QUEUED:** Task is added to queue and waiting for processing
    - **IN_PROGRESS:** Task is currently being processed.
    - **COMPLETED:** Task has been processed.
    - **FAILED:** Task processing failed.

3. #### Get Task Result

   #### Description
   Retrieves the result of a specific task after it has been processed. This endpoint will return the output of the task
   if it is completed.

   #### Path Parameter
    - **taskId (string)**: The ID of the task for which the status is being requested.

   #### Response
   A successful response will return the result of the task. If the task is still in progress, you may need to check
   back later.
   #### Response Example
   ```shell
   {
      "taskId": "bfcac71a-1e00-4ef7-9ab1-386de3b5a6a0",
      "result": "{\"name\":\"Joan\",\"data\":{\"hello\":\"world\"}}",
      "createdAt": "2024-10-10T04:03:14.162Z",
      "updatedAt": "2024-10-10T04:03:40.563Z"
   }
   ```

## Adding a New Task to the Task Worker Service

This document outlines the steps to implement and add a new task in the **Task Worker Service**. Each new task must
follow
specific guidelines to ensure it integrates seamlessly with the existing system.

### Steps to Create a New Task

1. #### Implement the Task Interface

   Create a new task by implementing the task interface. This interface defines the structure and behavior that every
   task must adhere to.

   ```ts
   // task-worker/interfaces/task.interface.ts
   export interface Task {
     execute(data: any): Promise<any>;  // Method to execute the task
   }
   ```

2. #### Place the Task in the Tasks Directory
   Once the task is implemented, place the new task file in the `task-worker/tasks` directory. Ensure the filename
   reflects the task's purpose for easy identification.

   **Example:**
   ```
   task-worker/
   └── tasks/
      ├── image-processing.task.ts  // New task file
      └── another-task.task.ts
   ```

3. #### Add Task Type to the Enum

   Next, add a new entry to the task type enumeration. This step allows the system to recognize the new task type when
   processing.

   **Modifying the Enum**
   Open the `task-worker/enums/task-type.enum.ts` file and add your task type:

   ```ts
   // task-worker/enums/task-type.enum.ts
   export enum TaskType {
      IMAGE_PROCESSING = 'image_processing',
      DATA_ANALYSIS = 'data_analysis',
      NEW_TASK_TYPE = 'new_task_type',  // Add your new task type here
   }
   ```
4. #### Create an Instantiation Process in the Task Factory
   Finally, you need to create an instantiation process for your new task within the task factory. This factory is
   responsible for creating instances of tasks based on their type.

   ##### Example of Task Factory
   Open the task-worker/tasks/task-factory.ts file and modify it to include your new task type:
   ```ts
   // task-worker/tasks/task-factory.ts
   import { Task } from '../interfaces/task.interface';
   import { TaskType } from '../enums/task-type.enum';
   import { NewTaskType } from './new-task-type.task'; // Import your new task
   
   export class TaskFactory {
     static createTask(type: TaskType): Task {
       switch (type) {
         case TaskType.IMAGE_PROCESSING:
           return new ImageProcessingTask(); // Existing task
         case TaskType.DATA_ANALYSIS:
           return new DataAnalysisTask(); // Existing task
         case TaskType.NEW_TASK_TYPE: // Your new task type
           return new NewTaskType(); // Create instance of your new task
         default:
           throw new Error('Invalid task type');
        }
     }
   } 
   ```
   

