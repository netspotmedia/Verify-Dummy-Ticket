# Quickstart Installation

1. Create a clean CodeIgniter 4 app:
   ```bash
   composer create-project codeigniter4/appstarter verify-dummy-ticket-ci4
   ```
2. Unzip `verify-dummy-ticket-ci4-part1.zip` at the root of the CI4 app.
3. Copy `.env.example` to `.env` and update database credentials.
4. Create DB and import full SQL:
   ```bash
   mysql -u root -p -e "CREATE DATABASE verify_dummy_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p verify_dummy_ticket < database/full_database_export.sql
   ```
5. Start server:
   ```bash
   php spark serve
   ```
