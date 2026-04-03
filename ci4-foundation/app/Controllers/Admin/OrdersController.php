<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Libraries\OrderStatusService;

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
        $status = (string) $this->request->getPost('status');
        $reason = (string) ($this->request->getPost('reason') ?? '');
        $adminId = session()->get('userId') ? (int) session()->get('userId') : null;

        $updated = (new OrderStatusService())->changeStatus($id, $status, $adminId, $reason !== '' ? $reason : null);
        if (! $updated) {
            return $this->response->setStatusCode(404)->setJSON(['ok' => false, 'message' => 'Order not found']);
        }

        return $this->response->setJSON(['ok' => true, 'order_id' => $id, 'status' => $status]);
    }

    public function verifyPayment()
    {
        return $this->response->setJSON(['ok' => true, 'message' => 'Payment verification queued']);
    }
}
