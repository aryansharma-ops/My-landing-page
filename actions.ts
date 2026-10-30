"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminTokenConfigured, expectedCookieValue, verifyToken } from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminTokenConfigured()) {
    return { error: "ADMIN_TOKEN is not configured. Set it in your environment (min. 8 characters), then reload this page." };
  }
  const token = String(formData.get("token") ?? "");
  if (!verifyToken(token)) {
    return { error: "Incorrect token." };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, expectedCookieValue() as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}
