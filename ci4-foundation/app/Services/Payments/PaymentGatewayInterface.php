<?php

namespace App\Services\Payments;

interface PaymentGatewayInterface
{
    /**
     * @param array<string,mixed> $payload
     * @return array<string,mixed>
     */
    public function createCheckout(array $payload): array;

    /**
     * @param array<string,mixed> $payload
     */
    public function verifyWebhook(array $payload, ?string $signature = null): bool;
}
