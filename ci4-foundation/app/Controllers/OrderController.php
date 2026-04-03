<?php

namespace App\Controllers;

use App\Services\Order\OrderPricingService;
use InvalidArgumentException;

class OrderController extends BaseController
{
    public function index()
    {
        $prefill = [
            'customer_name' => (string) ($this->request->getGet('full_name') ?? ''),
            'customer_email' => (string) ($this->request->getGet('email') ?? ''),
            'from' => (string) ($this->request->getGet('from') ?? ''),
            'to' => (string) ($this->request->getGet('to') ?? ''),
        ];

        return view('order/index', ['title' => 'Place Order', 'prefill' => $prefill]);
    }

    public function saveDraft()
    {
        return $this->response->setJSON(['ok' => true, 'message' => 'Draft endpoint reserved for async wizard save.']);
    }

    public function review()
    {
        $payload = [
            'services' => (array) $this->request->getPost('services'),
            'traveler_count' => (int) $this->request->getPost('traveler_count'),
            'trip_type' => (string) $this->request->getPost('trip_type'),
            'validity' => (string) $this->request->getPost('validity'),
            'hotel_type' => (string) $this->request->getPost('hotel_type'),
            'insurance_area' => (string) $this->request->getPost('insurance_area'),
            'insurance_duration' => (string) $this->request->getPost('insurance_duration'),
            'delivery_speed' => (string) $this->request->getPost('delivery_speed'),
            'customer_name' => (string) $this->request->getPost('customer_name'),
            'customer_email' => (string) $this->request->getPost('customer_email'),
            'customer_country' => (string) $this->request->getPost('customer_country'),
            'customer_country_code' => strtoupper((string) $this->request->getPost('customer_country_code')),
            'provider' => (string) ($this->request->getPost('provider') ?? 'paystack'),
            'separate_pnr_per_traveler' => (bool) $this->request->getPost('separate_pnr_per_traveler'),
            'traveler_names' => (string) ($this->request->getPost('traveler_names') ?? ''),
            'from' => (string) ($this->request->getPost('from') ?? ''),
            'to' => (string) ($this->request->getPost('to') ?? ''),
        ];

        if (count($payload['services']) < 1) {
            return redirect()->back()->withInput()->with('error', 'Select at least one service.');
        }

        try {
            $pricing = (new OrderPricingService())->calculate($payload);
        } catch (InvalidArgumentException $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }

        $payload['currency'] = $pricing['currency'];

        session()->set('checkout_context', [
            'form' => $payload,
            'pricing' => $pricing,
        ]);

        return view('order/review', [
            'title' => 'Review Order',
            'form' => $payload,
            'pricing' => $pricing,
        ]);
    }
}
