export class CheckoutCurrentPackageResDto {
  packageCode: string;
  startDate: Date;
  endDate: Date;
}

export class CheckoutPackageByExpireDayResDto {
  packageCode: string;
  packageExpireDay: number;
}
