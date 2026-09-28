import { canEdit, withinWindow } from './assurance-submissions.service';

describe('Assurance submission permissions', () => {
  const actor = { userId: 'technician-a', role: 'technician' };
  const ticket = { technician_id: actor.userId, status: 'Resolved' };
  const submittedAt = '2026-03-01T00:00:00.000Z';
  const start = Date.parse(submittedAt);
  it('expires exactly 24 hours after the original submission', () => {
    expect(withinWindow(submittedAt, start + 10 * 3600000)).toBe(true);
    expect(withinWindow(submittedAt, start + 86400000 - 1)).toBe(true);
    expect(withinWindow(submittedAt, start + 86400000)).toBe(false);
    expect(withinWindow(submittedAt, start + 25 * 3600000)).toBe(false);
  });
  it('requires matching assignee and exactly Resolved status', () => {
    expect(canEdit(ticket, null, actor)).toBe(true);
    expect(canEdit({ ...ticket, status: 'Resolved_Remotely' }, null, actor)).toBe(false);
    expect(canEdit({ ...ticket, technician_id: 'other' }, null, actor)).toBe(false);
    expect(canEdit(ticket, { technician_id: 'other' }, actor)).toBe(false);
    expect(canEdit(ticket, { technician_id: actor.userId, status: 'locked' }, actor)).toBe(false);
  });
  it('does not impose technician time limits on managers', () => {
    expect(canEdit(ticket, { submitted_at: submittedAt }, { userId: 'c', role: 'controller' }, start + 90000000)).toBe(true);
    expect(canEdit(ticket, null, { userId: 'c', role: 'unknown' })).toBe(false);
  });
});

