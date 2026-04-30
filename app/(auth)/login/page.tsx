import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-ivory">
      <form className="grid w-full max-w-md gap-5 rounded-md border border-ivory/15 bg-ivory/5 p-8 shadow-soft">
        <div>
          <p className="text-sm font-semibold text-gold">Ala.pet Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">后台登录</h1>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          用户名
          <input className="h-11 rounded-md border border-ivory/20 bg-white px-3 text-ink outline-none focus:border-gold" name="username" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          密码
          <input className="h-11 rounded-md border border-ivory/20 bg-white px-3 text-ink outline-none focus:border-gold" name="password" type="password" required />
        </label>
        <Button type="submit">
          <LogIn className="h-4 w-4" />
          登录
        </Button>
      </form>
    </main>
  );
}