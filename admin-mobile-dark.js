// ========================================
//  MOBILE SUPPORT & DARK MODE
// ========================================

(function() {
    'use strict';
    
    // ==================== THEME MANAGEMENT ====================
    const THEME_KEY = 'admin_theme';
    
    function getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }
    
    function setTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
    }
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    // Apply saved theme immediately
    applyTheme(getTheme());
    
    // ==================== DOM INITIALIZATION ====================
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initThemeToggle();
    });
    
    // ==================== MOBILE MENU ====================
    function initMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        // Create mobile menu toggle button
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'فتح القائمة');
        document.body.appendChild(menuToggle);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        // Toggle menu
        menuToggle.addEventListener('click', function() {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', closeMobileMenu);
        
        // Close menu when clicking a nav link
        const navLinks = sidebar.querySelectorAll('.admin-nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Only close on mobile
                if (window.innerWidth <= 768) {
                    setTimeout(closeMobileMenu, 300);
                }
            });
        });
        
        // Close menu on window resize if going to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
        
        function openMobileMenu() {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            menuToggle.innerHTML = '✕';
            menuToggle.setAttribute('aria-label', 'إغلاق القائمة');
            document.body.style.overflow = 'hidden';
        }
        
        function closeMobileMenu() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            menuToggle.innerHTML = '☰';
            menuToggle.setAttribute('aria-label', 'فتح القائمة');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== THEME TOGGLE ====================
    function initThemeToggle() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        // Create theme toggle
        const themeContainer = document.createElement('div');
        themeContainer.className = 'theme-toggle-container';
        
        const currentTheme = getTheme();
        const isDark = currentTheme === 'dark';
        
        themeContainer.innerHTML = `
            <div class="theme-toggle ${isDark ? 'active' : ''}" id="themeToggle" role="button" tabindex="0" aria-label="تبديل الوضع ${isDark ? 'الفاتح' : 'المظلم'}">
                <div class="theme-toggle-label">
                    <span class="theme-icon">${isDark ? '🌙' : '☀️'}</span>
                    <span>${isDark ? 'الوضع المظلم' : 'الوضع الفاتح'}</span>
                </div>
                <div class="toggle-switch"></div>
            </div>
        `;
        
        sidebar.appendChild(themeContainer);
        
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.addEventListener('click', toggleTheme);
        
        // Keyboard support
        themeToggle.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
        
        function toggleTheme() {
            const currentTheme = getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            setTheme(newTheme);
            updateToggleUI(newTheme);
            
            // Show brief notification
            showThemeNotification(newTheme);
        }
        
        function updateToggleUI(theme) {
            const themeToggle = document.getElementById('themeToggle');
            const isDark = theme === 'dark';
            
            if (isDark) {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
            
            const label = themeToggle.querySelector('.theme-toggle-label span:last-child');
            const icon = themeToggle.querySelector('.theme-icon');
            
            if (label) {
                label.textContent = isDark ? 'الوضع المظلم' : 'الوضع الفاتح';
            }
            
            if (icon) {
                icon.textContent = isDark ? '🌙' : '☀️';
            }
            
            themeToggle.setAttribute('aria-label', `تبديل الوضع ${isDark ? 'الفاتح' : 'المظلم'}`);
        }
        
        function showThemeNotification(theme) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: ${theme === 'dark' ? '#2d3748' : 'white'};
                color: ${theme === 'dark' ? '#e2e8f0' : '#333'};
                padding: 12px 24px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: 'IBM Plex Sans Arabic', sans-serif;
                font-weight: 500;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            notification.textContent = theme === 'dark' ? 
                '🌙 تم تفعيل الوضع المظلم' : 
                '☀️ تم تفعيل الوضع الفاتح';
            
            document.body.appendChild(notification);
            
            // Fade in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // Fade out and remove
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }
    }
    
    // ==================== UTILITIES ====================
    
    // Export functions for external use
    window.AdminMobile = {
        getTheme: getTheme,
        setTheme: setTheme
    };
    
})();

