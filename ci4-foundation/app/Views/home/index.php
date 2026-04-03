<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<section class="hero p-5 mb-4">
    <h1>Server-Rendered CI4 Foundation</h1>
    <p class="mb-0">This preserves the workflow for order creation, dashboard tracking, and admin processing.</p>
</section>
<div class="row g-3">
    <div class="col-md-4"><a class="btn btn-primary w-100" href="/order">Start Order</a></div>
    <div class="col-md-4"><a class="btn btn-outline-primary w-100" href="/dashboard">User Dashboard</a></div>
    <div class="col-md-4"><a class="btn btn-outline-dark w-100" href="/admin">Admin Panel</a></div>
</div>
<?= $this->endSection() ?>
