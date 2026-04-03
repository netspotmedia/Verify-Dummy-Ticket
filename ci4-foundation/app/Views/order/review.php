<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<?php $symbol = $pricing['currency'] === 'NGN' ? '₦' : '$'; ?>
<h2>Review Order</h2>
<div class="card card-body mb-3">
  <p class="mb-1"><strong>Customer:</strong> <?= esc($form['customer_name']) ?> (<?= esc($form['customer_email']) ?>)</p>
  <p class="mb-1"><strong>Country:</strong> <?= esc($form['customer_country']) ?> (<?= esc($form['customer_country_code']) ?>)</p>
  <p class="mb-1"><strong>Currency:</strong> <?= esc($pricing['currency']) ?> <?php if ($pricing['currency']==='NGN'): ?>(Rate: <?= esc((string) $pricing['exchange_rate']) ?>)<?php endif; ?></p>
  <p class="mb-0"><strong>Selected Gateway:</strong> <?= esc(strtoupper($pricing['provider'])) ?> | <strong>Allowed:</strong> <?= esc(strtoupper(implode(', ', $pricing['allowed_providers']))) ?></p>
</div>

<div class="card card-body mb-3">
  <h5>Price Breakdown</h5>
  <table class="table table-sm">
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
    <tbody>
    <?php foreach ($pricing['items'] as $item): ?>
      <tr>
        <td><?= esc($item['label']) ?></td>
        <td><?= esc((string) $item['qty']) ?></td>
        <td><?= $item['code']==='hotel' && (int)$item['qty']===1 && (float)$item['unit']===0.0 ? '—' : $symbol . number_format((float) $item['unit'] * ($pricing['currency']==='NGN' ? $pricing['exchange_rate'] : 1), 2) ?></td>
        <td><?= $symbol . number_format((float) $item['total'] * ($pricing['currency']==='NGN' ? $pricing['exchange_rate'] : 1), 2) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
    <tfoot>
      <tr><th colspan="3">Subtotal</th><th><?= $symbol . number_format((float) $pricing['subtotal'], 2) ?></th></tr>
      <tr><th colspan="3">Tax</th><th><?= $symbol . number_format((float) $pricing['tax'], 2) ?></th></tr>
      <tr><th colspan="3">Discount</th><th>-<?= $symbol . number_format((float) $pricing['discount'], 2) ?></th></tr>
      <tr><th colspan="3">Total</th><th><?= $symbol . number_format((float) $pricing['total'], 2) ?></th></tr>
    </tfoot>
  </table>
</div>

<form method="post" action="/order/checkout" class="d-flex gap-2">
  <input type="hidden" name="order_number" value="DRAFT-<?= date('YmdHis') ?>">
  <input type="hidden" name="amount" value="<?= esc((string) $pricing['total']) ?>">
  <input type="hidden" name="currency" value="<?= esc($pricing['currency']) ?>">
  <input type="hidden" name="provider" value="<?= esc($pricing['provider']) ?>">
  <input type="hidden" name="email" value="<?= esc($form['customer_email']) ?>">
  <a href="/order" class="btn btn-outline-secondary">Back</a>
  <button class="btn btn-primary">Proceed to Checkout</button>
</form>
<?= $this->endSection() ?>
