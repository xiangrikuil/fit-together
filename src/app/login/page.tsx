import { Dumbbell, LockKeyhole } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  SHARED_PASSWORD_COOKIE_NAME,
  isValidSharedPasswordSession,
  sanitizeLoginRedirect,
} from "@/features/auth/shared-password";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const next = sanitizeLoginRedirect(query.next);
  const cookieStore = await cookies();
  const session = cookieStore.get(SHARED_PASSWORD_COOKIE_NAME)?.value;

  if (isValidSharedPasswordSession(session, process.env)) {
    redirect(next);
  }

  const errorMessage = getLoginErrorMessage(query.error);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--background),color-mix(in_oklch,var(--muted),var(--background)_70%))] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm flex-col justify-center gap-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Fit Together
              </p>
              <p className="text-xs text-muted-foreground">共享房间</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">输入密码</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              登录状态会保存在这台设备上。
            </p>
          </div>
        </div>

        <form
          action="/api/auth/login"
          method="post"
          className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm font-medium">
            共享密码
            <input
              autoComplete="current-password"
              autoFocus
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              name="password"
              placeholder="Password"
              required
              type="password"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-5 text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-10 w-full")}
          >
            <LockKeyhole className="size-4" />
            进入房间
          </button>
        </form>
      </section>
    </main>
  );
}

const getLoginErrorMessage = (error?: string) => {
  if (error === "config") {
    return "服务器还没有配置 ROOM_PASSWORD。";
  }

  if (error === "invalid") {
    return "密码不对。";
  }

  return null;
};
