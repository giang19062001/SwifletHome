import { IPackage } from "src/modules/package/package.interface";

export const NOTIFICATIONS = {
  updatePackage: (packageData?: IPackage | null) => ({
    TITLE: 'Thông báo cập nhập gói',
    BODY: `Gói ${!packageData ? 'Miễn phí' : packageData.packageName} đã được cập nhập thành công`,
  }),
   sendNotifyDaily: (taskName: string, daysLeft: number) => ({
    TITLE: taskName,
    BODY:  daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
  }),
};

export const TEXTS = {
  PACKAGE_FREE : "Gói dùng thử"
} 