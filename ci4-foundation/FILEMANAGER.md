# File Manager (Part 1 + Part 2 Foundation)

```text
ci4-foundation/
├── .env.example
├── FILEMANAGER.md
├── PART2.md
├── README.md
├── app/
│   ├── Config/
│   │   ├── Filters.php
│   │   ├── Payment.php
│   │   └── Routes.php
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   └── OrdersController.php
│   │   ├── Api/
│   │   │   └── DocumentUploadController.php
│   │   ├── AuthController.php
│   │   ├── DashboardController.php
│   │   ├── HomeController.php
│   │   ├── OrderController.php
│   │   ├── PaymentController.php
│   │   └── WebhookController.php
│   ├── Filters/
│   │   ├── AdminAuthFilter.php
│   │   └── AuthFilter.php
│   ├── Models/
│   │   ├── OrderItemModel.php
│   │   ├── OrderModel.php
│   │   ├── PaymentModel.php
│   │   ├── TicketModel.php
│   │   └── UserModel.php
│   ├── Services/
│   │   └── Payments/
│   │       ├── DummyGateway.php
│   │       ├── PaymentGatewayFactory.php
│   │       └── PaymentGatewayInterface.php
│   └── Views/
│       ├── admin/orders/index.php
│       ├── auth/login.php
│       ├── dashboard/index.php
│       ├── home/contact.php
│       ├── home/index.php
│       ├── home/services.php
│       ├── layouts/main.php
│       ├── order/index.php
│       ├── payment/failed.php
│       └── payment/success.php
├── database/
│   ├── full_database_export.sql
│   ├── part1_schema.sql
│   ├── part1_seed.sql
│   └── part2/
│       └── part2_security_and_ops.sql
└── download/
    ├── .gitignore
    ├── BUILD_DOWNLOAD.sh
    ├── COMPILE_DOWNLOAD.sh
    ├── INSTALL_QUICKSTART.md
    ├── PUSH_NEW_GITHUB_REPO.sh
    ├── PUSH_TO_GITHUB.md
    └── README_DOWNLOAD.md
```
