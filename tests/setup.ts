process.env.STORE = "memory";
process.env.MAIL_MODE = "log";
process.env.SESSION_SECRET = "test-session-secret-0123456789abcdef0123456789";
process.env.CRON_SECRET = "test-cron-secret-0123456789";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.PUBLIC_BASE_URL = "https://concierge.test";
process.env.ADMIN_EMAIL = "admin@test.hr";
process.env.SHOW_DEMO_OFFERS = "true";
delete process.env.ANTHROPIC_API_KEY;
