import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';

const SEGMENT_CONFIG = [
  {
    key: 'resolved',
    label: 'Resolved',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    key: 'remotelyResolved',
    label: 'Remotely Resolved',
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.35)',
  },
  // {
  //   key: '2ndLatestDate',
  //   label: '2nd Latest Date',
  //   color: '#f59e0b',
  //   glowColor: 'rgba(245, 158, 11, 0.35)',
  // },
  {
    key: 'other',
    label: 'Other',
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.35)',
  },
];

/* ── Animated active-segment shape ── */
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload,
  } = props;

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 10px ${payload.glowColor})`, transition: 'all 0.3s ease' }}
      />
    </g>
  );
};

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-card px-3 py-2" style={{ border: `1px solid ${d.payload.color}30` }}>
      <p className="text-xs font-semibold text-white">{d.payload.label}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {d.value} records · {(d.payload.percent * 100).toFixed(1)}%
      </p>
    </div>
  );
};

export default function LogisticsPieChart({ data, onSegmentClick, activeFilter }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(() => {
    if (!data?.length) return [];

    const total = data.length;

    // Normalize status: RESOLVED_REMOTELY -> resolved remotely
    const normalize = (s) => (s || '').toLowerCase().replace(/[_\s]+/g, ' ').trim();

    const isRemotelyResolved = (status) => {
      const s = normalize(status);
      return s.includes('remotely resolved') || s.includes('resolved remotely');
    };

    // Count resolved (excluding remotely resolved)
    const resolved = data.filter(r => {
      const s = normalize(r.status);
      return s.includes('resolved') && !isRemotelyResolved(r.status);
    }).length;

    const remotelyResolved = data.filter(r => isRemotelyResolved(r.status)).length;

    // Determine the 2nd latest date — all records from that date
    const allDates = [...new Set(data.map(r => r.date).filter(Boolean))].sort((a, b) => {
      const da = new Date(a + ' 2000');
      const db = new Date(b + ' 2000');
      return db - da;
    });
    const secondLatestDate = allDates.length >= 2 ? allDates[1] : null;
    const secondLatest = secondLatestDate
      ? data.filter(r => r.date === secondLatestDate).length
      : 0;

    const other = Math.max(0, total - resolved - remotelyResolved - secondLatest);

    const values = {
      resolved,
      remotelyResolved,
      '2ndLatestDate': secondLatest,
      other,
    };

    return SEGMENT_CONFIG
      .map((seg) => ({
        ...seg,
        value: values[seg.key] || 0,
        percent: (values[seg.key] || 0) / total,
      }))
      .filter((s) => s.value > 0);
  }, [data]);

  const total = data?.length || 0;

  if (!data?.length) {
    return (
      <div className="glass-card p-6 animate-fade-in-up" id="logistics-pie-chart">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Status Distribution
        </h3>
        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
          No logistics data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up" id="logistics-pie-chart">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Status Distribution
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          {total} records
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Recharts Pie */}
        <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={chartData.length > 1 ? 4 : 0}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(data) => {
                  if (data && data.payload && onSegmentClick) {
                    onSegmentClick(data.payload.key);
                  }
                }}
                animationBegin={100}
                animationDuration={1000}
                animationEasing="ease-out"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.color}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeIndex !== null && chartData[activeIndex] ? (
              <>
                <span className="text-2xl font-bold text-white transition-colors duration-300">
                  {chartData[activeIndex].value}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5 transition-colors duration-300 text-center px-2">
                  {chartData[activeIndex].label}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-white transition-colors duration-300">
                  {total}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5 transition-colors duration-300">
                  Total
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {chartData.map((seg, i) => {
            const isHovered = activeIndex === i;
            const isSelected = activeFilter === seg.key;
            return (
              <div
                key={seg.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isHovered || isSelected ? 'bg-white/[0.06] scale-[1.02]' : 'bg-transparent'
                } ${isSelected ? 'ring-1 ring-white/20' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onSegmentClick?.(seg.key)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: seg.color,
                    boxShadow: `0 0 8px ${seg.glowColor}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-300 font-medium truncate">
                      {seg.label}
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {seg.value}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${seg.percent * 100}%`,
                        backgroundColor: seg.color,
                        boxShadow: `0 0 6px ${seg.glowColor}`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {(seg.percent * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
