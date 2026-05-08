import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(135deg,#0b0f0d,#17382f_48%,#111513)] px-4 py-12 text-ivory">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f7f2e8]/12 to-transparent" aria-hidden="true" />
      <LoginForm />
    </main>
  );
}