<?php

namespace App\Controllers;

use App\Services\Payments\PaymentGatewayFactory;

class PaymentController extends BaseController
{
    public function checkout()
    {
        $payload = [
            'order_number' => (string) $this->request->getPost('order_number'),
            'amount' => (float) $this->request->getPost('amount'),
            'currency' => (string) ($this->request->getPost('currency') ?? 'USD'),
        ];

        $gateway = PaymentGatewayFactory::make();
        $response = $gateway->createCheckout($payload);

        return $this->response->setJSON(['ok' => true, 'gateway_response' => $response]);
    }

    public function success(string $orderNumber)
    {
        return view('payment/success', ['title' => 'Payment Success', 'orderNumber' => $orderNumber]);
    }

    public function failed(string $orderNumber)
    {
        return view('payment/failed', ['title' => 'Payment Failed', 'orderNumber' => $orderNumber]);
    }
}
