<?php

namespace App\Controllers;

class PaymentController extends BaseController
{
    public function checkout()
    {
        return $this->response->setJSON([
            'ok' => true,
            'gateway' => 'placeholder',
            'message' => 'Connect gateway SDK in Part 2.',
        ]);
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
