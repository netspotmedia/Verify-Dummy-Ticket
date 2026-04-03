<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Payment Settings</h2>
<form method="post" action="/admin/payment-settings" class="card card-body">
    <div class="mb-3">
        <label class="form-label">Default Provider</label>
        <select name="default_provider" class="form-select">
            <option value="paystack" <?= (($settings['payment.default_provider'] ?? '') === 'paystack') ? 'selected' : '' ?>>Paystack</option>
            <option value="paypal" <?= (($settings['payment.default_provider'] ?? '') === 'paypal') ? 'selected' : '' ?>>PayPal</option>
            <option value="stripe" <?= (($settings['payment.default_provider'] ?? '') === 'stripe') ? 'selected' : '' ?>>Stripe</option>
        </select>
    </div>
    <div class="mb-3">
        <label class="form-label">Paystack Public Key</label>
        <input type="text" name="paystack_public_key" class="form-control" value="<?= esc($settings['payment.paystack_public_key'] ?? '') ?>">
    </div>
    <div class="mb-3">
        <label class="form-label">PayPal Client ID</label>
        <input type="text" name="paypal_client_id" class="form-control" value="<?= esc($settings['payment.paypal_client_id'] ?? '') ?>">
    </div>
    <button class="btn btn-primary">Save</button>
</form>
<?= $this->endSection() ?>
