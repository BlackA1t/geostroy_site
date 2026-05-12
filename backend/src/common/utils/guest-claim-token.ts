import { createHash, randomBytes } from "crypto";

export const GUEST_REQUEST_COOKIE_NAME = "geostroy_guest_request";
export const GUEST_REQUEST_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function generateGuestRequestToken() {
  return randomBytes(32).toString("base64url");
}

export function hashGuestRequestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
