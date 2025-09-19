import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Layers, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const switchMode = () => {
    setMode(m => (m === "login" ? "register" : "login"));
    setErr(undefined);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);

    if (!email) return setErr("Email is required");
    if (!password) return setErr("Password is required");
    if (mode === "register" && !name.trim()) return setErr("Name is required");

    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(email.trim(), password, name.trim());
        toast.success("Account created");
      }
      await login(email.trim(), password);
      toast.success("Welcome!");
      nav("/", { replace: true });
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Authentication failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-12">
      <aside className="hidden md:flex col-span-7 bg-white/40 backdrop-blur-sm">
        <div className="relative flex-1 grid place-items-center">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="h-full w-full"
              style={{
                background:
                  "radial-gradient(1000px 500px at -10% -10%, #c7d2fe 0%, transparent 60%), radial-gradient(1200px 600px at 110% -20%, #e2e8f0 0%, transparent 60%)"
              }}
            />
          </div>
          <div className="max-w-xl px-10">
            <div className="flex items-center gap-3 text-3xl font-bold text-slate-900 mb-6">
              <Layers /> SmartReno
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Estimate faster. Sync everything.</h1>
            <p className="text-slate-600 mb-6">
              One lightweight plugin that receives homeowner intakes, auto-books estimator appointments,
              and syncs photos, notes, and PDFs ready for Buildertrend, Procore, Buildxact, or ServiceTitan.
            </p>
          </div>
        </div>
      </aside>

      <main className="col-span-12 md:col-span-5 grid place-items-center px-6 py-10">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader>
              <div className="text-sm text-slate-500 mb-1">SmartReno Plugin</div>
              <h2 className="text-2xl font-semibold">
                {mode === "login" ? "Sign in to your account" : "Create your account"}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-3">
                {mode === "register" && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><User size={16}/></span>
                      <Input className="pl-9" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Mail size={16}/></span>
                    <Input
                      className="pl-9"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Lock size={16}/></span>
                    <Input
                      className="pl-9 pr-10"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1.5 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                      onClick={() => setShowPw(s => !s)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {err && <div className="text-rose-600 text-sm">{err}</div>}

                <Button type="submit" disabled={submitting} className="w-full justify-center text-center">
                  {submitting ? (mode === "login" ? "Signing in…" : "Creating…")
                              : (mode === "login" ? "Sign in" : "Create account")}
                </Button>

                <div className="text-xs text-slate-500 text-center">
                  By continuing you agree to our <span className="underline">Terms</span> & <span className="underline">Privacy</span>.
                </div>

                <div className="text-sm text-center text-slate-600 pt-1">
                  {mode === "login" ? (
                    <>No account?{" "}
                      <button type="button" onClick={switchMode}
                              className="underline cursor-pointer text-center">Create one</button></>
                  ) : (
                    <>Have an account?{" "}
                      <button type="button" onClick={switchMode}
                              className="underline cursor-pointer">Sign in</button></>
                  )}
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
