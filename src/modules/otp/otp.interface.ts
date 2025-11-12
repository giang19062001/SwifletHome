export interface IOtp {
  seq: number;
  userPhone: string;
  otpCode: string;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: string;
  createdAt: string;
  isUsed: number;
}
