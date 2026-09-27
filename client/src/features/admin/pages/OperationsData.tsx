import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, RefreshCw, ServerCrash, Users } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { api } from '../../assurance/api';

async function readJson(path: string) {
  return api(path);
}

const OperationsData: React.FC = () => {
  const staff = useQuery({ queryKey: ['legacy-aolms', 'staff-stats'], queryFn: () => readJson('/staff/stats'), retry: false });
  const serviceDelivery = useQuery({ queryKey: ['legacy-aolms', 'service-delivery-status'], queryFn: () => readJson('/service-delivery/status'), retry: false });
  const refresh = () => { void staff.refetch(); void serviceDelivery.refetch(); };

  const staffStats = staff.data as Record<string, unknown> | undefined;
  const deliveryStatus = serviceDelivery.data as Record<string, unknown> | undefined;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-h2 font-semibold text-neutral-900 dark:text-neutral-50">Operations Data</h1><p className="mt-1 text-body-sm text-neutral-500 dark:text-neutral-400">Staff and delivery service status.</p></div>
      <Button variant="secondary" onClick={refresh} isLoading={staff.isFetching || serviceDelivery.isFetching} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
    </div>
    {(staff.error || serviceDelivery.error) && <Card className="flex gap-3 border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950/30"><ServerCrash className="mt-0.5 h-5 w-5 shrink-0 text-warning-700" /><div><p className="font-medium text-warning-800 dark:text-warning-200">Operations service is unavailable</p><p className="text-sm text-warning-700 dark:text-warning-300">Please refresh or contact your administrator if this continues.</p></div></Card>}
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Staff records" subtitle="Staff directory"><div className="mt-2 flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-950 dark:text-primary-300"><Users className="h-6 w-6" /></div><div><p className="text-2xl font-semibold">{staff.isLoading ? '…' : String(staffStats?.total ?? staffStats?.totalStaff ?? '—')}</p><p className="text-sm text-neutral-500 dark:text-neutral-400">total staff loaded</p></div></div></Card>
      <Card title="Service delivery" subtitle="Delivery processing"><div className="mt-2 flex items-center gap-3"><div className="rounded-xl bg-success-50 p-3 text-success-600 dark:bg-success-950 dark:text-success-300"><Database className="h-6 w-6" /></div><div><p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{serviceDelivery.isLoading ? 'Checking connection…' : deliveryStatus ? 'Connected and ready' : 'Unavailable'}</p><p className="text-sm text-neutral-500 dark:text-neutral-400">{deliveryStatus ? Object.entries(deliveryStatus).slice(0, 2).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') : 'Upload and verification services'}</p></div></div></Card>
    </div>
  </div>;
};

export default OperationsData;
