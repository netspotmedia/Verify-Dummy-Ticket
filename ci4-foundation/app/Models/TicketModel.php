<?php

namespace App\Models;

use CodeIgniter\Model;

class TicketModel extends Model
{
    protected $table = 'support_tickets';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'ticket_number', 'user_id', 'order_id', 'subject', 'status', 'priority', 'last_message_at', 'closed_at',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
