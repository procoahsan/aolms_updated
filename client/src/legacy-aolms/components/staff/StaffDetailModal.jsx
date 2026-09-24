import { formatDate, getExpiryStatus, formatDaysRemaining } from '../../utils/dateHelpers';

export default function StaffDetailModal({ staff, onClose }) {
  if (!staff) return null;

  const sections = [
    {
      title: 'Personal Information',
      icon: '👤',
      fields: [
        { label: 'Full Name', value: staff.name },
        { label: 'Contact (Personal)', value: staff.contactPersonal },
        { label: 'Contact (Office)', value: staff.contactOffice },
        { label: 'Nationality', value: staff.nationality },
        { label: 'Staff Category', value: staff.staffCategory },
        { label: 'Status', value: staff.status },
      ],
    },
    {
      title: 'CPR Details',
      icon: '🪪',
      fields: [
        { label: 'CPR Number', value: staff.cpr },
        { label: 'CPR Expiry', value: staff.cprExpiry, isDate: true },
        { label: 'Missing Data', value: staff.missingData },
      ],
    },
    {
      title: 'Bnet Details',
      icon: '📡',
      fields: [
        { label: 'CON ID (Bnet)', value: staff.conIdBnet },
        { label: 'Bnet ID Expiry', value: staff.bnetIdExpiry, isDate: true },
        { label: 'Bnet Card Status', value: staff.bnetCardStatus },
      ],
    },
    {
      title: 'Batelco Details',
      icon: '📶',
      fields: [
        { label: 'CON ID (Batelco)', value: staff.conIdBatelco },
        { label: 'Batelco Expiry', value: staff.batelcoExpiry, isDate: true },
      ],
    },
    {
      title: 'Visa & Passport',
      icon: '🛂',
      fields: [
        { label: 'Visa Type', value: staff.visa },
        { label: 'Passport Expiry', value: staff.passportExpiry, isDate: true },
        { label: 'RP / Contract Expiry', value: staff.rpExpiry, isDate: true },
        { label: 'NOC', value: staff.noc },
        { label: 'Picture', value: staff.picture },
      ],
    },
    {
      title: 'Expiry Checks',
      icon: '⏰',
      fields: [
        { label: 'Check Bnet Card', value: staff.checkBnetCard },
        { label: 'Check CPR Expiry', value: staff.checkCprExpiry },
        { label: 'Check RP Expiry', value: staff.checkRpExpiry },
        { label: 'Check Passport Expiry', value: staff.checkPassportExpiry },
        { label: 'Check Batelco Expiry', value: staff.checkBatelcoExpiry },
        { label: 'Comments', value: staff.commentsOnExpiry },
      ],
    },
  ];

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-fade-in-up p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric to-purple flex items-center justify-center text-white text-lg font-bold">
              {staff.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{staff.name}</h2>
              <p className="text-slate-400 text-sm">{staff.staffCategory}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="animate-fade-in-up" style={{ animationDelay: `${sIdx * 50}ms` }}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span>{section.icon}</span>
                {section.title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {section.fields.map((field, fIdx) => {
                  const expiryStatus = field.isDate ? getExpiryStatus(field.value) : null;
                  const statusColorMap = {
                    expired: 'border-rose/30 bg-rose/5',
                    critical: 'border-rose/20 bg-rose/5',
                    warning: 'border-amber/20 bg-amber/5',
                    valid: 'border-emerald/20 bg-emerald/5',
                    unknown: 'border-white/5 bg-white/[0.02]',
                  };

                  return (
                    <div
                      key={fIdx}
                      className={`rounded-xl border p-3 ${
                        field.isDate
                          ? statusColorMap[expiryStatus] || statusColorMap.unknown
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                      <p className="text-sm text-slate-200 font-medium">{field.value || '—'}</p>
                      {field.isDate && expiryStatus !== 'unknown' && (
                        <p className={`text-[11px] mt-1 font-medium ${
                          expiryStatus === 'expired' || expiryStatus === 'critical'
                            ? 'text-rose-light'
                            : expiryStatus === 'warning'
                            ? 'text-amber-light'
                            : 'text-emerald-light'
                        }`}>
                          {formatDaysRemaining(field.value)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
