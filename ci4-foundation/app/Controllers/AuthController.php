<?php

namespace App\Controllers;

use App\Models\UserModel;

class AuthController extends BaseController
{
    public function login()
    {
        return view('auth/login', ['title' => 'Login']);
    }

    public function attemptLogin()
    {
        $email = (string) $this->request->getPost('email');
        $password = (string) $this->request->getPost('password');

        $userModel = new UserModel();
        $user = $userModel->where('email', $email)->first();

        if (! $user || ! password_verify($password, $user['password_hash'])) {
            return redirect()->back()->withInput()->with('error', 'Invalid credentials.');
        }

        $userModel->update((int) $user['id'], ['last_login_at' => date('Y-m-d H:i:s')]);

        session()->set([
            'userId' => (int) $user['id'],
            'role' => $user['role'],
            'email' => $user['email'],
            'isAuthenticated' => true,
        ]);

        if (in_array($user['role'], ['admin', 'super_admin'], true)) {
            return redirect()->to('/admin')->with('message', 'Welcome back, admin.');
        }

        return redirect()->to('/dashboard')->with('message', 'Login successful.');
    }

    public function logout()
    {
        session()->destroy();
        return redirect()->to('/auth/login')->with('message', 'You have been logged out.');
    }
}
