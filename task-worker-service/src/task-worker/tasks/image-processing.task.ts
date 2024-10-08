import { Task } from './task.interface';

export class ImageProcessingTask implements Task {
  execute(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(data);
      }, 10000);
    });
  }
}
