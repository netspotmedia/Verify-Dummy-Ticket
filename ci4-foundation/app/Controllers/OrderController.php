<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Services\Order\OrderPricingService;

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
            'currency' => strtoupper((string) ($this->request->getPost('currency') ?? 'USD')),
            'customer_name' => (string) $this->request->getPost('customer_name'),
            'customer_email' => (string) $this->request->getPost('customer_email'),
            'provider' => (string) ($this->request->getPost('provider') ?? 'paystack'),
        ];

        $pricing = (new OrderPricingService())->calculate($payload);

        return view('order/review', [
            'title' => 'Review Order',
            'form' => $payload,
            'pricing' => $pricing,
        ]);
    }
}
