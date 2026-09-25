import { canEdit, withinWindow } from './assurance-submissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

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

describe('Assurance API authentication guard', () => {
  function fixture(role: string, active = true, tokenValid = true) {
    const request: any = { headers: { authorization: 'Bearer test-token' } };
    const context: any = { switchToHttp: () => ({ getRequest: () => request }), getHandler: () => null, getClass: () => null };
    const client: any = {
      auth: { getUser: async () => ({ data: { user: tokenValid ? { id: 'verified-user', user_metadata: { role: 'admin' } } : null }, error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role, is_active: active }, error: null }) }) }) }),
    };
    const guard = new JwtAuthGuard({} as any, { getAllAndOverride: () => ['controller', 'admin'] } as any, { getClient: () => client } as any);
    return { guard, context, request };
  }
  it('authorizes using database roles, not token metadata', async () => {
    const { guard, context } = fixture('technician');
    expect(await guard.canActivate(context)).toBe(false);
  });
  it('sets verified user identity for controller operations', async () => {
    const { guard, context, request } = fixture('controller');
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user).toMatchObject({ userId: 'verified-user', role: 'controller' });
  });
  it('rejects inactive and invalid sessions', async () => {
    const inactive = fixture('controller', false);
    await expect(inactive.guard.canActivate(inactive.context)).rejects.toBeInstanceOf(ForbiddenException);
    const invalid = fixture('controller', true, false);
    await expect(invalid.guard.canActivate(invalid.context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
