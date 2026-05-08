export const adminTokenStorageKey = "ala_pet_admin_token";

export function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(adminTokenStorageKey) ?? "";
}

export function saveAdminToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(adminTokenStorageKey, token);
  }
}

export function clearAdminToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(adminTokenStorageKey);
  }
}