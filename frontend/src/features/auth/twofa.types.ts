// 2FA Types
export interface TOTPSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFAStatus {
  is2FAEnabled: boolean;
  isTOTPVerified: boolean;
  backupCodesRemaining: number;
}

export interface VerifyTOTPPayload {
  totpCode: string;
  backupCode?: string;
}
