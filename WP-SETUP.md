# Local WordPress with Docker (quick start)

This repository includes a `docker-compose.yml` to run WordPress, MySQL, and phpMyAdmin locally and mounts the local theme at `wp-theme/letsthinkpositive` into the container.

Prerequisites
- Docker Desktop (Windows) or Docker + Docker Compose installed.

Start the stack
1. From a PowerShell in the project root run:

```powershell
docker compose up -d
```

2. Wait a few seconds for MySQL & WordPress to initialize. Visit WordPress at:

  http://localhost:8000

3. Complete the WordPress browser setup. Use these DB values on the setup screen if asked (the installer will usually auto-detect):

- Database name: `wordpress`
- Username: `wp`
- Password: `wp_pass`
- Database host: `db`
- Table prefix: `wp_`

phpMyAdmin (optional)
- Visit http://localhost:8080 and log in with `root` / `example_root_pass` to inspect the database.

Activate the theme
1. In WP Admin go to Appearance → Themes. You should see `letsthinkpositive` (mounted from `wp-theme/letsthinkpositive`). Activate it.

2. Verify the landing page and newsletter form. Submit an email and then check WP Admin → Subscribers (new admin menu) to see the record.

Stopping and cleanup

```powershell
docker compose down
```

To remove DB data (will delete saved subscribers):

```powershell
docker compose down -v
```

If Docker isn't an option I can provide alternative instructions for XAMPP/LocalWP or a manual install.
