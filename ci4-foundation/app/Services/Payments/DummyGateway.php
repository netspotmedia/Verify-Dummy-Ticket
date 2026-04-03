<?php

namespace App\Services\Payments;

class DummyGateway implements PaymentGatewayInterface
{
    public function createCheckout(array $payload): array
    {
        return [
            'provider' => 'dummy',
            'checkout_url' => '/order/success/' . ($payload['order_number'] ?? 'UNKNOWN'),
            'status' => 'initiated',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return isset($payload['event']) && $signature !== null;
    }
}
