export type RequestStatus = "申請中" | "承認済み" | "差戻し" | "却下";

export type RequestItem = {
  id: string;
  title: string;
  type: string;
  applicant: string;
  applicantDepartment: string;
  approver: string;
  status: RequestStatus;
  amount: string;
  createdAt: string;
  dueDate: string;
  reason: string;
};

export const mockRequests: RequestItem[] = [
  {
    id: "REQ-001",
    title: "SaaSアカウント発行申請",
    type: "SaaSアカウント発行申請",
    applicant: "佐藤 花子",
    applicantDepartment: "マーケティング部",
    approver: "山田 太郎",
    status: "申請中",
    amount: "-",
    createdAt: "2026/05/28 10:24",
    dueDate: "2026/06/03",
    reason:
      "新規広告運用ツールの利用開始に伴い、マーケティング部で利用するSaaSアカウントの発行を申請します。広告レポート作成と運用状況の確認に必要です。",
  },
  {
    id: "REQ-002",
    title: "ノートPC購入申請",
    type: "備品購入申請",
    applicant: "田中 一郎",
    applicantDepartment: "営業部",
    approver: "山田 太郎",
    status: "承認済み",
    amount: "180,000円",
    createdAt: "2026/05/27 09:10",
    dueDate: "2026/06/10",
    reason:
      "営業活動で使用しているPCの動作が不安定なため、業務継続性の観点から新しいノートPCの購入を申請します。",
  },
  {
    id: "REQ-003",
    title: "経費精算申請",
    type: "経費申請",
    applicant: "鈴木 健太",
    applicantDepartment: "経営管理部",
    approver: "山田 太郎",
    status: "差戻し",
    amount: "12,800円",
    createdAt: "2026/05/26 14:35",
    dueDate: "2026/06/01",
    reason:
      "外部セミナー参加費用の経費精算を申請します。領収書の添付と費用区分の確認が必要です。",
  },
  {
    id: "REQ-004",
    title: "権限付与申請",
    type: "権限付与申請",
    applicant: "高橋 美咲",
    applicantDepartment: "人事部",
    approver: "山田 太郎",
    status: "却下",
    amount: "-",
    createdAt: "2026/05/25 16:20",
    dueDate: "2026/05/31",
    reason:
      "採用管理システムの管理者権限付与を申請します。候補者情報の更新作業に必要です。",
  },
];

export const mockComments = [
  {
    id: 1,
    requestId: "REQ-001",
    user: "佐藤 花子",
    role: "申請者",
    body: "広告運用開始前に必要なため、6月3日までに発行をお願いします。",
    createdAt: "2026/05/28 10:24",
  },
  {
    id: 2,
    requestId: "REQ-001",
    user: "山田 太郎",
    role: "承認者",
    body: "利用目的を確認しました。対象ツールの管理者権限は必要ですか？",
    createdAt: "2026/05/28 11:02",
  },
];

export const mockAuditLogs = [
  {
    id: 1,
    requestId: "REQ-001",
    action: "申請作成",
    user: "佐藤 花子",
    createdAt: "2026/05/28 10:24",
  },
  {
    id: 2,
    requestId: "REQ-001",
    action: "コメント追加",
    user: "山田 太郎",
    createdAt: "2026/05/28 11:02",
  },
];