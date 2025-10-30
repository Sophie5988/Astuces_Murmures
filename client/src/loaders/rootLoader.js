import { getCurrentUser } from "../api/auth.api";

export async function rootLoader() {
  return getCurrentUser();
}
