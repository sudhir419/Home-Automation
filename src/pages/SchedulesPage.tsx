// ============================================================
// SCHEDULES PAGE
// ============================================================
import { useState } from 'react';
import {
  Plus, Clock, Trash2, Edit2, Power, Pause, Play,
  Calendar, AlertTriangle, ChevronDown, X, Check,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Schedule, RepeatFrequency, ScheduleAction } from '../models/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REPEAT_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Every Day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
];

interface FormState {
  name: string;
  deviceIds: string[];
  action: ScheduleAction;
  time: string;
  endTime: string;
  repeat: RepeatFrequency;
  days: number[];
  startDate: string;
  endDate: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  deviceIds: [],
  action: 'on',
  time: '19:00',
  endTime: '',
  repeat: 'daily',
  days: [0, 1, 2, 3, 4, 5, 6],
  startDate: '',
  endDate: '',
  enabled: true,
};

export default function SchedulesPage() {
  const schedules = useAppStore((s) => s.schedules);
  const devices = useAppStore((s) => s.devices);
  const addSchedule = useAppStore((s) => s.addSchedule);
  const updateSchedule = useAppStore((s) => s.updateSchedule);
  const deleteSchedule = useAppStore((s) => s.deleteSchedule);
  const toggleSchedule = useAppStore((s) => s.toggleSchedule);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(sched: Schedule) {
    setForm({
      name: sched.name,
      deviceIds: sched.deviceIds,
      action: sched.action,
      time: sched.time,
      endTime: sched.endTime ?? '',
      repeat: sched.repeat,
      days: sched.days,
      startDate: sched.startDate ?? '',
      endDate: sched.endDate ?? '',
      enabled: sched.enabled,
    });
    setEditId(sched.id);
    setErrors({});
    setShowForm(true);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Schedule name is required';
    if (form.deviceIds.length === 0) errs.deviceIds = 'Select at least one device';
    if (!form.time) errs.time = 'Time is required';
    if (form.endTime && form.endTime <= form.time) errs.endTime = 'End time must be after start time';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      deviceIds: form.deviceIds,
      action: form.action,
      time: form.time,
      endTime: form.endTime || null,
      repeat: form.repeat,
      days: form.days,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      enabled: form.enabled,
    };
    if (editId) {
      updateSchedule(editId, payload);
    } else {
      addSchedule(payload);
    }
    setShowForm(false);
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day].sort(),
    }));
  }

  function toggleDevice(id: string) {
    setForm((f) => ({
      ...f,
      deviceIds: f.deviceIds.includes(id)
        ? f.deviceIds.filter((d) => d !== id)
        : [...f.deviceIds, id],
    }));
  }

  const formatTime12 = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2>Schedules</h2>
            <p>{schedules.length} schedule{schedules.length !== 1 ? 's' : ''} defined</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> New Schedule
          </button>
        </div>
      </div>

      {/* Scope notice */}
      <div className="alert warning mb-6">
        <AlertTriangle size={16} />
        <div>
          <strong>App Active Only</strong> — Schedules run only while this app is open and foregrounded.
          For reliable off-app scheduling, the ESP32 firmware must implement its own RTC-based timer.
          This is planned but not yet implemented.
        </div>
      </div>

      {/* Schedule list */}
      {schedules.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No schedules yet. Create one to automate your devices.</p>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Create Schedule
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {schedules.map((sched) => {
            const devNames = sched.deviceIds
              .map((id) => devices.find((d) => d.id === id)?.name ?? id)
              .join(', ');
            const repeatLabel = REPEAT_OPTIONS.find((r) => r.value === sched.repeat)?.label ?? sched.repeat;

            return (
              <div key={sched.id} className={`schedule-card ${!sched.enabled ? 'disabled' : ''}`}>
                {/* Time */}
                <div className="schedule-time-block" style={sched.enabled ? {} : { opacity: 0.5 }}>
                  <div className="time">{formatTime12(sched.time).split(' ')[0]}</div>
                  <div className="period">{formatTime12(sched.time).split(' ')[1]}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      {sched.name}
                    </span>
                    {!sched.enabled && (
                      <span className="badge" style={{ background: 'var(--color-state-off-bg)', color: 'var(--color-text-tertiary)' }}>
                        Paused
                      </span>
                    )}
                    <span className={`device-status-badge ${sched.action === 'on' ? 'on' : 'off'}`}>
                      <Power size={9} />
                      {sched.action.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    {devNames || 'No devices'} · {repeatLabel}
                    {sched.days.length < 7 && sched.repeat !== 'once' && (
                      <> · {sched.days.map((d) => DAYS[d]).join(', ')}</>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={11} style={{ color: 'var(--color-text-disabled)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
                      App active only
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => toggleSchedule(sched.id)}
                    aria-label={sched.enabled ? `Pause ${sched.name}` : `Resume ${sched.name}`}
                    title={sched.enabled ? 'Pause' : 'Resume'}
                  >
                    {sched.enabled ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => openEdit(sched)}
                    aria-label={`Edit ${sched.name}`}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--color-on-error)' }}
                    onClick={() => setDeleteConfirm(sched.id)}
                    aria-label={`Delete ${sched.name}`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Schedule?</h3>
            <p style={{ marginTop: 'var(--space-3)' }}>
              "{schedules.find((s) => s.id === deleteConfirm)?.name}" will be permanently removed.
            </p>
            <div className="modal-footer" style={{ marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { deleteSchedule(deleteConfirm!); setDeleteConfirm(null); }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Schedule' : 'New Schedule'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="sched-name">Schedule Name *</label>
                <input
                  id="sched-name"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bedroom Light — Evening ON"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="form-helper" style={{ color: 'var(--color-on-error)' }}>{errors.name}</p>}
              </div>

              {/* Devices */}
              <div className="form-group">
                <label className="form-label">Device(s) *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', maxHeight: 160, overflowY: 'auto' }}>
                  {devices.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`chip ${form.deviceIds.includes(d.id) ? 'active' : ''}`}
                      onClick={() => toggleDevice(d.id)}
                      aria-pressed={form.deviceIds.includes(d.id)}
                    >
                      {form.deviceIds.includes(d.id) && <Check size={10} />}
                      {d.name}
                      {d.support !== 'supported' && <span style={{ opacity: 0.6, fontSize: '0.7em' }}> ({d.support})</span>}
                    </button>
                  ))}
                </div>
                {errors.deviceIds && <p className="form-helper" style={{ color: 'var(--color-on-error)' }}>{errors.deviceIds}</p>}
              </div>

              {/* Action + Time */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="sched-action">Action</label>
                  <select
                    id="sched-action"
                    className="form-select"
                    value={form.action}
                    onChange={(e) => setForm((f) => ({ ...f, action: e.target.value as ScheduleAction }))}
                  >
                    <option value="on">Turn ON</option>
                    <option value="off">Turn OFF</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="sched-time">Time *</label>
                  <input
                    id="sched-time"
                    type="time"
                    className="form-input"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    aria-required="true"
                    aria-invalid={!!errors.time}
                  />
                  {errors.time && <p className="form-helper" style={{ color: 'var(--color-on-error)' }}>{errors.time}</p>}
                </div>
              </div>

              {/* Repeat */}
              <div className="form-group">
                <label className="form-label" htmlFor="sched-repeat">Repeat</label>
                <select
                  id="sched-repeat"
                  className="form-select"
                  value={form.repeat}
                  onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value as RepeatFrequency }))}
                >
                  {REPEAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Days of week */}
              {(form.repeat === 'weekly' || form.repeat === 'daily') && (
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        type="button"
                        className={`chip ${form.days.includes(i) ? 'active' : ''}`}
                        onClick={() => toggleDay(i)}
                        aria-pressed={form.days.includes(i)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enabled toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="form-label">Enable immediately</div>
                  <p className="form-helper">Schedule will be active right after saving</p>
                </div>
                <label className="toggle-switch" aria-label="Enable schedule">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Scope notice */}
              <div className="alert warning" style={{ fontSize: 'var(--text-xs)' }}>
                <AlertTriangle size={13} />
                This schedule is <strong>App Active Only</strong> — it will not run when the app is closed.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Check size={16} />
                {editId ? 'Save Changes' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
