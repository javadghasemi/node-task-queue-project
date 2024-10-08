import { Task } from '../interfaces/task.interface';

export class ImageProcessingTask implements Task {
  execute(data: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'Joan',
          data,
        });
      }, 10000);
    });
  }
}
