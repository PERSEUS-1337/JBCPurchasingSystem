import { ReactNode } from "react";

type PageLayoutProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PageLayout({ title, description, action, children }: PageLayoutProps) {
  return (
    <section className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>

      <div className="min-w-0">{children}</div>
    </section>
  );
}
