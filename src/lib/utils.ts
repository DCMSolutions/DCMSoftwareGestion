import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function nameInitials(name: string) {
  const [firstName, lastName] = name.split(" ");
  return `${firstName?.[0] ?? ""}${lastName ? lastName[0] : ""}`;
}
export function createId() {
  return nanoid();
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
