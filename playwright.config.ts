import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:45000,fullyParallel:true,workers:2,use:{baseURL:'http://127.0.0.1:4173',channel:'msedge',headless:true,screenshot:'only-on-failure'},webServer:{command:'npm run start -- --hostname 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173/api/health',reuseExistingServer:!process.env.CI}});
