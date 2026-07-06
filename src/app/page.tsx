import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--background),color-mix(in_oklch,var(--muted),var(--background)_72%))] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center gap-8">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="size-6" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Fit Together
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            双人健身打卡房间
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            进入房间后选择身份 A/B，今日训练、休息、备注和月度统计都按中国自然日计算。
          </p>
        </div>
        <Link
          href="/room/fit-together"
          className={cn(buttonVariants({ size: "lg" }), "w-fit")}
        >
          进入默认房间
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
