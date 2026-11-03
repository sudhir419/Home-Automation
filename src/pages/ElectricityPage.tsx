// ============================================================
// ELECTRICITY CONSUMPTION DASHBOARD
// Room-Wise & Device-Wise Analytics, Gantt Timeline & History
// ============================================================
import { useState, useMemo } from 'react';
import {
  Zap, Clock, DollarSign, Activity, ChevronDown, ChevronUp,
  BarChart3, PieChart, AlertTriangle, Layers, Lightbulb,
  Wind, Thermometer, Tv, Flame, Plug, CheckCircle2,
  Calendar, Info, RefreshCw, X, SlidersHorizontal, TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import {
  TimeFilter,
  DeviceConsumptionSummary,
  RoomConsumptionSummary,
  generateHistoricalSessions,
  getDateIntervalForFilter,
  summarizeRooms,
  getHourlyTimelinePoints,
  getDailyTimelinePoints,
  getCategoryBreakdown,
  ELECTRICITY_TARIFF_PER_KWH,
  getDeviceWatts,
} from '../services/electricity/electricityService';
import type { Device, DeviceCategory } from '../models/types';
import { format } from 'date-fns';

export default function ElectricityPage() {
  const devices = useAppStore((s) => s.devices);
  const rooms = useAppStore((s) => s.rooms);
  const preferences = useAppStore((s) => s.preferences);

  // Filter states
  const [filter, setFilter] = useState<TimeFilter>('today');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    living: true,
    bedroom: true,
    kitchen: true,
    bathroom: true,
    study: true,
    outdoor: true,
  });

  // Chart view toggle (Hourly timeline vs Daily trend vs Category breakdown)
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'rooms' | 'categories'>('timeline');

  // Tooltip state for interactive charts
  const [chartTooltip, setChartTooltip] = useState<{ x: number; y: number; title: string; value: string } | null>(null);

  // Generate historical sessions per device (cached deterministically based on devices)
  const deviceSessionsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof generateHistoricalSessions>>();
    for (const d of devices) {
      map.set(d.id, generateHistoricalSessions(d));
    }
    return map;
  }, [devices]);

  // Current filter date interval
  const interval = useMemo(() => getDateIntervalForFilter(filter), [filter]);

  // Summarize room and total house usage
  const { roomSummaries, totalHouseKWh, totalHouseWatts } = useMemo(() => {
    return summarizeRooms(rooms, devices, deviceSessionsMap, interval);
  }, [rooms, devices, deviceSessionsMap, interval]);

  // Top consuming room
  const topConsumingRoom = roomSummaries[0] || null;

  // Active devices right now
  const activeDevicesCount = devices.filter((d) => d.confirmedState === 'on').length;

  // Hourly points for Today/Yesterday
  const hourlyPoints = useMemo(() => {
    return getHourlyTimelinePoints(devices, deviceSessionsMap, interval.start);
  }, [devices, deviceSessionsMap, interval]);

  // Daily points for multi-day views
  const dailyPoints = useMemo(() => {
    return getDailyTimelinePoints(devices, deviceSessionsMap, interval);
  }, [devices, deviceSessionsMap, interval]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return getCategoryBreakdown(devices, deviceSessionsMap, interval);
  }, [devices, deviceSessionsMap, interval]);

  // Peak hourly demand
  const peakHour = useMemo(() => {
    let peak = hourlyPoints[0];
    for (const p of hourlyPoints) {
      if (p.kWh > (peak?.kWh ?? 0)) peak = p;
    }
    return peak;
  }, [hourlyPoints]);

  // Filtered room list based on selectedRoomId
  const displayedRooms = useMemo(() => {
    if (selectedRoomId === 'all') return roomSummaries;
    return roomSummaries.filter((r) => r.roomId === selectedRoomId);
  }, [roomSummaries, selectedRoomId]);

  // Currently inspected device summary (if modal/drawer is open)
  const inspectedDeviceSummary = useMemo(() => {
    if (!selectedDeviceId) return null;
    for (const r of roomSummaries) {
      const found = r.deviceSummaries.find((d) => d.deviceId === selectedDeviceId);
      if (found) return found;
    }
    return null;
  }, [selectedDeviceId, roomSummaries]);

  const toggleRoomExpand = (roomId: string) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  return (
    <div className="electricity-page" style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Demo / Estimation banner */}
      <div className="demo-banner" role="note" style={{ marginBottom: 'var(--space-6)' }}>
        <AlertTriangle size={16} aria-hidden="true" />
        <span style={{ fontSize: 'var(--text-xs)' }}>
          <strong>DEMO & ESTIMATED ANALYTICS</strong> — Energy metrics are derived via calibrated appliance wattage and verified operating session intervals [Energy (kWh) = Power (W) × Hours ÷ 1000].
        </span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
              Energy Management & Smart Metering
            </p>
            <h2 style={{ margin: 0 }}>Electricity Consumption</h2>
            <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
              Real-time load monitoring, room audits, and appliance-level operation timelines
            </p>
          </div>

          {/* Quick Tariff Info Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <DollarSign size={14} style={{ color: 'var(--color-accent)' }} />
            <span>Tariff Rate: <strong>₹{ELECTRICITY_TARIFF_PER_KWH.toFixed(2)}/kWh</strong></span>
          </div>
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div
        className="card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          background: 'var(--color-surface)',
        }}
      >
        {/* Time Interval Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600, marginRight: 4 }}>
            TIME RANGE:
          </span>
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7days', label: 'Last 7 Days' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: filter === tab.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: filter === tab.id ? 'var(--color-accent)' : 'transparent',
                color: filter === tab.id ? '#FFFFFF' : 'var(--color-text-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Room Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
            ROOM:
          </span>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Rooms ({rooms.length})</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Stat Cards (Row of 4) --- */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Total Energy Consumed */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Zap size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">
            {totalHouseKWh} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400 }}>kWh</span>
          </div>
          <div className="stat-card-label">Total Consumption ({filter.toUpperCase()})</div>
        </div>

        {/* Live Active Power Draw */}
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{
              background: totalHouseWatts > 0 ? 'var(--color-state-on-bg)' : 'var(--color-border-subtle)',
              color: totalHouseWatts > 0 ? 'var(--color-state-on)' : 'var(--color-text-tertiary)',
            }}
          >
            <Activity size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">
            {totalHouseWatts} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400 }}>W</span>
          </div>
          <div className="stat-card-label">Live Active Load ({activeDevicesCount} devices ON)</div>
        </div>

        {/* Estimated Tariff Cost */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}>
            <DollarSign size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">
            ₹{(totalHouseKWh * ELECTRICITY_TARIFF_PER_KWH).toFixed(2)}
          </div>
          <div className="stat-card-label">Estimated Bill Impact</div>
        </div>

        {/* Peak Consumer / Room */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose)' }}>
            <TrendingUp size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-lg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {topConsumingRoom ? topConsumingRoom.roomName : 'None'}
          </div>
          <div className="stat-card-label">
            Highest Consumer ({topConsumingRoom?.percentageOfTotal ?? 0}% of load)
          </div>
        </div>
      </div>

      {/* --- Graphical Usage Analytics Section --- */}
      <div className="card" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)' }}>
        {/* Section Header with Sub-Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingBottom: 'var(--space-4)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Interactive Consumption Analytics</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Explore operational trends, chronological hourly profiles, and room comparisons
            </p>
          </div>

          {/* Graph Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-alt)',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveChartTab('timeline')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeChartTab === 'timeline' ? 'var(--color-surface)' : 'transparent',
                color: activeChartTab === 'timeline' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                boxShadow: activeChartTab === 'timeline' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <BarChart3 size={14} />
              <span>{filter === 'today' || filter === 'yesterday' ? 'Hourly Curve' : 'Daily Trend'}</span>
            </button>

            <button
              onClick={() => setActiveChartTab('rooms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeChartTab === 'rooms' ? 'var(--color-surface)' : 'transparent',
                color: activeChartTab === 'rooms' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                boxShadow: activeChartTab === 'rooms' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Layers size={14} />
              <span>Room Comparison</span>
            </button>

            <button
              onClick={() => setActiveChartTab('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeChartTab === 'categories' ? 'var(--color-surface)' : 'transparent',
                color: activeChartTab === 'categories' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                boxShadow: activeChartTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <PieChart size={14} />
              <span>Load by Category</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Hourly Timeline / Daily Trend */}
        {activeChartTab === 'timeline' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {filter === 'today' || filter === 'yesterday'
                  ? `24-Hour Energy Profile (${filter === 'today' ? 'Today' : 'Yesterday'}) — Peak at ${peakHour?.label ?? 'N/A'}`
                  : `Daily Aggregated kWh Trend (${filter.toUpperCase()})`}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                Hover bars for exact metrics
              </span>
            </div>

            {/* SVG Responsive Bar Chart */}
            <div style={{ width: '100%', height: 220, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 50, 100, 150].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="780"
                    y2={y}
                    stroke="var(--color-border-subtle)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Bars */}
                {filter === 'today' || filter === 'yesterday' ? (
                  // 24 Hourly bars
                  (() => {
                    const maxKWh = Math.max(0.1, ...hourlyPoints.map((p) => p.kWh));
                    const barWidth = 24;
                    const spacing = (740 - 24 * barWidth) / 23;
                    return hourlyPoints.map((pt, i) => {
                      const h = (pt.kWh / maxKWh) * 150;
                      const x = 40 + i * (barWidth + spacing);
                      const y = 170 - h;
                      const isPeak = pt.hour === peakHour?.hour;
                      return (
                        <g key={pt.hour}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(2, h)}
                            rx={4}
                            fill={isPeak ? 'var(--color-accent)' : 'var(--color-accent-light)'}
                            stroke={isPeak ? 'var(--color-accent-hover)' : 'var(--color-accent)'}
                            strokeWidth={1}
                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setChartTooltip({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10,
                                title: `${pt.label}`,
                                value: `${pt.kWh} kWh (~${pt.watts} W average)`,
                              });
                            }}
                            onMouseLeave={() => setChartTooltip(null)}
                          />
                          {/* Every 3 hours label */}
                          {pt.hour % 3 === 0 && (
                            <text
                              x={x + barWidth / 2}
                              y={192}
                              textAnchor="middle"
                              fontSize="10"
                              fill="var(--color-text-tertiary)"
                              fontWeight="600"
                            >
                              {pt.label}
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()
                ) : (
                  // Multi-day bars
                  (() => {
                    const maxKWh = Math.max(0.1, ...dailyPoints.map((p) => p.kWh));
                    const count = dailyPoints.length;
                    const barWidth = Math.min(50, 700 / count - 12);
                    const spacing = (740 - count * barWidth) / (count - 1 || 1);
                    return dailyPoints.map((pt, i) => {
                      const h = (pt.kWh / maxKWh) * 150;
                      const x = 40 + i * (barWidth + spacing);
                      const y = 170 - h;
                      return (
                        <g key={pt.date}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(2, h)}
                            rx={4}
                            fill="var(--color-highlight-light)"
                            stroke="var(--color-highlight)"
                            strokeWidth={1.5}
                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setChartTooltip({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10,
                                title: pt.label,
                                value: `${pt.kWh} kWh · ₹${pt.cost}`,
                              });
                            }}
                            onMouseLeave={() => setChartTooltip(null)}
                          />
                          <text
                            x={x + barWidth / 2}
                            y={192}
                            textAnchor="middle"
                            fontSize="10"
                            fill="var(--color-text-tertiary)"
                            fontWeight="600"
                          >
                            {pt.label.split(',')[0]}
                          </text>
                        </g>
                      );
                    });
                  })()
                )}
              </svg>
            </div>
          </div>
        )}

        {/* TAB 2: Room-Wise Comparison Chart */}
        {activeChartTab === 'rooms' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Comparative Room Consumption & Proportion of Total Load
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 600 }}>
                Leader: {topConsumingRoom?.roomName} ({topConsumingRoom?.totalKWh} kWh)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {roomSummaries.map((room) => {
                const isTop = room.roomId === topConsumingRoom?.roomId;
                return (
                  <div
                    key={room.roomId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '150px 1fr 140px',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                        {room.roomName}
                      </span>
                      {isTop && (
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-accent-light)',
                            color: 'var(--color-accent)',
                            fontWeight: 700,
                          }}
                        >
                          PEAK
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: 22,
                        background: 'var(--color-bg-alt)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(2, room.percentageOfTotal)}%`,
                          background: isTop ? 'var(--color-accent)' : 'var(--color-highlight)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: 10,
                          fontSize: '11px',
                          fontWeight: 700,
                          color: room.percentageOfTotal > 15 ? '#FFFFFF' : 'var(--color-text-primary)',
                        }}
                      >
                        {room.percentageOfTotal}%
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)' }}>
                      <strong>{room.totalKWh} kWh</strong>
                      <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 6 }}>
                        (₹{(room.totalKWh * ELECTRICITY_TARIFF_PER_KWH).toFixed(1)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Category Breakdown */}
        {activeChartTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
            {/* SVG Donut Chart */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {(() => {
                  let accumulatedPct = 0;
                  return categoryBreakdown.map((cat) => {
                    const startAngle = (accumulatedPct / 100) * 360;
                    accumulatedPct += cat.percentage;
                    const endAngle = (accumulatedPct / 100) * 360;

                    // Convert to radians and SVG path arc
                    const r = 70;
                    const cx = 100;
                    const cy = 100;

                    const x1 = cx + r * Math.cos((startAngle - 90) * (Math.PI / 180));
                    const y1 = cy + r * Math.sin((startAngle - 90) * (Math.PI / 180));
                    const x2 = cx + r * Math.cos((endAngle - 90) * (Math.PI / 180));
                    const y2 = cy + r * Math.sin((endAngle - 90) * (Math.PI / 180));

                    const largeArc = cat.percentage > 50 ? 1 : 0;
                    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    return (
                      <path
                        key={cat.category}
                        d={path}
                        fill={cat.color}
                        stroke="var(--color-surface)"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setChartTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                            title: cat.label,
                            value: `${cat.kWh} kWh (${cat.percentage}%)`,
                          });
                        }}
                        onMouseLeave={() => setChartTooltip(null)}
                      />
                    );
                  });
                })()}
                {/* Donut Hole */}
                <circle cx="100" cy="100" r="42" fill="var(--color-surface)" />
                <text x="100" y="96" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-text-primary)">
                  {totalHouseKWh}
                </text>
                <text x="100" y="112" textAnchor="middle" fontSize="10" fill="var(--color-text-tertiary)">
                  kWh Total
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-alt)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {cat.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)' }}>
                    <strong>{cat.kWh} kWh</strong>{' '}
                    <span style={{ color: 'var(--color-text-tertiary)' }}>({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ROOM-WISE SECTIONS WITH INDIVIDUAL APPLIANCE CARDS --- */}
      <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ width: '100%' }}>
          <div>
            <h3 style={{ margin: 0 }}>Room-Wise Electricity Audit</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Individual appliance wattage, live operation state, cumulative kWh, and session logs
            </p>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Showing {displayedRooms.length} of {rooms.length} rooms
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {displayedRooms.map((room) => {
          const isExpanded = expandedRooms[room.roomId] ?? true;
          return (
            <div
              key={room.roomId}
              className="card"
              style={{
                padding: 'var(--space-5)',
                borderLeft: room.activeDeviceCount > 0 ? '4px solid var(--color-accent)' : '1px solid var(--color-border)',
              }}
            >
              {/* Room Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleRoomExpand(room.roomId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-lg)',
                      background: room.activeDeviceCount > 0 ? 'var(--color-state-on-bg)' : 'var(--color-bg-alt)',
                      color: room.activeDeviceCount > 0 ? 'var(--color-state-on)' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Layers size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{room.roomName}</h4>
                      {room.activeDeviceCount > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-state-on-bg)',
                            color: 'var(--color-state-on)',
                            fontWeight: 700,
                          }}
                        >
                          {room.activeDeviceCount} ACTIVE ({room.totalWattsRunning}W)
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {room.deviceCount} configured devices &middot; Top consumer: <strong>{room.topConsumingDeviceName}</strong>
                    </p>
                  </div>
                </div>

                {/* Right side stats & toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {room.totalKWh} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400 }}>kWh</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {room.totalOperatingHours} hrs &middot; ₹{(room.totalKWh * ELECTRICITY_TARIFF_PER_KWH).toFixed(1)}
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-icon"
                    aria-label={isExpanded ? 'Collapse room' : 'Expand room'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Appliance List & Detailed Monitoring */}
              {isExpanded && (
                <div style={{ marginTop: 'var(--space-5)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  {room.deviceSummaries.length === 0 ? (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                      No appliances connected to this room.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {room.deviceSummaries.map((dev) => (
                        <div
                          key={dev.deviceId}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(220px, 2fr) 1fr 1fr 1fr 130px',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-lg)',
                            background: dev.isCurrentlyOn ? 'var(--color-state-on-bg)' : 'var(--color-bg-alt)',
                            border: dev.isCurrentlyOn ? '1px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                            gap: 'var(--space-3)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => setSelectedDeviceId(dev.deviceId)}
                          title="Click to view detailed session log and operation timeline"
                        >
                          {/* Device Name & Category */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: dev.isCurrentlyOn ? 'var(--color-state-on)' : 'var(--color-text-tertiary)',
                              }}
                            >
                              <DeviceCategoryIcon category={dev.category} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                                {dev.deviceName}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                                {dev.category.toUpperCase()} &middot; Rated at <strong>{dev.powerWatts}W</strong>
                              </div>
                            </div>
                          </div>

                          {/* Live ON/OFF Status */}
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: dev.isCurrentlyOn ? 'var(--color-accent)' : 'var(--color-surface)',
                                color: dev.isCurrentlyOn ? '#FFFFFF' : 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: dev.isCurrentlyOn ? '#FFFFFF' : '#88807B',
                                }}
                              />
                              {dev.isCurrentlyOn ? 'ON (ACTIVE)' : 'STANDBY (OFF)'}
                            </span>
                          </div>

                          {/* Total Operating Time */}
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Total Run Time</div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {Math.floor(dev.totalOperatingMinutes / 60)}h {dev.totalOperatingMinutes % 60}m
                            </div>
                          </div>

                          {/* Energy Consumed */}
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Energy (kWh)</div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent)' }}>
                              {dev.totalKWh} kWh
                            </div>
                          </div>

                          {/* Action Button to inspect Timeline */}
                          <div style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDeviceId(dev.deviceId);
                              }}
                            >
                              <Clock size={12} />
                              Sessions ({dev.sessionCount})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- DETAILED DEVICE INSPECTION MODAL / DRAWER --- */}
      {inspectedDeviceSummary && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--space-4)',
          }}
          onClick={() => setSelectedDeviceId(null)}
        >
          <div
            className="modal-card"
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Appliance Usage Audit & Timeline
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: 'var(--text-2xl)' }}>
                  {inspectedDeviceSummary.deviceName}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  Rated at <strong>{inspectedDeviceSummary.powerWatts} Watts</strong> &middot; Category: {inspectedDeviceSummary.category}
                </p>
              </div>

              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setSelectedDeviceId(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Current State</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: inspectedDeviceSummary.isCurrentlyOn ? 'var(--color-state-on)' : 'var(--color-text-secondary)', marginTop: 2 }}>
                  {inspectedDeviceSummary.isCurrentlyOn ? 'ON (Live)' : 'OFF (Idle)'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Total Operating Time</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                  {inspectedDeviceSummary.totalOperatingHours} hrs
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Electricity Consumed</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent)', marginTop: 2 }}>
                  {inspectedDeviceSummary.totalKWh} kWh
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Session Count</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                  {inspectedDeviceSummary.sessionCount} times
                </div>
              </div>
            </div>

            {/* Visual Session Timeline (Gantt Representation for Today) */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  DAILY OPERATING INTERVAL TIMELINE (00:00 - 24:00)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  Green blocks = Device was switched ON
                </span>
              </div>

              <div
                style={{
                  height: 36,
                  background: 'var(--color-bg-alt)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* 24-hour hour divider marks */}
                {Array.from({ length: 24 }).map((_, h) => (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      left: `${(h / 24) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: 'rgba(0,0,0,0.06)',
                    }}
                  />
                ))}

                {/* Render sessions as green horizontal blocks */}
                {inspectedDeviceSummary.sessions.map((sess) => {
                  const sD = new Date(sess.startTime);
                  const eD = sess.endTime ? new Date(sess.endTime) : new Date();

                  const startPct = ((sD.getHours() * 60 + sD.getMinutes()) / 1440) * 100;
                  const durPct = Math.max(1, (sess.durationMinutes / 1440) * 100);

                  return (
                    <div
                      key={sess.id}
                      title={`ON: ${format(sD, 'hh:mm a')} - ${sess.endTime ? format(eD, 'hh:mm a') : 'Now'} (${sess.durationMinutes}m, ${sess.energyKWh} kWh)`}
                      style={{
                        position: 'absolute',
                        left: `${Math.min(99, startPct)}%`,
                        width: `${Math.min(100 - startPct, durPct)}%`,
                        top: 4,
                        bottom: 4,
                        background: 'var(--color-accent)',
                        borderRadius: 3,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </div>

              {/* Hour Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '9px', color: 'var(--color-text-tertiary)' }}>
                <span>12 AM</span>
                <span>4 AM</span>
                <span>8 AM</span>
                <span>12 PM</span>
                <span>4 PM</span>
                <span>8 PM</span>
                <span>11 PM</span>
              </div>
            </div>

            {/* Chronological Table of Sessions */}
            <div>
              <h4 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Chronological ON/OFF Session Records
              </h4>

              <div
                style={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-alt)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '8px 12px' }}>Switched ON Time</th>
                      <th style={{ padding: '8px 12px' }}>Switched OFF Time</th>
                      <th style={{ padding: '8px 12px' }}>Operating Duration</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Energy Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectedDeviceSummary.sessions.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                          No recorded sessions in this interval.
                        </td>
                      </tr>
                    ) : (
                      inspectedDeviceSummary.sessions.map((sess) => (
                        <tr
                          key={sess.id}
                          style={{
                            borderBottom: '1px solid var(--color-border-subtle)',
                            background: sess.endTime === null ? 'var(--color-state-on-bg)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {format(new Date(sess.startTime), 'dd MMM yyyy, hh:mm a')}
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {sess.endTime ? (
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {format(new Date(sess.endTime), 'dd MMM yyyy, hh:mm a')}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                                Active Right Now
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                            {Math.floor(sess.durationMinutes / 60)}h {sess.durationMinutes % 60}m
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-accent)' }}>
                            {sess.energyKWh} kWh
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedDeviceId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chart Tooltip */}
      {chartTooltip && (
        <div
          style={{
            position: 'fixed',
            left: chartTooltip.x,
            top: chartTooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--color-text-primary)',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 700 }}>{chartTooltip.title}</div>
          <div style={{ opacity: 0.85 }}>{chartTooltip.value}</div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Category Icon Helper
// ------------------------------------------------------------
function DeviceCategoryIcon({ category }: { category: DeviceCategory }) {
  switch (category) {
    case 'lighting':
      return <Lightbulb size={16} />;
    case 'fan':
      return <Wind size={16} />;
    case 'climate':
      return <Thermometer size={16} />;
    case 'entertainment':
      return <Tv size={16} />;
    case 'water-heating':
      return <Flame size={16} />;
    case 'outlet':
      return <Plug size={16} />;
    default:
      return <Zap size={16} />;
  }
}
