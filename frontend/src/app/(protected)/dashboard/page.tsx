import { PageLayout } from "@/components/layout/PageLayout";

export default function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="Module summary will be populated in Phase 4."
    >
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Dashboard baseline is ready. Continue with User/Auth and master data modules.
      </div>
    </PageLayout>
  );
}
