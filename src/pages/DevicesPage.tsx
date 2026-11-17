// ============================================================
// ALL DEVICES PAGE
// ============================================================
import { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import DeviceCard from '../components/DeviceCard';
import DeviceModal from '../components/DeviceModal';
import type { DeviceCategory } from '../models/types';

const CATEGORIES: { value: DeviceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'fan', label: 'Fans' },
  { value: 'climate', label: 'Climate' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'water-heating', label: 'Water Heating' },
  { value: 'outlet', label: 'Outlets' },
  { value: 'other', label: 'Other' },
];

const SUPPORT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'supported', label: 'Hardware' },
  { value: 'demo', label: 'Demo' },
  { value: 'unconfigured', label: 'Not Configured' },
];

export default function DevicesPage() {
  const devices = useAppStore((s) => s.devices);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DeviceCategory | 'all'>('all');
  const [support, setSupport] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const q = query.toLowerCase();
      const matchQuery = !q || d.name.toLowerCase().includes(q);
      const matchCat = category === 'all' || d.category === category;
      const matchSupport = support === 'all' || d.support === support;
      return matchQuery && matchCat && matchSupport;
    });
  }, [devices, query, category, support]);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>All Devices</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {devices.length} devices configured
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAddModalOpen(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: 'var(--radius-full)',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <Plus size={16} /> Add a Device
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search devices…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search devices"
            />
          </div>
          <select
            className="form-select"
            style={{ flex: '0 1 160px' }}
            value={support}
            onChange={(e) => setSupport(e.target.value)}
            aria-label="Filter by support type"
          >
            {SUPPORT_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`chip ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value as DeviceCategory | 'all')}
              aria-pressed={category === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid-auto">
          {filtered.map((d) => (
            <DeviceCard key={d.id} device={d} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Filter size={48} />
          <p>No devices match your filters.</p>
          <button className="btn btn-ghost" onClick={() => { setQuery(''); setCategory('all'); setSupport('all'); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Add a Device Modal */}
      <DeviceModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        mode="add"
      />
    </div>
  );
}
