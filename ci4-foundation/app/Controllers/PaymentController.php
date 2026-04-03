<?php

namespace App\Controllers;

use App\Services\Payments\PaymentGatewayFactory;
use Throwable;

class PaymentController extends BaseController
{
    public function checkout()
    {
        $provider = (string) ($this->request->getPost('provider') ?? 'paystack');

        $payload = [
            'order_number' => (string) $this->request->getPost('order_number'),
            'amount' => (float) $this->request->getPost('amount'),
            'currency' => strtoupper((string) ($this->request->getPost('currency') ?? 'USD')),
            'email' => (string) ($this->request->getPost('email') ?? ''),
        ];

        try {
            $gateway = PaymentGatewayFactory::make($provider);
            $response = $gateway->createCheckout($payload);

            return $this->response->setJSON(['ok' => true, 'gateway_response' => $response]);
        } catch (Throwable $e) {
            return $this->response->setStatusCode(422)->setJSON([
                'ok' => false,
                'provider' => $provider,
                'message' => $e->getMessage(),
            ]);
        }
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
