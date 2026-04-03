<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Services\Order\OrderPricingService;
use InvalidArgumentException;

class OrderController extends BaseController
{
    public function index()
    {
        return view('order/index', ['title' => 'Place Order']);
    }

    public function saveDraft()
    {
        $orderModel = new OrderModel();
        $id = $orderModel->insert([
            'order_number' => 'DRAFT-' . date('YmdHis'),
            'status' => 'draft',
            'currency' => 'USD',
            'subtotal_amount' => 0,
            'total_amount' => 0,
        ]);

        return $this->response->setJSON(['ok' => true, 'order_id' => $id]);
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

        return view('order/review', [
            'title' => 'Review Order',
            'form' => $payload,
            'pricing' => $pricing,
        ]);
    }
}
