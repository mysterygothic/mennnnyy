// Admin Pages Protection - Security Layer
// This script MUST be loaded FIRST before any other script

(function() {
    'use strict';
    
    // Immediately hide page content
    if (document.body) {
        document.body.style.display = 'none';
    }
    
    // Check if this is a protected admin page
    function isProtectedPage() {
        const path = window.location.pathname;
        const protectedPages = [
            'admin-dashboard.html',
            'admin-ramadan.html',
            'admin-delivery.html',
            'admin-driver-orders.html',
            'admin-customers.html',
            'admin-users.html'
        ];
        
        return protectedPages.some(page => path.includes(page));
    }
    
    // Verify admin authentication
    function verifyAuth() {
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
            console.warn('🚫 Unauthorized access attempt blocked!');
            window.location.replace('admin.html');
            return false;
        }
        
        return true;
    }
    
    // Initialize protection
    function init() {
        if (!isProtectedPage()) {
            // Not a protected page, show content
            if (document.body) {
                document.body.style.display = '';
            }
            return;
        }
        
        // Verify authentication
        if (verifyAuth()) {
            // Authenticated, show content
            if (document.body) {
                document.body.style.display = '';
            }
        } else {
            // Not authenticated, redirect to login
            // Keep body hidden during redirect
        }
    }
    
    // Run immediately
    init();
    
    // Also run when DOM is ready (in case script loaded before body)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    
    // Prevent right-click on admin pages (optional extra security)
    if (isProtectedPage()) {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Prevent F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U
            ) {
                e.preventDefault();
                return false;
            }
        });
    }
})();

