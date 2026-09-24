import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Modal } from '../../../components/Modal';
import { supabase } from '../../../main';
import { RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../../components/Card';

interface Order {
  id: string;
  project_id: string;
  work_date: string;
  team: string;
  exchange: string;
  order_number: string;
  contact: string;
  lo: string;
  service_identifier: string;
  order_type: string;
  block: string;
  road: string;
  building: string;
  flat: string;
  slot: string;
  package: string;
  cpr_cr: string;
  controller_remarks: string;
  appointment: string;
  task_created_at: string;
  order_created_at: string;
  connection_type: string;
  fttr_type: string;
  action: string;
  sub_root_cause: string;
  item_category: string;
  technician_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Technician {
  id: string;
  full_name: string;
  employee_code: string;
}

type SortDirection = 'asc' | 'desc';
type SortConfig = { key: keyof Order; direction: SortDirection } | null;

const Spreadsheet: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('orders').select('*').order('work_date', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'technician');
      if (error) throw error;
      return data as Technician[];
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('orders').update(order).eq('id', order.id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const filteredOrders = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.filter(order => {
      const matchesSearch = searchTerm === '' ||
        Object.values(order).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProject = filterProject === '' || order.project_id === filterProject;
      const matchesTechnician = filterTechnician === '' || order.technician_id === filterTechnician;
      const matchesAction = filterAction === '' || order.action === filterAction;
      return matchesSearch && matchesProject && matchesTechnician && matchesAction;
    });
  }, [ordersData, searchTerm, filterProject, filterTechnician, filterAction]);

  const sortedOrders = useMemo(() => {
    if (!sortConfig) return filteredOrders;
    return [...filteredOrders].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === null || bVal === null) return 0;
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredOrders, sortConfig]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, page]);

  const totalPages = Math.ceil(sortedOrders.length / pageSize);

  const requestSort = (key: keyof Order) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSaveOrder = () => {
    if (selectedOrder) {
      updateOrderMutation.mutate(selectedOrder);
      setIsModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleCellChange = (field: keyof Order, value: string) => {
    setSelectedOrder(prev => prev ? { ...prev, [field]: value } : null);
  };

  const exportToCSV = () => {
    if (!ordersData || ordersData.length === 0) return;
    const headers = Object.keys(ordersData[0]).join(',');
    const rows = ordersData.map(order => Object.values(order).map(v => `"${v ?? ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-neutral-900 dark:text-neutral-50">Service Delivery Orders</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {sortedOrders.length} orders found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            label="Project"
            value={filterProject}
            onChange={(e) => { setFilterProject(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Projects' }, ...(projects || []).map(p => ({ value: p.id, label: p.name }))]}
          />
          <Select
            label="Technician"
            value={filterTechnician}
            onChange={(e) => { setFilterTechnician(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Technicians' }, ...(technicians || []).map(t => ({ value: t.id, label: t.full_name }))]}
          />
          <Select
            label="Action"
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            options={actionOptions}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isOrdersLoading ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">Loading orders...</div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">No orders found matching your filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  {[
                    { key: 'order_number', label: 'Order #' },
                    { key: 'work_date', label: 'Date' },
                    { key: 'team', label: 'Team' },
                    { key: 'exchange', label: 'Exchange' },
                    { key: 'block', label: 'Block' },
                    { key: 'road', label: 'Road' },
                    { key: 'building', label: 'Building' },
                    { key: 'flat', label: 'Flat' },
                    { key: 'contact', label: 'Contact' },
                    { key: 'action', label: 'Action' },
                    { key: 'technician_id', label: 'Technician' },
                  ].map(column => (
                    <th
                      key={column.key}
                      onClick={() => requestSort(column.key as keyof Order)}
                      className="px-4 py-3 text-left text-table-header text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {sortConfig?.key === column.key && (
                          sortConfig.direction === 'asc'
                            ? <ChevronUp className="w-3 h-3" aria-hidden="true" />
                            : <ChevronDown className="w-3 h-3" aria-hidden="true" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-table-header text-neutral-500 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 text-body-sm font-medium text-neutral-900 dark:text-neutral-50 whitespace-nowrap">{order.order_number}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {order.work_date ? new Date(order.work_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.team || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.exchange || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.block || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.road || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.building || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.flat || '-'}</td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{order.contact || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-caption font-medium ${
                        order.action === 'Delivered'
                          ? 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400'
                          : order.action === 'Pending'
                            ? 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {order.action || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {order.technician_id ? technicians?.find(t => t.id === order.technician_id)?.full_name || 'Unknown' : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-neutral-500 dark:text-neutral-400">
            Page {page} of {totalPages} ({sortedOrders.length} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
          title={`Edit Order #${selectedOrder.order_number}`}
          size="xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => { setIsModalOpen(false); setSelectedOrder(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveOrder} isLoading={updateOrderMutation.isPending}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Order Number" value={selectedOrder.order_number} onChange={(e) => handleCellChange('order_number', e.target.value)} />
            <Input label="Work Date" type="date" value={selectedOrder.work_date?.split('T')[0] || ''} onChange={(e) => handleCellChange('work_date', e.target.value)} />
            <Input label="Team" value={selectedOrder.team || ''} onChange={(e) => handleCellChange('team', e.target.value)} />
            <Input label="Exchange" value={selectedOrder.exchange || ''} onChange={(e) => handleCellChange('exchange', e.target.value)} />
            <Input label="Block" value={selectedOrder.block || ''} onChange={(e) => handleCellChange('block', e.target.value)} />
            <Input label="Road" value={selectedOrder.road || ''} onChange={(e) => handleCellChange('road', e.target.value)} />
            <Input label="Building" value={selectedOrder.building || ''} onChange={(e) => handleCellChange('building', e.target.value)} />
            <Input label="Flat" value={selectedOrder.flat || ''} onChange={(e) => handleCellChange('flat', e.target.value)} />
            <Input label="Contact" value={selectedOrder.contact || ''} onChange={(e) => handleCellChange('contact', e.target.value)} />
            <Select
              label="Action"
              value={selectedOrder.action || ''}
              onChange={(e) => handleCellChange('action', e.target.value)}
              options={actionOptions}
            />
            <Select
              label="Technician"
              value={selectedOrder.technician_id || ''}
              onChange={(e) => handleCellChange('technician_id', e.target.value)}
              options={[{ value: '', label: 'Unassigned' }, ...(technicians || []).map(t => ({ value: t.id, label: t.full_name }))]}
            />
            <Input label="Package" value={selectedOrder.package || ''} onChange={(e) => handleCellChange('package', e.target.value)} />
            <Input label="Slot" value={selectedOrder.slot || ''} onChange={(e) => handleCellChange('slot', e.target.value)} />
            <Input label="Connection Type" value={selectedOrder.connection_type || ''} onChange={(e) => handleCellChange('connection_type', e.target.value)} />
            <Input label="FTTR Type" value={selectedOrder.fttr_type || ''} onChange={(e) => handleCellChange('fttr_type', e.target.value)} />
            <Input label="Appointment" value={selectedOrder.appointment || ''} onChange={(e) => handleCellChange('appointment', e.target.value)} />
            <Input label="Controller Remarks" value={selectedOrder.controller_remarks || ''} onChange={(e) => handleCellChange('controller_remarks', e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Spreadsheet;