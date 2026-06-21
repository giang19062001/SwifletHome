import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUERY_HELPER } from 'src/helpers/const.helper';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggingService } from '../logger/logger.service';

@Processor('notification', {
  concurrency: QUERY_HELPER.JOB_CONCURRENCY, // chạy 5 job cùng lúc
})
export class QueueService extends WorkerHost {
  private readonly loggerName = 'QueueService';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly logger: LoggingService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const logbase = `${this.loggerName}/process`;
    const { userCode, deviceToken, title, body, data, notificationType } = job.data;

    this.logger.log(logbase, `Đang xử lý thông báo trong hàng đợi cho user(${userCode}), token: ${deviceToken ? deviceToken.substring(0, 20) : 'empty'}...`);
    try {
      const result = await this.firebaseService.sendNotification(userCode, deviceToken, title, body, data, notificationType);
      this.logger.log(logbase, `Đã gửi thông báo trong hàng đợi thành công cho user(${userCode}), messageId code: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(logbase, `Không thể gửi thông báo đã xếp hàng chờ cho user(${userCode}): ${error.message}`);
      throw error;
    }
  }
}
