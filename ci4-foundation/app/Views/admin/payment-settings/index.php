<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Payment Settings</h2>
<p class="text-muted">Configure provider keys used by the checkout/payment API layer.</p>

<?php if (session()->getFlashdata('message')): ?>
    <div class="alert alert-success"><?= esc(session()->getFlashdata('message')) ?></div>
<?php endif; ?>

<form method="post" action="/admin/payment-settings" class="card card-body" style="max-width:760px;">
    <div class="mb-3">
        <label class="form-label">Default Provider</label>
        <select name="default_provider" class="form-select">
            <option value="paystack" <?= (($settings['payment.default_provider'] ?? '') === 'paystack') ? 'selected' : '' ?>>Paystack</option>
            <option value="paypal" <?= (($settings['payment.default_provider'] ?? '') === 'paypal') ? 'selected' : '' ?>>PayPal</option>
            <option value="stripe" <?= (($settings['payment.default_provider'] ?? '') === 'stripe') ? 'selected' : '' ?>>Stripe</option>
            <option value="dummy" <?= (($settings['payment.default_provider'] ?? '') === 'dummy') ? 'selected' : '' ?>>Dummy</option>
        </select>
    </div>
    <div class="row g-3">
        <div class="col-md-6">
            <label class="form-label">Paystack Public Key</label>
            <input type="text" name="paystack_public_key" class="form-control" value="<?= esc($settings['payment.paystack_public_key'] ?? '') ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">PayPal Client ID</label>
            <input type="text" name="paypal_client_id" class="form-control" value="<?= esc($settings['payment.paypal_client_id'] ?? '') ?>">
        </div>
    </div>
    <button class="btn btn-primary mt-3">Save Payment API Settings</button>
</form>
<?= $this->endSection() ?>
