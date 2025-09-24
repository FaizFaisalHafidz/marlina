<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // Check if user has Super Admin role
        $user = Auth::user();
        if (!$user->role || $user->role->nama_role !== 'Super Admin') {
            abort(403, 'Access denied. Super Admin role required.');
        }

        // Super Admin can access everything, so continue to next middleware/controller
        return $next($request);
    }
}