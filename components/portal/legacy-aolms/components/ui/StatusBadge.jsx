import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_COLORS } from '../../utils/constants';

export function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] || { bg: 'bg-slate-700/30', text: 'text-slate-400', border: 'border-slate-600/30' };
  const label = CATEGORY_LABELS[category] || category || '—';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: 'bg-slate-700/30', text: 'text-slate-400', dot: '' };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
      {colors.dot && <span className={`status-dot ${colors.dot}`} />}
      {status || '—'}
    </span>
  );
}

export function ExpiryBadge({ status, label }) {
  const colorMap = {
    expired: 'bg-rose/15 text-rose-light border-rose/20',
    critical: 'bg-rose/10 text-rose border-rose/15',
    warning: 'bg-amber/10 text-amber-light border-amber/20',
    valid: 'bg-emerald/10 text-emerald-light border-emerald/20',
    unknown: 'bg-slate-700/30 text-slate-500 border-slate-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${colorMap[status] || colorMap.unknown}`}>
      {label}
    </span>
  );
}
