import { useEffect, useMemo, useState } from 'react';
import supabase from '../../lib/supabase/client';
import { LOGO_URL } from '../../constants';

const ADMIN_PASSWORD = 'Kugiebites@Admin2026';

type AppointmentRow = {
  id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  pet_details: string;
  service_needed: string;
  branch: string;
  requested_datetime: string;
  status: string;
  notes: string | null;
  source_page: string;
};

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAppointments() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus = statusFilter === 'all' ? true : a.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = `${a.customer_name} ${a.email ?? ''} ${a.phone} ${a.pet_details} ${a.service_needed} ${a.branch}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [appointments, query, statusFilter]);

  async function loadData() {
    setIsLoading(true);
    setLoadError('');
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(
          'id,created_at,customer_name,email,phone,pet_details,service_needed,branch,requested_datetime,status,notes,source_page',
        )
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw new Error(error.message);
      setAppointments(data ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (password !== ADMIN_PASSWORD) {
      setPasswordError('Incorrect password');
      return;
    }
    setIsAuthenticated(true);
    await loadData();
  };

  async function updateStatus(id: string, status: AppointmentRow['status']) {
    setUpdatingId(id);
    setLoadError('');
    try {
      const { error } = await supabase
        .from('appointment_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw new Error(error.message);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Kugiebites" className="w-14 h-14 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#c8994f]">Kugiebites Admin</h1>
            <p className="text-slate-500 mt-2">Enter password to continue</p>
          </div>

          <form onSubmit={onLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d03] focus:border-transparent mb-4"
            />
            {passwordError && <p className="text-red-600 text-sm mb-4">{passwordError}</p>}
            {loadError && <p className="text-red-600 text-sm mb-4">{loadError}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f49d03] text-white py-3 rounded-xl font-bold hover:bg-[#f49d03] transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Checking…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#f49d03] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Kugiebites Admin</h1>
            <p className="text-white/70 text-sm">Appointments</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="text-sm bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg disabled:opacity-60"
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setAppointments([]);
                setQuery('');
                setStatusFilter('all');
              }}
              className="text-sm text-white/80 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, contact number, pet, service…"
                className="w-full md:max-w-md px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d03] focus:border-transparent"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#f49d03] focus:border-transparent"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-slate-500 shrink-0">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{appointments.length}</span>
            </div>
          </div>

          {loadError && <p className="text-red-600 text-sm mb-3">{loadError}</p>}

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Requested</th>
                  <th className="text-left font-semibold px-4 py-3">Name &amp; Pet</th>
                  <th className="text-left font-semibold px-4 py-3">Contact number</th>
                  <th className="text-left font-semibold px-4 py-3">Email</th>
                  <th className="text-left font-semibold px-4 py-3">Service</th>
                  <th className="text-left font-semibold px-4 py-3">Branch</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{formatDateTime(a.requested_datetime)}</div>
                      <div className="text-slate-500">Created {formatDateTime(a.created_at)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{a.customer_name}</div>
                      <div className="text-slate-600">{a.pet_details}</div>
                      <div className="text-slate-500 text-xs break-all">{a.source_page}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-800">{a.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-800">{a.email ? a.email : '—'}</td>
                    <td className="px-4 py-3">{a.service_needed}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{a.branch}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        disabled={updatingId === a.id}
                        className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#f49d03] focus:border-transparent disabled:opacity-60"
                      >
                        <option value="new">new</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                      No appointments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
