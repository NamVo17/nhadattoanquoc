/**
 * Package Status Utils
 * Utilities for determining and displaying package status
 */

export type PackageStatus = 'đang hiển thị' | 'hết hạn' | 'chờ duyệt' | 'miễn phí';

export interface PackageStatusInfo {
  status: PackageStatus;
  label: string;
  className: string;
  daysRemaining?: number;
}

/**
 * Get package status based on payment_status and package_expires_at
 */
export function getPackageStatus(
  paymentStatus: string | null | undefined,
  packageExpiresAt: string | null | undefined,
  isApproved: boolean | null | undefined
): PackageStatusInfo {
  // If not approved, show pending
  if (isApproved === false) {
    return {
      status: 'chờ duyệt',
      label: 'Chờ duyệt',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  // If has payment status (paid package)
  if (paymentStatus === 'đang hiển thị' || paymentStatus === 'success') {
    if (packageExpiresAt) {
      const expiryDate = new Date(packageExpiresAt);
      const now = new Date();
      
      if (expiryDate < now) {
        return {
          status: 'hết hạn',
          label: 'Hết hạn',
          className: 'bg-slate-100 text-slate-500',
        };
      }

      // Calculate days remaining
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return {
        status: 'đang hiển thị',
        label: `Đang hiển thị (${daysRemaining} ngày)`,
        className: 'bg-emerald-100 text-emerald-700',
        daysRemaining,
      };
    }

    return {
      status: 'đang hiển thị',
      label: 'Đang hiển thị',
      className: 'bg-emerald-100 text-emerald-700',
    };
  }

  // Default: free package
  return {
    status: 'miễn phí',
    label: 'Miễn phí',
    className: 'bg-blue-100 text-blue-700',
  };
}

/**
 * Get package label with expiry info for display
 */
export function formatPackageDisplay(
  packageType: string | null | undefined,
  paymentStatus: string | null | undefined,
  packageExpiresAt: string | null | undefined
): string {
  if (!packageType || packageType === 'free') {
    return 'Gói Miễn phí';
  }

  const statusInfo = getPackageStatus(paymentStatus, packageExpiresAt, true);
  
  if (statusInfo.daysRemaining !== undefined) {
    const packageLabel = packageType === 'vip' ? 'VIP' : 'Kim Cương';
    return `${packageLabel} - ${statusInfo.label}`;
  }

  return packageType === 'vip' ? 'VIP' : 'Kim Cương';
}
