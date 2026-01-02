Grealm Backend - Migrations & Projects

New changes (added Dec 2025):

- Extended `album` table to include the following columns:
  - `description` (TEXT)
  - `status` (VARCHAR) - expected values: `completed`, `in_progress`, `future` (default `completed`)
  - `youtubeUrl` (VARCHAR) - link to YouTube video for completed projects
  - `s3Url` (VARCHAR) - link to video files in S3 for in-progress projects

Migration files:
- `migrations/add_project_columns.sql` — alters existing `album` table to add the new columns
- `migrations/create_all_tables.sql` — updated to include the new columns for fresh installs

How to apply:
- Run the SQL in `migrations/add_project_columns.sql` against your database (e.g., via phpMyAdmin or mysql CLI).
- For new installations, use `migrations/create_all_tables.sql` which contains the updated schema and sample data.

API changes:
- GET `/api/client/albums` now accepts an optional `status` query parameter to filter albums, e.g. `/api/client/albums?status=in_progress`.
- Album detail endpoints and admin create/update already accept the new fields if provided.

Notes & next steps:
- S3 uploads are not implemented (only storage of `s3Url` field). If you want automated upload to S3, provide access keys and target bucket and I can add an upload endpoint.
- Frontend homepage updated to show productions grouped by status and a simplified, minimal hero.
