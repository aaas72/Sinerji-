export type ApiResponse<T> = {
  status: "ok" | "error";
  data?: T;
  error?: string;
};