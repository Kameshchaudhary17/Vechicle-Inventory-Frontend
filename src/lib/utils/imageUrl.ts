import { env } from "../../config/env";

export function partImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  return `${env.apiUrl.replace(/\/api$/, "")}${imagePath}`;
}
