<?php

namespace App\Controllers;

use App\Services\Payments\PaymentGatewayFactory;
use Config\Payment;

class WebhookController extends BaseController
{
    public function payment()
    {
        $payload = $this->request->getJSON(true) ?? [];
        $signature = $this->request->getHeaderLine('X-Signature');

        $gateway = PaymentGatewayFactory::make();
        $isValid = $gateway->verifyWebhook($payload, $signature);

        $config = config(Payment::class);
        if ($config->verifyWebhookSignature && ! $isValid) {
            return $this->response->setStatusCode(401)->setJSON(['ok' => false, 'message' => 'Invalid signature']);
        }

        return $this->response->setJSON(['received' => true, 'payload' => $payload]);
    }
}
