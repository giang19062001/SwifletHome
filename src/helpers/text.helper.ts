import { IPackage } from "src/modules/package/package.interface";

export const NOTIFICATIONS = {
   updatePackageFristTime: (packageData?: IPackage | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo kích hoạt gói',
    BODY: !packageData ? 'Gói Miễn phí được kích hoạt thành công' : `${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate}`,
  }),
  updatePackageTimes: (packageData?: IPackage | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo gia hạn gói',
    BODY: !packageData ? 'Gói Miễn phí được gia hạn thành công' : `${packageData.packageName} đã được gia hạn thành công, có hiệu lực từ ${startDate} đến ${endDate}`,
  }),
   sendNotifyTodoTaskDaily: (userHomeName: string, taskName: string, daysLeft: number) => ({
    TITLE: `${taskName} (${userHomeName})`,
    BODY:  daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
  }),
};

export const TEXTS = {
  PACKAGE_FREE : "Gói dùng thử"
} 