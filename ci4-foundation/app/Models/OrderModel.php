<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderModel extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'order_number', 'user_id', 'status', 'currency', 'subtotal_amount', 'discount_amount', 'tax_amount',
        'total_amount', 'customer_name', 'customer_email', 'customer_phone', 'trip_payload_json',
        'service_payload_json', 'notes', 'payment_status', 'placed_at',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
