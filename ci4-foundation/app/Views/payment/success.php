<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<div class="card card-body border-success">
    <h2 class="text-success">Checkout Initiated</h2>
    <?php if (session()->getFlashdata('message')): ?>
        <p><?= esc(session()->getFlashdata('message')) ?></p>
    <?php endif; ?>
    <p class="mb-1">Order Number: <strong><?= esc($orderNumber) ?></strong></p>
    <p class="text-muted">Your order has been created and payment is being processed.</p>
    <div class="d-flex gap-2">
        <a class="btn btn-primary" href="/dashboard">Go to Dashboard</a>
        <a class="btn btn-outline-secondary" href="/order">Create another order</a>
    </div>
</div>
<?= $this->endSection() ?>
