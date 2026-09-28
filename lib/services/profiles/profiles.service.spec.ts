import { ProfilesService } from './profiles.service';
import { validateAccount } from '@/lib/api';


describe('account creation', () => {
  const userId = '6ec20585-61d5-494c-9b6b-acb3721ba277';
  const input = {
    email: ' New@Example.com ', password: 'initial-password', full_name: ' New User ',
    employee_code: '', role: 'technician' as const, is_active: true,
  };
  let repository: any;
  let admin: any;
  let service: ProfilesService;

  beforeEach(() => {
    repository = { upsert: vi.fn().mockResolvedValue({}), findOne: vi.fn().mockResolvedValue({ id: userId }) };
    admin = {
      createUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
      deleteUser: vi.fn().mockResolvedValue({ error: null }),
    };
    service = new ProfilesService(repository, { getClient: () => ({ auth: { admin } }) } as any);
  });

  it('uses the Auth UUID and excludes passwords from the profile', async () => {
    await expect(service.createAccount(input)).resolves.toEqual({ id: userId });
    expect(admin.createUser).toHaveBeenCalledWith({
      email: 'new@example.com', password: input.password, email_confirm: true,
      user_metadata: { full_name: 'New User' },
    });
    expect(repository.upsert).toHaveBeenCalledWith({
      id: userId, email: 'new@example.com', full_name: 'New User', employee_code: null,
      role: 'technician', is_active: true,
    }, ['id']);
  });

  it('does not write a profile when Auth rejects the account', async () => {
    admin.createUser.mockResolvedValue({ data: {}, error: { message: 'Email already registered' } });
    await expect(service.createAccount(input)).rejects.toThrow('Email already registered');
    expect(repository.upsert).not.toHaveBeenCalled();
    expect(admin.deleteUser).not.toHaveBeenCalled();
  });

  it('removes only the newly created account when the employee code conflicts', async () => {
    repository.upsert.mockRejectedValue({ code: '23505' });
    await expect(service.createAccount(input)).rejects.toThrow('Employee code is already in use');
    expect(admin.deleteUser).toHaveBeenCalledWith(userId);
  });

  it('reports cleanup failure without claiming the account was removed', async () => {
    repository.upsert.mockRejectedValue(new Error('database unavailable'));
    admin.deleteUser.mockResolvedValue({ error: new Error('Auth unavailable') });
    await expect(service.createAccount(input)).rejects.toThrow('could not be removed');
  });

  it('rejects client-supplied IDs, missing email, short passwords and invalid roles', async () => {
    const validate=(body:unknown)=>validateAccount(new Request('http://test/api/profiles/accounts',{method:'POST',body:JSON.stringify(body)}));
    const valid = { ...input, email: 'new@example.com' };
    for (const body of [
      { ...valid, id: '' }, { ...valid, email: undefined },
      { ...valid, password: 'short' }, { ...valid, role: 'owner' },
    ]) {
      await expect(validate(body)).rejects.toThrow();
    }
    await expect(validate(valid)).resolves.toEqual(valid);
  });
});
