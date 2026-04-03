<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<div class="card card-body border-danger">
    <h2 class="text-danger">Checkout Failed</h2>
    <?php if (session()->getFlashdata('error')): ?>
        <p><?= esc(session()->getFlashdata('error')) ?></p>
    <?php endif; ?>
    <p class="mb-1">Order Number: <strong><?= esc($orderNumber) ?></strong></p>
    <p class="text-muted">Please try again or change the payment provider.</p>
    <div class="d-flex gap-2">
        <a class="btn btn-primary" href="/order">Return to Order Form</a>
        <a class="btn btn-outline-secondary" href="/contact">Contact Support</a>
    </div>
</div>
<?= $this->endSection() ?>
