<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'HomeController::index');
$routes->get('/services', 'HomeController::services');
$routes->get('/contact', 'HomeController::contact');

$routes->group('order', static function (RouteCollection $routes): void {
    $routes->get('/', 'OrderController::index');
    $routes->post('save-draft', 'OrderController::saveDraft');
    $routes->post('review', 'OrderController::review');
    $routes->post('checkout', 'PaymentController::checkout');
    $routes->get('success/(:segment)', 'PaymentController::success/$1');
    $routes->get('failed/(:segment)', 'PaymentController::failed/$1');
});

$routes->group('dashboard', ['filter' => 'auth'], static function (RouteCollection $routes): void {
    $routes->get('/', 'DashboardController::index');
    $routes->get('orders', 'DashboardController::orders');
    $routes->get('tickets', 'DashboardController::tickets');
    $routes->post('tickets', 'DashboardController::createTicket');
});

$routes->group('admin', ['filter' => 'adminAuth'], static function (RouteCollection $routes): void {
    $routes->get('/', 'Admin\\OrdersController::index');
    $routes->get('orders/(:num)', 'Admin\\OrdersController::show/$1');
    $routes->post('orders/(:num)/status', 'Admin\\OrdersController::updateStatus/$1');
    $routes->post('payments/verify', 'Admin\\OrdersController::verifyPayment');
});

$routes->post('webhooks/payment', 'WebhookController::payment');
