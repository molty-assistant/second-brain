'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import type { FunctionReference } from 'convex/server';
import { convexApi } from '@/lib/convexApi';
import { Plus, X } from 'lucide-react';

type WorkOrderPriority = 'now' | 'next' | 'later';
type WorkOrderStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
type WorkOrderWorker = 'codex' | 'claude' | 'lmstudio' | 'molty';

type WorkOrder = {
  _id: string;
  id: string;
  title: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  worker: WorkOrderWorker;
  repo?: string;
  acceptance: string[];
  constraints: string[];
  links?: string[];
  createdAt: number;
  updatedAt: number;
};

type ListWorkOrdersArgs = {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  worker?: WorkOrderWorker;
  limit?: number;
};

type CreateWorkOrderArgs = {
  id?: string;
  title: string;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  worker?: WorkOrderWorker;
  repo?: string;
  acceptance?: string[];
  constraints?: string[];
  links?: string[];
};

const priorities: WorkOrderPriority[] = ['now', 'next', 'later'];
const statuses: WorkOrderStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked'];
const workers: WorkOrderWorker[] = ['codex', 'claude', 'lmstudio', 'molty'];

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function splitLines(value: FormDataEntryValue | null) {
  if (!value) return [];
  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function prettyStatus(status: WorkOrderStatus) {
  return status === 'in_progress' ? 'In Progress' : status.replace('_', ' ');
}

export default function WorkOrdersClient() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [worker, setWorker] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listArgs = useMemo(
    () => ({
      status: (status || undefined) as WorkOrderStatus | undefined,
      priority: (priority || undefined) as WorkOrderPriority | undefined,
      worker: (worker || undefined) as WorkOrderWorker | undefined,
      limit: 200,
    }),
    [priority, status, worker],
  );

  const listRef = convexApi.workOrders.list as unknown as FunctionReference<
    'query',
    'public',
    ListWorkOrdersArgs,
    WorkOrder[]
  >;
  const createRef = convexApi.workOrders.create as unknown as FunctionReference<
    'mutation',
    'public',
    CreateWorkOrderArgs,
    WorkOrder
  >;

  const orders = useQuery(listRef, listArgs);
  const createWorkOrder = useMutation(createRef);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    if (!title) return;

    setIsSubmitting(true);
    try {
      await createWorkOrder({
        title,
        priority: formData.get('priority') as WorkOrderPriority,
        status: formData.get('status') as WorkOrderStatus,
        worker: formData.get('worker') as WorkOrderWorker,
        repo: String(formData.get('repo') || '').trim() || undefined,
        acceptance: splitLines(formData.get('acceptance')),
        constraints: splitLines(formData.get('constraints')),
        links: splitLines(formData.get('links')),
      });

      event.currentTarget.reset();
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All status</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {prettyStatus(value)}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All priority</option>
          {priorities.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All workers</option>
          {workers.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Work Order</span>
        </button>
      </div>

      <div className="border border-[#30363d] rounded-lg overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-[#161b22]">
            <tr className="text-left text-[#8b949e] border-b border-[#30363d]">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Worker</th>
              <th className="px-3 py-2 font-medium">Repo</th>
              <th className="px-3 py-2 font-medium">Acceptance</th>
              <th className="px-3 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order._id} className="border-b border-[#30363d]/70 text-[#e6edf3]">
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{order.id}</td>
                <td className="px-3 py-2 min-w-[220px]">{order.title}</td>
                <td className="px-3 py-2 whitespace-nowrap">{order.priority}</td>
                <td className="px-3 py-2 whitespace-nowrap">{prettyStatus(order.status)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{order.worker}</td>
                <td className="px-3 py-2 whitespace-nowrap text-[#8b949e]">{order.repo || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{order.acceptance.length}</td>
                <td className="px-3 py-2 whitespace-nowrap text-[#8b949e]">{formatDate(order.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders && orders.length === 0 && (
          <div className="text-center py-10 text-[#6e7681]">No work orders match the selected filters.</div>
        )}

        {!orders && <div className="px-3 py-8 text-[#6e7681]">Loading…</div>}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Create Work Order</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#8b949e] hover:text-[#e6edf3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Priority</label>
                  <select
                    name="priority"
                    defaultValue="next"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3]"
                  >
                    {priorities.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Status</label>
                  <select
                    name="status"
                    defaultValue="todo"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3]"
                  >
                    {statuses.map((value) => (
                      <option key={value} value={value}>
                        {prettyStatus(value)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Worker</label>
                  <select
                    name="worker"
                    defaultValue="codex"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3]"
                  >
                    {workers.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Repo (optional)</label>
                <input
                  type="text"
                  name="repo"
                  placeholder="owner/repo"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">
                    Acceptance (one per line)
                  </label>
                  <textarea
                    name="acceptance"
                    rows={4}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">
                    Constraints (one per line)
                  </label>
                  <textarea
                    name="constraints"
                    rows={4}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Links (one per line)</label>
                <textarea
                  name="links"
                  rows={3}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] resize-none"
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#30363d] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-2 text-[#8b949e] hover:text-[#e6edf3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
