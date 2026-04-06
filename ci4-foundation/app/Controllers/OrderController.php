<?php

namespace App\Controllers;

use App\Models\OrderModel;

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
        return $this->response->setJSON(['ok' => true, 'message' => 'Review step validated.']);
    }
}
