import { z } from "zod";

export const requestFormSchema = z.object({
  title: z
    .string()
    .min(1, "申請タイトルは必須です")
    .max(100, "申請タイトルは100文字以内で入力してください"),

  requestType: z
    .string()
    .min(1, "申請種別を選択してください"),

  amount: z
    .string()
    .optional(),

  dueDate: z
    .string()
    .min(1, "希望期限を入力してください"),

  approver: z
    .string()
    .min(1, "承認者を選択してください"),

  reason: z
    .string()
    .min(10, "申請理由は10文字以上で入力してください")
    .max(1000, "申請理由は1000文字以内で入力してください"),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;