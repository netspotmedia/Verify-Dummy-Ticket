<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;

class OrdersController extends BaseController
{
    public function index()
    {
        return view('admin/orders/index', ['title' => 'Admin Orders']);
    }

    public function show(int $id)
    {
        return $this->response->setJSON(['ok' => true, 'order_id' => $id]);
    }

    public function updateStatus(int $id)
    {
        $status = $this->request->getPost('status');
        return $this->response->setJSON(['ok' => true, 'order_id' => $id, 'status' => $status]);
    }

    public function verifyPayment()
    {
        return $this->response->setJSON(['ok' => true, 'message' => 'Payment verification queued']);
    }
}
