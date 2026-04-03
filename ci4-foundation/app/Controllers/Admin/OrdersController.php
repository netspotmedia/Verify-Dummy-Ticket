<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Libraries\OrderStatusService;
use App\Models\OrderModel;
use App\Models\OrderStatusHistoryModel;
use App\Models\PaymentModel;

class OrdersController extends BaseController
{
    public function index()
    {
        $orderModel = new OrderModel();
        $paymentModel = new PaymentModel();

        $orders = $orderModel
            ->orderBy('updated_at', 'DESC')
            ->findAll(25);

        $metrics = [
            'total_orders' => (int) $orderModel->countAllResults(),
            'pending_orders' => (int) $orderModel->where('status', 'pending')->countAllResults(),
            'processing_orders' => (int) $orderModel->where('status', 'processing')->countAllResults(),
            'completed_orders' => (int) $orderModel->where('status', 'completed')->countAllResults(),
            'payment_pending' => (int) $paymentModel->where('status', 'pending')->countAllResults(),
        ];

        $recentStatusChanges = (new OrderStatusHistoryModel())
            ->select('order_status_history.order_id, order_status_history.from_status, order_status_history.to_status, order_status_history.created_at, orders.order_number')
            ->join('orders', 'orders.id = order_status_history.order_id', 'left')
            ->orderBy('order_status_history.created_at', 'DESC')
            ->findAll(8);

        return view('admin/orders/index', [
            'title' => 'Admin Dashboard',
            'adminDashboard' => true,
            'orders' => $orders,
            'metrics' => $metrics,
            'recentStatusChanges' => $recentStatusChanges,
        ]);
    }

    public function show(int $id)
    {
        $order = (new OrderModel())->find($id);
        if (! $order) {
            return $this->response->setStatusCode(404)->setJSON(['ok' => false, 'message' => 'Order not found']);
        }

        $payments = (new PaymentModel())->where('order_id', $id)->orderBy('created_at', 'DESC')->findAll();

        return $this->response->setJSON([
            'ok' => true,
            'order' => $order,
            'payments' => $payments,
        ]);
    }

    public function updateStatus(int $id)
    {
        $status = (string) $this->request->getPost('status');
        $reason = (string) ($this->request->getPost('reason') ?? '');
        $adminId = session()->get('userId') ? (int) session()->get('userId') : null;

        $updated = (new OrderStatusService())->changeStatus($id, $status, $adminId, $reason !== '' ? $reason : null);
        if (! $updated) {
            if (! $this->request->isAJAX()) {
                return redirect()->back()->with('error', 'Order not found.');
            }

            return $this->response->setStatusCode(404)->setJSON(['ok' => false, 'message' => 'Order not found']);
        }

        if (! $this->request->isAJAX()) {
            return redirect()->back()->with('message', 'Order status updated.');
        }

        return $this->response->setJSON(['ok' => true, 'order_id' => $id, 'status' => $status]);
    }

    public function verifyPayment()
    {
        $orderId = (int) $this->request->getPost('order_id');
        if ($orderId <= 0) {
            if (! $this->request->isAJAX()) {
                return redirect()->back()->with('error', 'Invalid order selected for payment verification.');
            }

            return $this->response->setStatusCode(422)->setJSON(['ok' => false, 'message' => 'Invalid order']);
        }

        $payment = (new PaymentModel())
            ->where('order_id', $orderId)
            ->orderBy('created_at', 'DESC')
            ->first();

        if (! $payment) {
            if (! $this->request->isAJAX()) {
                return redirect()->back()->with('error', 'No payment record found for this order.');
            }

            return $this->response->setStatusCode(404)->setJSON(['ok' => false, 'message' => 'Payment record not found']);
        }

        (new PaymentModel())->update((int) $payment['id'], [
            'status' => 'verified',
            'processed_at' => date('Y-m-d H:i:s'),
        ]);

        if (! $this->request->isAJAX()) {
            return redirect()->back()->with('message', 'Payment verification marked as complete.');
        }

        return $this->response->setJSON(['ok' => true, 'message' => 'Payment verified', 'order_id' => $orderId]);
    }
}
