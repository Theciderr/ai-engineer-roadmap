'use client';

import { useEffect, useState } from 'react';
import { Job } from '@/lib/db';

const STAGES = ['Applied', 'Screen', 'Interview', 'Offer', 'Rejected'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ company: '', role: '', url: '' });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addJob(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date_applied: new Date().toISOString().slice(0, 10) }),
      });
      const job = await res.json();
      setJobs((prev) => [job, ...prev]);
      setForm({ company: '', role: '', url: '' });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStage(job: Job, stage: string) {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, stage } : j)));
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  }

  async function removeJob(job: Job) {
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-4xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Applications
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        Job pipeline
      </h1>

      <form
        onSubmit={addJob}
        className="bg-panel border border-rail rounded-panel p-5 shadow-panel mb-8 grid gap-3 md:grid-cols-4"
      >
        <input
          className="bg-hull border border-rail rounded-md px-3 py-2 text-sm text-slate-bright placeholder:text-slate-dim md:col-span-1"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
        />
        <input
          className="bg-hull border border-rail rounded-md px-3 py-2 text-sm text-slate-bright placeholder:text-slate-dim md:col-span-1"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
        />
        <input
          className="bg-hull border border-rail rounded-md px-3 py-2 text-sm text-slate-bright placeholder:text-slate-dim md:col-span-1"
          placeholder="Job URL (optional)"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber text-hull font-medium rounded-md px-3 py-2 text-sm hover:bg-amber-dim transition-colors disabled:opacity-50"
        >
          Log application
        </button>
      </form>

      {loading ? (
        <div className="text-slate-dim">Loading pipeline…</div>
      ) : jobs.length === 0 ? (
        <div className="text-slate-dim text-sm">
          No applications logged yet. Add your first one above — Week 1 already calls for 5/day.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li key={j.id} className="bg-panel border border-rail rounded-panel p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-slate-bright text-sm font-medium">
                    {j.role} · {j.company}
                  </div>
                  {j.url && (
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-amber hover:text-amber-dim break-all"
                    >
                      {j.url}
                    </a>
                  )}
                  {j.date_applied && (
                    <div className="text-xs text-slate-dim mt-1">Applied {j.date_applied}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={j.stage}
                    onChange={(e) => updateStage(j, e.target.value)}
                    className="bg-hull border border-rail rounded-md px-2 py-1 text-xs text-slate-bright"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeJob(j)}
                    className="text-xs text-coral hover:text-coral/70"
                    aria-label={`Remove ${j.role} at ${j.company}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
