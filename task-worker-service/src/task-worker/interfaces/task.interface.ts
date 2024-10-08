export interface Task {
  execute(data: any): Promise<any | string>;
}
