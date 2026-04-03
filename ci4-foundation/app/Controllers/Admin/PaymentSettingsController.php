<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;

class PaymentSettingsController extends BaseController
{
    public function index()
    {
        $rows = db_connect()->table('site_settings')
            ->whereIn('setting_key', [
                'payment.default_provider',
                'payment.paystack_public_key',
                'payment.paypal_client_id',
            ])
            ->get()
            ->getResultArray();

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return view('admin/payment-settings/index', ['title' => 'Payment Settings', 'settings' => $settings, 'adminDashboard' => true]);
    }

    public function update()
    {
        $pairs = [
            'payment.default_provider' => (string) $this->request->getPost('default_provider'),
            'payment.paystack_public_key' => (string) $this->request->getPost('paystack_public_key'),
            'payment.paypal_client_id' => (string) $this->request->getPost('paypal_client_id'),
        ];

        foreach ($pairs as $key => $value) {
            $table = db_connect()->table('site_settings');
            $existing = $table->where('setting_key', $key)->get()->getRowArray();
            if ($existing) {
                db_connect()->table('site_settings')->where('setting_key', $key)->update(['setting_value' => $value]);
            } else {
                db_connect()->table('site_settings')->insert(['setting_key' => $key, 'setting_value' => $value, 'is_public' => 0]);
            }
        }

        return redirect()->back()->with('message', 'Payment settings updated.');
    }
}
