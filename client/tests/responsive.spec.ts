import { test, expect, type Page } from '@playwright/test';

const uid = '11111111-1111-4111-8111-111111111111';
const ticketId = '22222222-2222-4222-8222-222222222222';
const orderId = '33333333-3333-4333-8333-333333333333';
const projectId = '44444444-4444-4444-8444-444444444444';
const project = { id: projectId, name: 'Service Assurance', code: 'SERVICE_ASSURANCE', display_order: 1, is_active: true };
const profile = { id: uid, full_name: 'Test Technician', email: 'test@example.invalid', employee_code: 'TEST-01', is_active: true, created_at: new Date().toISOString() };

async function fixtures(page: Page, role: string, theme: string) {
  const user = { id: uid, email: profile.email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: profile.created_at };
  await page.addInitScript(({ user, theme }) => {
    localStorage.setItem('theme', theme);
    const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })) + '.test';
    localStorage.setItem('sb-dmgchmokpdcahbdfrulu-auth-token', JSON.stringify({ access_token: token, refresh_token: 'test', expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, token_type: 'bearer', user }));
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
  }, { user, theme });
  const order = { id: orderId, order_number: 'DEL-1001', technician_id: uid, action: 'Delivered', exchange: 'North Exchange', project_id: projectId, work_date: '2026-09-26' };
  const ticket = { id: ticketId, ticket_number: 'SA-1001', circuit: 'CIRCUIT-1001', work_date: '2026-09-26', exchange: 'North Exchange', service_type: 'Broadband', technician_id: uid, status: 'Resolved', technician_name: profile.full_name, active_assignment: true, completed: false, can_edit: true, submitted_at: null, edit_deadline: null };
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data: unknown = [];
    if (url.pathname.includes('/auth/')) data = user;
    else if (table === 'profiles') data = url.searchParams.has('id') ? { ...profile, role } : [{ ...profile, role: 'technician' }];
    else if (table === 'projects') data = [project];
    else if (table === 'orders') data = url.searchParams.has('id') ? order : [order];
    else if (table === 'delivery_submissions') data = [];
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'content-range': '0-0/1' }, body: JSON.stringify(data) });
  });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === '/api/projects') data = [project];
    else if (/assurance-submissions\/(tasks|audit)$/.test(path)) data = { rows: [ticket, { ...ticket, id: orderId, ticket_number: 'SA-1002', completed: true, submitted_at: new Date().toISOString(), edit_deadline: new Date(Date.now()+86400000).toISOString(), submission_technician_id: uid }], counts: { completed: 1, pending: 1 }, server_time: new Date().toISOString() };
    else if (path.endsWith('/save')) data = { id: ticketId, technician_id: uid, version: 1, submitted_at: new Date().toISOString(), status: 'submitted' };
    else if (path.includes('/assurance-submissions/')) data = { ticket, submission: null, can_edit: true, server_time: new Date().toISOString(), options: { root_cause: ['Cable'], resolution: ['Repaired'] } };
    else if (path.endsWith('/metadata')) data = { fields: [{ key: 'ticket_number', label: 'Ticket number', excelColumn: 'A', storage: 'ticket_number', type: 'text' }], technicians: [{ id: uid, full_name: profile.full_name }] };
    else if (path === '/api/staff') data = { data: [], total: 0, page: 1, limit: 100 };
    else if (path === '/api/staff/stats') data = { total: 0, totalStaff: 0, statuses: [], nationalities: [], categories: [], byStatus: [], byNationality: [] };
    else if (path.endsWith('/status')) data = { ready: true };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

for (const theme of ['light', 'dark']) {
  for (const width of [320, 375, 768, 1366]) {
    test(`technician pages ${theme} ${width}px`, async ({ page }) => {
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 850 }); await fixtures(page, 'technician', theme);
      for (const path of ['/technician/todo', '/technician/submitted', `/technician/assurance-form/${ticketId}`, `/technician/delivery-form/${orderId}`]) {
        await page.goto(path); await expect(page.locator('main')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Account: Test Technician' })).toBeVisible();
        await expect(page.locator('main').getByText(/Loading/)).toHaveCount(0);
        await noOverflow(page);
        if (path.endsWith('/todo') && width < 768) {
          const card = page.locator('.task-card').first();
          const action = card.getByRole('link', { name: 'Edit SA-1001' });
          await expect(action).toBeVisible();
          const box = await action.boundingBox(); const cardBox = await card.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.x - cardBox!.x).toBeLessThan(25);
          expect(box!.y - cardBox!.y).toBeLessThan(25);
          await expect(page.getByRole('navigation', { name: 'Technician pages' })).toBeVisible();
        }
        if (path.includes('assurance-form')) {
          const font = await page.getByLabel('Resolution Description', { exact: true }).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
          expect(font).toBeGreaterThanOrEqual(16);
        }
      }
      expect(errors).toEqual([]);
      if (width === 375) { await page.goto('/technician/todo'); await expect(page.locator('.task-card')).toHaveCount(1); await page.screenshot({ path: `test-results/technician-${theme}.png`, fullPage: true }); }
    });
  }
  for (const role of ['admin', 'controller']) {
    test(`${role} screens ${theme}`, async ({ page }) => {
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await fixtures(page, role, theme);
      const routes = role === 'admin' ? ['dashboard', 'profiles', 'projects', 'profile/me', 'operations-data', 'legacy-operations'] : ['projects', 'audit', 'legacy-operations'];
      for (const width of [375, 1024]) {
        await page.setViewportSize({ width, height: 850 });
        for (const route of routes) {
          await page.goto(`/${role}/${route}`); await expect(page.locator('main')).toBeVisible();
          await expect(page.getByRole('button', { name: 'Account: Test Technician' })).toBeVisible();
          await expect(page.locator('main').getByText(/^Loading/)).toHaveCount(0);
          await noOverflow(page);
        }
      }
      expect(errors).toEqual([]);
    });
  }
}

test('mobile submission returns to To-Do and works without randomUUID', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 }); await fixtures(page, 'technician', 'dark');
  await page.goto(`/technician/assurance-form/${ticketId}`);
  await page.getByLabel('Root Cause', { exact: true }).selectOption('Cable');
  await page.getByLabel('Resolution', { exact: true }).selectOption('Repaired');
  await page.getByLabel('Resolution Description', { exact: true }).fill('Connection restored.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page).toHaveURL(/\/technician\/todo$/);
});

test('manual theme overrides system preference and mobile modal fits', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' }); await page.setViewportSize({ width: 320, height: 640 });
  await fixtures(page, 'admin', 'light'); await page.goto('/admin/profiles');
  await page.getByRole('button', { name: 'Add User' }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  expect(await dialog.locator('input').first().evaluate(el => getComputedStyle(el).color)).toBe('rgb(17, 36, 58)');
  await page.getByRole('button', { name: 'Close modal' }).click();
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Add User' }).click();
  const input = dialog.locator('input').first();
  expect(await input.evaluate(el => getComputedStyle(el).color)).toBe('rgb(243, 248, 252)');
  await noOverflow(page);
});
