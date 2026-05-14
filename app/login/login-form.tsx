"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button className="w-full" disabled={pending}>{pending ? "登入中..." : "登入"}</Button>;
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { ok: false, message: "" });
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Product Database 登入</CardTitle>
        <CardDescription>請使用公司內部帳號登入。Demo 帳號請參考 README。</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" name="email" placeholder="admin@example.com" required type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Input id="password" minLength={8} name="password" required type="password" />
          </div>
          {state.message ? <p className={state.ok ? "text-sm text-green-600" : "text-sm text-red-600"}>{state.message}</p> : null}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
