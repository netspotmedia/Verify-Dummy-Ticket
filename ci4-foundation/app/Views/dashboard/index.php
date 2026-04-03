<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="dashboard-shell">
    <div class="row g-4">
        <div class="col-xl-3">
            <aside class="dashboard-sidebar p-3 p-lg-4">
                <h2 class="h5 fw-bold mb-3">My Dashboard</h2>
                <nav class="nav flex-column dashboard-nav gap-2">
                    <a class="nav-link active" href="/dashboard">Overview</a>
                    <a class="nav-link" href="/dashboard/orders">My Orders</a>
                    <a class="nav-link" href="/order">Create Order</a>
                    <a class="nav-link" href="/dashboard/tickets">Support Tickets</a>
                    <a class="nav-link" href="/contact">Contact Support</a>
                </nav>
                <hr>
                <div>
                    <small class="text-uppercase text-muted fw-semibold">Account status</small>
                    <p class="mb-1 mt-2 fw-semibold">Verified</p>
                    <p class="text-muted small mb-0">Last login: just now</p>
                </div>
            </aside>
        </div>

        <div class="col-xl-9">
            <section class="dashboard-header p-4 p-lg-4 mb-4">
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
                <div class="col-md-6 col-lg-3">
                    <div class="dashboard-metric p-3 h-100">
                        <p class="metric-label mb-1">Active Orders</p>
                        <p class="metric-value mb-0">3</p>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="dashboard-metric p-3 h-100">
                        <p class="metric-label mb-1">Pending Payment</p>
                        <p class="metric-value mb-0">1</p>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="dashboard-metric p-3 h-100">
                        <p class="metric-label mb-1">Completed</p>
                        <p class="metric-value mb-0">9</p>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="dashboard-metric p-3 h-100">
                        <p class="metric-label mb-1">Open Tickets</p>
                        <p class="metric-value mb-0">0</p>
                    </div>
                </div>
            </section>

            <section class="dashboard-panel p-3 p-lg-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0">Recent orders</h2>
                    <a href="/dashboard/orders" class="small text-decoration-none">View all</a>
                </div>
                <div class="table-responsive">
                    <table class="table align-middle dashboard-table mb-0">
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Route</th>
                            <th>Status</th>
                            <th>Updated</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>#VDT-4102</td>
                            <td>NYC → LON</td>
                            <td><span class="badge text-bg-success">Confirmed</span></td>
                            <td>5 mins ago</td>
                            <td><a href="#" class="btn btn-sm btn-outline-secondary">Details</a></td>
                        </tr>
                        <tr>
                            <td>#VDT-4098</td>
                            <td>LAX → CDG</td>
                            <td><span class="badge text-bg-warning">Pending</span></td>
                            <td>21 mins ago</td>
                            <td><a href="#" class="btn btn-sm btn-outline-secondary">Details</a></td>
                        </tr>
                        <tr>
                            <td>#VDT-4081</td>
                            <td>DXB → IST</td>
                            <td><span class="badge text-bg-info">Processing</span></td>
                            <td>1 hour ago</td>
                            <td><a href="#" class="btn btn-sm btn-outline-secondary">Details</a></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div class="row g-4">
                <div class="col-lg-7">
                    <section class="dashboard-panel p-3 p-lg-4 h-100">
                        <h2 class="h5 mb-3">Order progress</h2>
                        <div class="progress-list">
                            <div class="progress-item">
                                <span class="dot complete"></span>
                                <div>
                                    <p class="mb-1 fw-semibold">Order submitted</p>
                                    <p class="small text-muted mb-0">Your booking request has been received.</p>
                                </div>
                            </div>
                            <div class="progress-item">
                                <span class="dot complete"></span>
                                <div>
                                    <p class="mb-1 fw-semibold">Payment confirmed</p>
                                    <p class="small text-muted mb-0">Payment validated via selected gateway.</p>
                                </div>
                            </div>
                            <div class="progress-item">
                                <span class="dot current"></span>
                                <div>
                                    <p class="mb-1 fw-semibold">Reservation processing</p>
                                    <p class="small text-muted mb-0">We are generating your temporary itinerary.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div class="col-lg-5">
                    <section class="dashboard-panel p-3 p-lg-4 h-100">
                        <h2 class="h5 mb-3">Need help?</h2>
                        <p class="text-muted">Our support team is available for status checks and urgent requests.</p>
                        <a class="btn btn-outline-primary w-100 mb-2" href="/contact">Contact Support</a>
                        <a class="btn btn-light border w-100" href="/dashboard/tickets">Open a Ticket</a>
                    </section>
                </div>
            </div>
        </div>
    </div>
</div>

<?= $this->endSection() ?>
