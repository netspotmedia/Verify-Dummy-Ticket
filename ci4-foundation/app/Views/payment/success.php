<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<div class="alert alert-success"><strong>Payment successful.</strong> Order: <?= esc($orderNumber) ?></div>
<?= $this->endSection() ?>
