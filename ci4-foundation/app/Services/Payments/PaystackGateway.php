<?php

namespace App\Services\Payments;

use Config\Payment;
use InvalidArgumentException;

class PaystackGateway implements PaymentGatewayInterface
{
    /** @var string[] */
    private array $supportedCurrencies = ['NGN', 'USD'];

    public function createCheckout(array $payload): array
    {
        $config = config(Payment::class);
        $currency = strtoupper((string) ($payload['currency'] ?? 'NGN'));

        if (! in_array($currency, $this->supportedCurrencies, true)) {
            throw new InvalidArgumentException('Paystack only supports NGN and USD in this configuration.');
        }

        return [
            'provider' => 'paystack',
            'currency' => $currency,
            'public_key' => $config->paystackPublicKey,
            'checkout_url' => '/paystack/checkout/' . ($payload['order_number'] ?? 'UNKNOWN'),
            'status' => 'initiated',
            'note' => 'Replace with real Paystack transaction initialize API call.',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['event']);
    }
}
