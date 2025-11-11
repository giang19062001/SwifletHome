export interface IOtp {
  seq: number;
  phoneNumber: string;
  otpCode: string;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: string;
  createdAt: string;
  isUsed: number;
}
