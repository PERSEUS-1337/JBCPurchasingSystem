import { PageLayout } from "@/components/layout/PageLayout";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export function ComingSoonPage({
  title,
  description = "This module is not available yet.",
}: ComingSoonPageProps) {
  return (
    <PageLayout title={title} description={description}>
      <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-neutral-200 bg-white">
        <p className="text-center text-sm text-neutral-600">Feature coming soon.</p>
      </div>
    </PageLayout>
  );
}
