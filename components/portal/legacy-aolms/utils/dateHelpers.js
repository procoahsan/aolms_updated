/**
 * Parse a date string in various formats to a Date object.
 */
export function parseDate(dateStr) {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'NEED TO FILL' || dateStr === 'under process') {
    return null;
  }

  if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
    return dateStr;
  }

  const raw = String(dateStr).trim();
  const serial = Number(raw);
  if (!Number.isNaN(serial) && serial > 1000) {
    const d = new Date((serial - 25569) * 86400000);
    if (!isNaN(d.getTime())) return d;
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY
  const dmMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmMatch) {
    const [_, p1, p2, yStr] = dmMatch;
    let dStr, mStr;
    if (Number(p1) > 12) {
      dStr = p1; mStr = p2;
    } else if (Number(p2) > 12) {
      mStr = p1; dStr = p2;
    } else {
      dStr = p1; mStr = p2; // Default to DD/MM/YYYY
    }
    const d = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
    if (!isNaN(d.getTime())) return d;
  }

  // Handle "DD-MMM" like "14-Apr" -> append year 2026
  if (/^\d{1,2}-[a-zA-Z]{3}$/.test(raw)) {
    const dWithYear = new Date(`${raw} 2026`);
    if (!isNaN(dWithYear.getTime())) return dWithYear;
  }

  // Try native Date parse first
  let d = new Date(raw);
  if (!isNaN(d.getTime())) {
    // Prevent "14-Apr" parsing as 2001
    if (d.getFullYear() < 2010 && !raw.includes(String(d.getFullYear()))) {
       let altDate = new Date(`${raw} 2026`);
       if (!isNaN(altDate.getTime())) return altDate;
    }
    return d;
  }

  d = new Date(`${raw} 2026`);
  if (!isNaN(d.getTime())) {
    return d;
  }

  return null;
}

export function isWithinDateRange(dateStr, range) {
  if (!range?.startDate || !range?.endDate) return true;
  const date = parseDate(dateStr);
  if (!date) return false;

  const start = new Date(range.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(range.endDate);
  end.setHours(23, 59, 59, 999);
  date.setHours(12, 0, 0, 0);

  return date >= start && date <= end;
}

export function describeDateRange(range) {
  if (!range?.startDate || !range?.endDate) return 'None';
  const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${fmt.format(range.startDate)} - ${fmt.format(range.endDate)}`;
}

/**
 * Calculate days remaining until expiry.
 * Returns positive for future dates, negative for past dates.
 */
export function daysUntilExpiry(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffMs = date.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get expiry status: 'expired', 'critical', 'warning', 'valid', 'unknown'
 */
export function getExpiryStatus(dateStr) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'valid';
}

/**
 * Format date for display.
 */
export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'NEED TO FILL') return dateStr || '—';
  const d = parseDate(dateStr);
  if (!d) return dateStr;

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format days remaining as human readable.
 */
export function formatDaysRemaining(dateStr) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  return `${days}d remaining`;
}
