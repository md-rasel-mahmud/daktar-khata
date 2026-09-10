import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const errorSetter = (
  error: { data?: { data?: Array<{ field: string; message: string }> } },
  setError: (field: string, error: { type: string; message: string }) => void
) => {
  const data = error?.data?.data
  if (Array.isArray(data) && typeof setError === "function") {
    data.forEach((item) =>
      setError(item.field, {
        type: "manual",
        message: item.message,
      })
    )
  }
}
