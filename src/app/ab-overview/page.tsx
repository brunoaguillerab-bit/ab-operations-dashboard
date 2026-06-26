import DashboardLayout from '@/components/DashboardLayout';
import OverviewDashboard from '@/components/OverviewDashboard';

export default function ABOverviewPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0F1117]">
        <OverviewDashboard />
      </div>
    </DashboardLayout>
  );
}
