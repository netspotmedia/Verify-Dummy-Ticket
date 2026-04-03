<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderStatusHistoryModel extends Model
{
    protected $table = 'order_status_history';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'order_id', 'from_status', 'to_status', 'changed_by', 'reason',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = '';
}
