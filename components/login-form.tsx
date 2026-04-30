"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { loginAdmin, saveAdminToken } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(2, "请输入用户名"),
  password: z.string().min(4, "请输入密码")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "admin", password: "AlaPet@2026" }
  });

  async function onSubmit(values: LoginValues) {
    try {
      const result = await loginAdmin(values);
      saveAdminToken(result.token);
      setMessage("登录成功");
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full max-w-md gap-5 rounded-md border border-ivory/15 bg-ivory/5 p-8 shadow-soft">
      <div>
        <p className="text-sm font-semibold text-gold">Ala.pet Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">后台登录</h1>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        用户名
        <input className="h-11 rounded-md border border-ivory/20 bg-white px-3 text-ink outline-none focus:border-gold" {...form.register("username")} />
        {form.formState.errors.username ? <span className="text-xs text-gold">{form.formState.errors.username.message}</span> : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        密码
        <input className="h-11 rounded-md border border-ivory/20 bg-white px-3 text-ink outline-none focus:border-gold" type="password" {...form.register("password")} />
        {form.formState.errors.password ? <span className="text-xs text-gold">{form.formState.errors.password.message}</span> : null}
      </label>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <LogIn className="h-4 w-4" />
        {form.formState.isSubmitting ? "登录中" : "登录"}
      </Button>
      {message ? <p className="text-sm text-ivory/75">{message}</p> : null}
    </form>
  );
}
