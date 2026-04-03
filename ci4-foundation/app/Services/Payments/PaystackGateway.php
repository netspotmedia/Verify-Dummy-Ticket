<?php

namespace App\Services\Payments;

use Config\Payment;
use InvalidArgumentException;
use RuntimeException;

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

        if ($config->paystackSecretKey === '') {
            throw new RuntimeException('Paystack secret key is not configured.');
        }

        $response = (new HttpPaymentClient())->postJson(
            'https://api.paystack.co/transaction/initialize',
            [
                'email' => (string) ($payload['email'] ?? ''),
                'amount' => (int) round(((float) ($payload['amount'] ?? 0)) * 100),
                'currency' => $currency,
                'reference' => (string) ($payload['order_number'] ?? ''),
            ],
            [
                'Authorization' => 'Bearer ' . $config->paystackSecretKey,
            ]
        );

        if (! (($response['status'] ?? false) === true && isset($response['data']['authorization_url']))) {
            throw new RuntimeException('Unexpected Paystack response format.');
        }

        return [
            'provider' => 'paystack',
            'currency' => $currency,
            'checkout_url' => (string) $response['data']['authorization_url'],
            'reference' => (string) ($response['data']['reference'] ?? ''),
            'status' => 'initiated',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['event']);
    }
}
