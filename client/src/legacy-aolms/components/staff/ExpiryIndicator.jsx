import { getExpiryStatus, formatDaysRemaining } from '../../utils/dateHelpers';

export default function ExpiryIndicator({ date, label }) {
  const status = getExpiryStatus(date);
  const daysText = formatDaysRemaining(date);

  const dotColorMap = {
    expired: 'bg-rose',
    critical: 'bg-rose',
    warning: 'bg-amber',
    valid: 'bg-emerald',
    unknown: 'bg-slate-600',
  };

  const textColorMap = {
    expired: 'text-rose-light',
    critical: 'text-rose',
    warning: 'text-amber-light',
    valid: 'text-emerald-light',
    unknown: 'text-slate-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotColorMap[status]} ${status === 'expired' ? 'animate-pulse' : ''}`} />
      <div>
        {label && <span className="text-slate-500 text-[10px] uppercase tracking-wider block">{label}</span>}
        <span className={`text-xs font-medium ${textColorMap[status]}`}>{daysText}</span>
      </div>
    </div>
  );
}
