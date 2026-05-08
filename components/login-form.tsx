"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { apiFailureMessage } from "@/lib/api";
import { getAdminLoginInitialValues, isDevelopmentAdminLoginEnabled, signInAdmin } from "@/lib/admin-auth";

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
    defaultValues: getAdminLoginInitialValues()
  });
  const showDevelopmentHint = isDevelopmentAdminLoginEnabled();

  async function onSubmit(values: LoginValues) {
    try {
      await signInAdmin(values);
      setMessage("");
      router.push("/");
    } catch (error) {
      setMessage(apiFailureMessage(error, "登录失败"));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 grid w-full max-w-[420px] gap-5 rounded-[28px] border border-ivory/18 bg-ivory p-8 text-ink shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
      <div className="text-center">
        <p className="text-sm font-semibold text-gold">Ala.pet Admin</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-normal">Ala.pet 管理后台</h1>
        <p className="mt-3 text-sm leading-6 text-ink/60">宠物行业认证信息发布平台</p>
      </div>
      {showDevelopmentHint ? <p className="rounded-md border border-gold/25 bg-gold/10 px-3 py-2 text-center text-xs font-medium text-ink">开发环境默认账号：admin / admin123456</p> : null}
      <label className="grid gap-2 text-sm font-semibold">
        <span>用户名</span>
        <input className="h-12 rounded-md border border-line bg-white px-4 text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20" autoComplete="username" {...form.register("username")} />
        {form.formState.errors.username ? <span className="text-xs text-gold">{form.formState.errors.username.message}</span> : null}
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        <span>密码</span>
        <input className="h-12 rounded-md border border-line bg-white px-4 text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? <span className="text-xs text-gold">{form.formState.errors.password.message}</span> : null}
      </label>
      <Button type="submit" disabled={form.formState.isSubmitting} className="h-12 rounded-md">
        <LogIn className="h-4 w-4" />
        {form.formState.isSubmitting ? "登录中" : "登录"}
      </Button>
      {message ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}
    </form>
  );
}
