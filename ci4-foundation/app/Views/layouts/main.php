<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= esc($title ?? 'Verify Dummy Ticket') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f5f7fb;
            color: #14213d;
        }

        .navbar-brand { font-weight: 800; letter-spacing: .2px; }

        .top-nav {
            background: #ffffff;
            border-bottom: 1px solid #e6ebf3;
        }

        .footer {
            border-top: 1px solid #e6ebf3;
            color: #6b7280;
            background: #ffffff;
        }

        <?php if (! empty($landing)): ?>
        .landing-main {
            max-width: 1120px;
        }

        .landing-hero {
            background: radial-gradient(circle at top left, #ffffff 20%, #edf3ff 85%);
            border-radius: 1.5rem;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
        }

        .landing-pill {
            display: inline-block;
            padding: .4rem .7rem;
            border-radius: 999px;
            background: #e8efff;
            color: #2551d1;
            font-weight: 600;
            font-size: .85rem;
        }

        .landing-title {
            font-size: clamp(2rem, 3.6vw, 3rem);
            line-height: 1.1;
            font-weight: 800;
            color: #0d1b3f;
        }

        .landing-subtitle {
            color: #4a5878;
            font-size: 1.05rem;
            max-width: 44ch;
        }

        .landing-checks li {
            margin-bottom: .45rem;
            color: #233153;
            font-weight: 500;
        }

        .landing-checks li::before {
            content: "✔";
            color: #2551d1;
            margin-right: .5rem;
        }

        .quote-card {
            border-radius: 1rem;
            background: #ffffff;
        }

        .quote-card .form-control {
            border-color: #dbe3f0;
            padding: .65rem .75rem;
        }

        .airline-chip {
            padding: .55rem .95rem;
            border-radius: 999px;
            background: #ffffff;
            border: 1px solid #dbe3f0;
            color: #334160;
            font-weight: 600;
            font-size: .9rem;
        }

        .offer-card,
        .testimonial-card {
            background: #ffffff;
            border: 1px solid #e5eaf3;
            border-radius: 1rem;
        }

        .offer-card h3 {
            color: #0f214a;
            font-weight: 700;
        }

        .guarantee-band {
            background: #1e3a8a;
            color: #ffffff;
        }

        .faq-section .accordion-item {
            border: 1px solid #e5eaf3;
            border-radius: .8rem;
            overflow: hidden;
            margin-bottom: .8rem;
        }

        .final-cta {
            background: linear-gradient(135deg, #e9f0ff 0%, #f9fbff 100%);
            border: 1px solid #d9e5ff;
        }

        .btn-primary {
            background-color: #2551d1;
            border-color: #2551d1;
            font-weight: 600;
        }

        .btn-primary:hover,
        .btn-primary:focus {
            background-color: #1f44af;
            border-color: #1f44af;
        }
        <?php endif; ?>


        <?php if (! empty($dashboard)): ?>
        .dashboard-shell { color: #14213d; }

        .dashboard-sidebar,
        .dashboard-header,
        .dashboard-panel,
        .dashboard-metric {
            background: #ffffff;
            border: 1px solid #e5eaf3;
            border-radius: 1rem;
        }

        .dashboard-nav .nav-link {
            border-radius: .6rem;
            color: #334160;
            padding: .55rem .65rem;
            font-weight: 500;
        }

        .dashboard-nav .nav-link:hover,
        .dashboard-nav .nav-link.active {
            background: #edf3ff;
            color: #1f44af;
        }

        .metric-label {
            color: #6b7280;
            font-size: .85rem;
            text-transform: uppercase;
            letter-spacing: .04em;
        }

        .metric-value {
            font-size: 1.8rem;
            font-weight: 800;
            color: #0d1b3f;
            line-height: 1;
        }

        .dashboard-table thead th {
            color: #6b7280;
            font-size: .82rem;
            text-transform: uppercase;
            letter-spacing: .04em;
            border-bottom-color: #e5eaf3;
        }

        .dashboard-table tbody td {
            border-bottom-color: #eef2f8;
        }

        .progress-list {
            display: grid;
            gap: 1rem;
        }

        .progress-item {
            display: grid;
            grid-template-columns: 20px 1fr;
            gap: .75rem;
            align-items: start;
        }

        .dot {
            width: 13px;
            height: 13px;
            border-radius: 999px;
            margin-top: .3rem;
            background: #dbe3f0;
        }

        .dot.complete { background: #198754; }
        .dot.current { background: #2551d1; }
        <?php endif; ?>

    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-light top-nav">
    <div class="container landing-main">
        <a class="navbar-brand" href="/">Verify Dummy Ticket</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="/services">Services</a></li>
                <li class="nav-item"><a class="nav-link" href="/dashboard">Dashboard</a></li>
                <li class="nav-item"><a class="btn btn-primary ms-lg-2" href="/order">Start Order</a></li>
            </ul>
        </div>
    </div>
</nav>

<main class="container landing-main py-4 py-lg-5">
    <?= $this->renderSection('content') ?>
</main>

<footer class="footer py-4">
    <div class="container landing-main d-flex flex-column flex-md-row justify-content-between gap-2">
        <p class="mb-0">© <?= date('Y') ?> Verify Dummy Ticket. All rights reserved.</p>
        <div class="d-flex gap-3">
            <a class="text-decoration-none" href="/services">Services</a>
            <a class="text-decoration-none" href="/contact">Contact</a>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
