<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\OrderStatusHistoryModel;
use App\Models\PaymentModel;
use App\Services\Payments\PaymentGatewayFactory;
use Throwable;

class PaymentController extends BaseController
{
    public function checkout()
    {
        $context = session()->get('checkout_context');
        if (! is_array($context) || ! isset($context['form'], $context['pricing'])) {
            return redirect()->to('/order')->with('error', 'Your checkout session expired. Please review your order again.');
        }

        $form = (array) $context['form'];
        $pricing = (array) $context['pricing'];

        $provider = (string) ($this->request->getPost('provider') ?? ($pricing['provider'] ?? 'paystack'));
        $orderNumber = (string) ($this->request->getPost('order_number') ?: ('VDT-' . date('YmdHis')));

        $orderId = (int) (new OrderModel())->insert([
            'order_number' => $orderNumber,
            'user_id' => session()->get('userId') ? (int) session()->get('userId') : null,
            'status' => 'processing',
            'currency' => (string) ($pricing['currency'] ?? 'USD'),
            'subtotal_amount' => (float) ($pricing['subtotal'] ?? 0),
            'discount_amount' => (float) ($pricing['discount'] ?? 0),
            'tax_amount' => (float) ($pricing['tax'] ?? 0),
            'total_amount' => (float) ($pricing['total'] ?? 0),
            'customer_name' => (string) ($form['customer_name'] ?? ''),
            'customer_email' => (string) ($form['customer_email'] ?? ''),
            'customer_phone' => '',
            'trip_payload_json' => json_encode([
                'from' => $form['from'] ?? '',
                'to' => $form['to'] ?? '',
                'trip_type' => $form['trip_type'] ?? '',
                'traveler_names' => $form['traveler_names'] ?? '',
            ], JSON_UNESCAPED_UNICODE),
            'service_payload_json' => json_encode([
                'services' => $form['services'] ?? [],
                'delivery_speed' => $form['delivery_speed'] ?? 'normal',
                'provider' => $provider,
            ], JSON_UNESCAPED_UNICODE),
            'notes' => 'Created via checkout form workflow',
            'payment_status' => 'pending',
            'placed_at' => date('Y-m-d H:i:s'),
        ]);

        $paymentId = (int) (new PaymentModel())->insert([
            'order_id' => $orderId,
            'provider' => $provider,
            'provider_reference' => 'INIT-' . strtoupper(substr(sha1((string) microtime(true)), 0, 12)),
            'status' => 'initiated',
            'currency' => (string) ($pricing['currency'] ?? 'USD'),
            'amount' => (float) ($pricing['total'] ?? 0),
            'fee_amount' => 0,
            'provider_payload_json' => json_encode(['source' => 'checkout_form'], JSON_UNESCAPED_UNICODE),
            'processed_at' => null,
        ]);

        (new OrderStatusHistoryModel())->insert([
            'order_id' => $orderId,
            'from_status' => 'draft',
            'to_status' => 'processing',
            'changed_by' => session()->get('userId') ? (int) session()->get('userId') : null,
            'reason' => 'Checkout initiated',
        ]);

        $payload = [
            'order_number' => $orderNumber,
            'amount' => (float) ($pricing['total'] ?? 0),
            'currency' => strtoupper((string) ($pricing['currency'] ?? 'USD')),
            'email' => (string) ($form['customer_email'] ?? ''),
        ];

        try {
            $gateway = PaymentGatewayFactory::make($provider);
            $gatewayResponse = $gateway->createCheckout($payload);

            (new PaymentModel())->update($paymentId, [
                'provider_payload_json' => json_encode($gatewayResponse, JSON_UNESCAPED_UNICODE),
                'status' => 'pending',
            ]);

            session()->remove('checkout_context');

            return redirect()->to('/order/success/' . $orderNumber)
                ->with('message', 'Checkout initiated successfully with ' . strtoupper($provider) . '.');
        } catch (Throwable $e) {
            (new PaymentModel())->update($paymentId, [
                'status' => 'failed',
                'provider_payload_json' => json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE),
            ]);

            (new OrderModel())->update($orderId, [
                'status' => 'payment_failed',
                'payment_status' => 'failed',
            ]);

            return redirect()->to('/order/failed/' . $orderNumber)
                ->with('error', 'Payment initialization failed: ' . $e->getMessage());
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
