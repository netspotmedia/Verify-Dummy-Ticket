#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

php -l "$ROOT_DIR/app/Controllers/AuthController.php" >/dev/null
php -l "$ROOT_DIR/app/Controllers/OrderController.php" >/dev/null
php -l "$ROOT_DIR/app/Controllers/PaymentController.php" >/dev/null
php -l "$ROOT_DIR/app/Controllers/DashboardController.php" >/dev/null
php -l "$ROOT_DIR/app/Controllers/Admin/OrdersController.php" >/dev/null
php -l "$ROOT_DIR/app/Controllers/Admin/PaymentSettingsController.php" >/dev/null

php "$ROOT_DIR/scripts/validate_routes_and_forms.php"

echo "Deterministic workflow checks passed (user + admin route/form wiring)."
