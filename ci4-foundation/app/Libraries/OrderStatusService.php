<?php

namespace App\Libraries;

use App\Models\OrderModel;
use App\Models\OrderStatusHistoryModel;

class OrderStatusService
{
    public function changeStatus(int $orderId, string $toStatus, ?int $changedBy, ?string $reason = null): bool
    {
        $orderModel = new OrderModel();
        $historyModel = new OrderStatusHistoryModel();

        $order = $orderModel->find($orderId);
        if (! $order) {
            return false;
        }

        $fromStatus = (string) ($order['status'] ?? 'unknown');

        $orderModel->update($orderId, ['status' => $toStatus]);
        $historyModel->insert([
            'order_id' => $orderId,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by' => $changedBy,
            'reason' => $reason,
        ]);

        return true;
    }
}
