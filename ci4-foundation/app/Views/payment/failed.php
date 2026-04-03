<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<div class="alert alert-danger"><strong>Payment failed.</strong> Order: <?= esc($orderNumber) ?></div>
<?= $this->endSection() ?>
