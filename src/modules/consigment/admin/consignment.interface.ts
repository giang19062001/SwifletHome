
export interface IConsignment {
  seq: number;
  consignmentCode: string;
  userCode: string;
  senderName: string;
  senderPhone: string;
  nestQuantity: number;
  deliveryAddress: string;
  receiverName: string;
  receiverPhone: string;
  consignmentStatus: string;
  createdAt: Date;
}