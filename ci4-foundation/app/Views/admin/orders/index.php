<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="admin-shell">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
            <p class="text-uppercase text-muted small fw-semibold mb-1">Admin Control Center</p>
            <h1 class="h3 fw-bold mb-1">Operations Dashboard</h1>
            <p class="text-muted mb-0">Monitor orders, update statuses, and verify payments from one view.</p>
        </div>
        <a href="/admin/payment-settings" class="btn btn-primary">Payment Settings</a>
    </div>

    <?php if (session()->getFlashdata('message')): ?>
        <div class="alert alert-success"><?= esc(session()->getFlashdata('message')) ?></div>
    <?php endif; ?>
    <?php if (session()->getFlashdata('error')): ?>
        <div class="alert alert-danger"><?= esc(session()->getFlashdata('error')) ?></div>
    <?php endif; ?>

    <section class="row g-3 mb-4">
        <div class="col-md-4 col-lg-2">
            <div class="metric-card p-3 h-100">
                <p class="metric-label mb-1">Total Orders</p>
                <p class="metric-value mb-0"><?= esc((string) ($metrics['total_orders'] ?? 0)) ?></p>
            </div>
        </div>
        <div class="col-md-4 col-lg-2">
            <div class="metric-card p-3 h-100">
                <p class="metric-label mb-1">Pending</p>
                <p class="metric-value mb-0"><?= esc((string) ($metrics['pending_orders'] ?? 0)) ?></p>
            </div>
        </div>
        <div class="col-md-4 col-lg-2">
            <div class="metric-card p-3 h-100">
                <p class="metric-label mb-1">Processing</p>
                <p class="metric-value mb-0"><?= esc((string) ($metrics['processing_orders'] ?? 0)) ?></p>
            </div>
        </div>
        <div class="col-md-4 col-lg-2">
            <div class="metric-card p-3 h-100">
                <p class="metric-label mb-1">Completed</p>
                <p class="metric-value mb-0"><?= esc((string) ($metrics['completed_orders'] ?? 0)) ?></p>
            </div>
        </div>
        <div class="col-md-4 col-lg-4">
            <div class="metric-card p-3 h-100">
                <p class="metric-label mb-1">Payments Pending Verification</p>
                <p class="metric-value mb-0"><?= esc((string) ($metrics['payment_pending'] ?? 0)) ?></p>
            </div>
        </div>
    </section>

    <div class="row g-4">
        <div class="col-xl-8">
            <section class="admin-panel p-3 p-lg-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0">Order Queue</h2>
                    <span class="text-muted small"><?= count($orders ?? []) ?> records</span>
                </div>
                <div class="table-responsive">
                    <table class="table align-middle admin-table mb-0">
                        <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php if (! empty($orders)): ?>
                            <?php foreach ($orders as $order): ?>
                                <tr>
                                    <td>
                                        <div class="fw-semibold"><?= esc($order['order_number'] ?: ('#' . $order['id'])) ?></div>
                                        <small class="text-muted">Updated <?= esc((string) ($order['updated_at'] ?? 'N/A')) ?></small>
                                    </td>
                                    <td>
                                        <div><?= esc($order['customer_name'] ?? 'Unknown') ?></div>
                                        <small class="text-muted"><?= esc($order['customer_email'] ?? 'N/A') ?></small>
                                    </td>
                                    <td>
                                        <span class="badge text-bg-light border text-dark text-capitalize mb-2"><?= esc($order['status'] ?? 'pending') ?></span>
                                        <form method="post" action="/admin/orders/<?= (int) $order['id'] ?>/status" class="vstack gap-2">
                                            <select name="status" class="form-select form-select-sm" required>
                                                <?php $currentStatus = (string) ($order['status'] ?? 'pending'); ?>
                                                <?php foreach (['pending', 'processing', 'completed', 'cancelled'] as $status): ?>
                                                    <option value="<?= esc($status) ?>" <?= $currentStatus === $status ? 'selected' : '' ?>><?= esc(ucfirst($status)) ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                            <input name="reason" class="form-control form-control-sm" placeholder="Reason (optional)">
                                            <button class="btn btn-sm btn-outline-primary" type="submit">Save</button>
                                        </form>
                                    </td>
                                    <td>
                                        <span class="badge text-bg-secondary text-capitalize"><?= esc($order['payment_status'] ?? 'unpaid') ?></span>
                                        <form method="post" action="/admin/payments/verify" class="mt-2">
                                            <input type="hidden" name="order_id" value="<?= (int) $order['id'] ?>">
                                            <button class="btn btn-sm btn-outline-success" type="submit">Verify</button>
                                        </form>
                                    </td>
                                    <td><?= esc(($order['currency'] ?? 'USD') . ' ' . number_format((float) ($order['total_amount'] ?? 0), 2)) ?></td>
                                    <td>
                                        <a class="btn btn-sm btn-outline-secondary" href="/admin/orders/<?= (int) $order['id'] ?>" target="_blank" rel="noopener noreferrer">JSON</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="6" class="text-center text-muted py-4">No orders found.</td>
                            </tr>
                        <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <div class="col-xl-4">
            <section class="admin-panel p-3 p-lg-4 h-100">
                <h2 class="h5 mb-3">Recent Status Activity</h2>
                <div class="activity-list">
                    <?php if (! empty($recentStatusChanges)): ?>
                        <?php foreach ($recentStatusChanges as $activity): ?>
                            <article class="activity-item">
                                <p class="mb-1 fw-semibold">
                                    <?= esc($activity['order_number'] ?: ('#' . $activity['order_id'])) ?>
                                    <span class="text-muted fw-normal">→ <?= esc($activity['to_status'] ?? 'pending') ?></span>
                                </p>
                                <p class="small text-muted mb-0">
                                    From <?= esc($activity['from_status'] ?? 'n/a') ?> · <?= esc((string) ($activity['created_at'] ?? '')) ?>
                                </p>
                            </article>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p class="text-muted mb-0">No status changes logged yet.</p>
                    <?php endif; ?>
                </div>
            </section>
        </div>
    </div>
</div>

<?= $this->endSection() ?>
