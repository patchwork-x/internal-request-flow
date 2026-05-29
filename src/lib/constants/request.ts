export function getStatusVariant(status: string) {
  switch (status) {
    case "承認済み":
      return "default";
    case "差戻し":
      return "secondary";
    case "却下":
      return "destructive";
    default:
      return "outline";
  }
}