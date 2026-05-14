"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return { ok: true, message: "登入成功" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "帳號或密碼不正確" };
    }
    throw error;
  }
}
