import { AssuranceSubmissionsService } from './assurance-submissions.service';

describe('Audit and technician tasks access', () => {
  const db = { query: vi.fn() };
  const service = new AssuranceSubmissionsService(db as any);
  beforeEach(() => db.query.mockReset());

  it('restricts Audit to managers at the route and service boundaries', async () => {
    await expect(service.audit({ userId: 'tech', role: 'technician' })).rejects.toThrow();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('allows Controllers to see completed and pending counts across technicians', async () => {
    db.query.mockResolvedValue([{ completed: true }, { completed: false }, { completed: true }]);
    const result = await service.audit({ userId: 'controller', role: 'controller' });
    expect(result.counts).toEqual({ completed: 2, pending: 1 });
  });

  it('keeps technician tasks scoped to their verified identity', async () => {
    db.query.mockResolvedValue([]);
    await service.tasks({ userId: 'tech', role: 'technician' });
    expect(db.query.mock.calls[0][1]).toEqual(['tech']);
    await expect(service.tasks({ userId: 'controller', role: 'controller' })).rejects.toThrow();
  });
});
