// authUtils.ts - Complete enhanced version without isLocal logic
import Cookies from "js-cookie";

export interface UserInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export function login() {
  window.location.href = "/auth/login";
}

export function logout() {
  // Clear all stored user info before logout
  clearStoredUserInfo();

  const sessionHint = Cookies.get("session_hint");
  window.location.href = `/auth/logout?session_hint=${sessionHint}`;
}

export function getUserInfoFromCookie(): UserInfo | null {
  const encodedUserInfo = Cookies.get("userinfo");
  if (encodedUserInfo) {
    try {
      const userInfo = JSON.parse(atob(encodedUserInfo));
      Cookies.remove("userinfo", { path: "/" });
      return userInfo;
    } catch (e) {
      Cookies.remove("userinfo", { path: "/" });
      return null;
    }
  }
  return null;
}

export async function getUserInfoFromEndpoint(): Promise<UserInfo | null> {
  try {
    const response = await fetch("/auth/userinfo");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

// New utility functions for user info persistence
export function storeUserInfo(userInfo: UserInfo): void {
  const userInfoString = JSON.stringify(userInfo);
  localStorage.setItem("userInfo", userInfoString);
  sessionStorage.setItem("userInfo", userInfoString);
}

export function getStoredUserInfo(): UserInfo | null {
  // Try localStorage first
  let userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch {
      // If parsing fails, remove corrupted data
      localStorage.removeItem("userInfo");
    }
  }

  // Try sessionStorage as fallback
  userInfo = sessionStorage.getItem("userInfo");
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch {
      // If parsing fails, remove corrupted data
      sessionStorage.removeItem("userInfo");
    }
  }

  return null;
}

export function clearStoredUserInfo(): void {
  localStorage.removeItem("userInfo");
  sessionStorage.removeItem("userInfo");
}

// Main function to get user info from any available source
export async function getUserInfo(): Promise<UserInfo | null> {
  // First, check if we have stored user info
  let userInfo = getStoredUserInfo();
  if (userInfo) {
    return userInfo;
  }

  // If not in storage, try cookie
  userInfo = getUserInfoFromCookie();
  if (userInfo) {
    storeUserInfo(userInfo);
    return userInfo;
  }

  // If not in cookie, try endpoint
  userInfo = await getUserInfoFromEndpoint();
  if (userInfo) {
    storeUserInfo(userInfo);
    return userInfo;
  }

  return null;
}

export async function performGet(url: string) {
  try {
    const response = await fetch(url);
    if (response.status === 401) {
      // Clear user info on unauthorized access
      clearStoredUserInfo();
      window.location.href = "/auth/login";
    }
    return response;
  } catch (error) {
    throw error;
  }
}
