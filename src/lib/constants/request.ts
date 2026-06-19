export const requestTypeOptions = [
  { value: "equipment", label: "備品購入申請" },
  { value: "saas_account", label: "SaaSアカウント発行申請" },
  { value: "permission", label: "権限付与申請" },
  { value: "pc_purchase", label: "PC購入申請" },
  { value: "expense", label: "経費申請" },
];

export const statusOptions = [
  { value: "submitted", label: "申請中" },
  { value: "approved", label: "承認済み" },
  { value: "returned", label: "差戻し" },
  { value: "rejected", label: "却下" },
  { value: "canceled", label: "取消" },
];

export function getRequestTypeLabel(type: string) {
  return requestTypeOptions.find((item) => item.value === type)?.label ?? type;
}

export function getStatusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
}

export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "returned":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}