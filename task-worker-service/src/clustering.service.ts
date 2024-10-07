import * as process from 'node:process';
import * as _cluster from 'node:cluster';

import { Injectable, Logger } from '@nestjs/common';

const cluster = _cluster as unknown as _cluster.Cluster;
const clusterSize = parseInt(process.argv[2] || '1');

@Injectable()
export class ClusteringService {
  static logger: Logger = new Logger('ClusteringService');

  static clusterize(callback: () => void): void {
    if (cluster.isPrimary) {
      this.logger.log(`master server (${process.pid}) is running`);

      for (let i = 0; i < clusterSize; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        this.logger.log(
          `worker ${worker.process.pid} died - code: ${code}, signal: ${signal}`,
        );
      });
    } else {
      callback();
      this.logger.log(`worker server (${process.pid}) is running`);
    }
  }
}
