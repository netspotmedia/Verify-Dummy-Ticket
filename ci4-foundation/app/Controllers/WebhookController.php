<?php

namespace App\Controllers;

use App\Models\WebhookEventModel;
use App\Services\Payments\PaymentGatewayFactory;
use Config\Payment;

class WebhookController extends BaseController
{
    public function payment()
    {
        $payload = $this->request->getJSON(true) ?? [];
        $signature = $this->request->getHeaderLine('X-Signature');
        $provider = (string) ($this->request->getGet('provider') ?? $this->request->getHeaderLine('X-Payment-Provider') ?? 'paystack');
        $eventId = (string) ($payload['id'] ?? $payload['event_id'] ?? md5(json_encode($payload)));

        $gateway = PaymentGatewayFactory::make($provider);
        $isValid = $gateway->verifyWebhook($payload, $signature);

        $config = config(Payment::class);
        if ($config->verifyWebhookSignature && ! $isValid) {
            return $this->response->setStatusCode(401)->setJSON(['ok' => false, 'message' => 'Invalid signature']);
        }

        $model = new WebhookEventModel();
        $existing = $model->where('provider', $provider)->where('event_id', $eventId)->first();
        if (! $existing) {
            $model->insert([
                'provider' => $provider,
                'event_id' => $eventId,
                'idempotency_key' => $this->request->getHeaderLine('Idempotency-Key') ?: null,
                'payload_json' => json_encode($payload),
                'processed' => 1,
                'processed_at' => date('Y-m-d H:i:s'),
            ]);
        }

        return $this->response->setJSON([
            'received' => true,
            'provider' => $provider,
            'event_id' => $eventId,
            'payload' => $payload,
        ]);
    }
}
