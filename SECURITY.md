# Security & Sharing Guidelines

When sharing this project, avoid including secrets, environment files, or direct database access. Follow these best practices:

- Never commit `.env` files containing `MONGO_URI`, `JWT_SECRET`, or other secrets.
- Do not share direct database credentials or backups unless absolutely necessary.
- The project disables the automatic seeding of an admin account by default. To seed an admin locally intentionally, set `ALLOW_SEED=true` and run the seed script.

Seeding examples:

Unix / macOS:

```
ALLOW_SEED=true npm run seed-admin
```

PowerShell:

```
$env:ALLOW_SEED='true'; npm run seed-admin
```

If you need to share a running demo with others, use one of these approaches:

- Deploy to a temporary environment with rotated secrets and a dedicated demo DB.
- Create a read-only database user for demo access.
- Provide credentials out-of-band (e.g., encrypted message) and rotate them after the demo.

If you want, I can also remove any remaining references to the old default credentials in other docs or add a short automation to rotate secrets before sharing.
