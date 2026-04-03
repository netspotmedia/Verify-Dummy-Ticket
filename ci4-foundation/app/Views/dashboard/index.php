<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="dashboard-shell">
    <?php if (session()->getFlashdata('message')): ?>
        <div class="alert alert-success"><?= esc(session()->getFlashdata('message')) ?></div>
    <?php endif; ?>
    <?php if (session()->getFlashdata('error')): ?>
        <div class="alert alert-danger"><?= esc(session()->getFlashdata('error')) ?></div>
    <?php endif; ?>

    <div class="row g-4">
        <div class="col-xl-3">
            <aside class="dashboard-sidebar p-3 p-lg-4">
                <h2 class="h5 fw-bold mb-3">My Dashboard</h2>
                <nav class="nav flex-column dashboard-nav gap-2">
                    <a class="nav-link active" href="/dashboard">Overview</a>
                    <a class="nav-link" href="/dashboard/orders" target="_blank" rel="noopener noreferrer">Orders API</a>
                    <a class="nav-link" href="/order">Create Order</a>
                    <a class="nav-link" href="/dashboard/tickets" target="_blank" rel="noopener noreferrer">Tickets API</a>
                    <a class="nav-link" href="/contact">Contact Support</a>
                </nav>
                <hr>
                <div>
                    <small class="text-uppercase text-muted fw-semibold">Account</small>
                    <p class="mb-1 mt-2 fw-semibold text-break"><?= esc((string) session()->get('email')) ?></p>
                    <p class="text-muted small mb-0">Role: <?= esc((string) session()->get('role')) ?></p>
                </div>
            </aside>
        </div>

        <div class="col-xl-9">
            <section class="dashboard-header p-4 mb-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <p class="text-uppercase text-muted fw-semibold small mb-2">Welcome back</p>
                        <h1 class="h3 fw-bold mb-1">Track orders, payments, and support.</h1>
                        <p class="text-muted mb-0">Everything you need in one place.</p>
                    </div>
                    <a class="btn btn-primary" href="/order">+ New Reservation</a>
                </div>
            </section>

            <section class="row g-3 mb-4">
                <div class="col-md-6 col-lg-3"><div class="dashboard-metric p-3 h-100"><p class="metric-label mb-1">Active Orders</p><p class="metric-value mb-0"><?= esc((string) ($metrics['active_orders'] ?? 0)) ?></p></div></div>
                <div class="col-md-6 col-lg-3"><div class="dashboard-metric p-3 h-100"><p class="metric-label mb-1">Pending Payment</p><p class="metric-value mb-0"><?= esc((string) ($metrics['pending_payment'] ?? 0)) ?></p></div></div>
                <div class="col-md-6 col-lg-3"><div class="dashboard-metric p-3 h-100"><p class="metric-label mb-1">Completed</p><p class="metric-value mb-0"><?= esc((string) ($metrics['completed'] ?? 0)) ?></p></div></div>
                <div class="col-md-6 col-lg-3"><div class="dashboard-metric p-3 h-100"><p class="metric-label mb-1">Open Tickets</p><p class="metric-value mb-0"><?= esc((string) ($metrics['open_tickets'] ?? 0)) ?></p></div></div>
            </section>

            <section class="dashboard-panel p-3 p-lg-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0">Recent orders</h2>
                    <a href="/dashboard/orders" target="_blank" rel="noopener noreferrer" class="small text-decoration-none">View API JSON</a>
                </div>
                <div class="table-responsive">
                    <table class="table align-middle dashboard-table mb-0">
                        <thead><tr><th>Order ID</th><th>Route</th><th>Status</th><th>Payment</th><th>Updated</th></tr></thead>
                        <tbody>
                        <?php if (! empty($orders)): ?>
                            <?php foreach ($orders as $order): ?>
                                <?php $trip = json_decode((string) ($order['trip_payload_json'] ?? '{}'), true) ?: []; ?>
                                <tr>
                                    <td><?= esc($order['order_number'] ?: ('#' . $order['id'])) ?></td>
                                    <td><?= esc(($trip['from'] ?? 'N/A') . ' → ' . ($trip['to'] ?? 'N/A')) ?></td>
                                    <td><span class="badge text-bg-light border text-dark text-capitalize"><?= esc($order['status'] ?? 'pending') ?></span></td>
                                    <td><span class="badge text-bg-secondary text-capitalize"><?= esc($order['payment_status'] ?? 'pending') ?></span></td>
                                    <td><?= esc((string) ($order['updated_at'] ?? '')) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="5" class="text-center text-muted py-4">No orders found yet.</td></tr>
                        <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <div class="row g-4">
                <div class="col-lg-7">
                    <section class="dashboard-panel p-3 p-lg-4 h-100">
                        <h2 class="h5 mb-3">Create support ticket</h2>
                        <form method="post" action="/dashboard/tickets" class="vstack gap-3">
                            <input class="form-control" name="subject" placeholder="Ticket subject" required>
                            <select class="form-select" name="priority">
                                <option value="normal">Normal priority</option>
                                <option value="high">High priority</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            <input class="form-control" name="order_id" type="number" min="1" placeholder="Related Order ID (optional)">
                            <button class="btn btn-primary" type="submit">Create Ticket</button>
                        </form>
                    </section>
                </div>
                <div class="col-lg-5">
                    <section class="dashboard-panel p-3 p-lg-4 h-100">
                        <h2 class="h5 mb-3">Recent tickets</h2>
                        <?php if (! empty($tickets)): ?>
                            <ul class="list-group list-group-flush">
                                <?php foreach ($tickets as $ticket): ?>
                                    <li class="list-group-item px-0">
                                        <div class="fw-semibold"><?= esc($ticket['ticket_number']) ?></div>
                                        <div class="small text-muted mb-1"><?= esc($ticket['subject']) ?></div>
                                        <span class="badge text-bg-light border text-dark text-capitalize"><?= esc($ticket['status']) ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php else: ?>
                            <p class="text-muted mb-0">No tickets yet.</p>
                        <?php endif; ?>
                    </section>
                </div>
            </div>
        </div>
    </div>
</div>

<?= $this->endSection() ?>
