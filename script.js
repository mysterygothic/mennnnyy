const WORKER_URL = 'https://proud-glade-56f1.zlmsn3mk.workers.dev/'; // Replace with your actual Cloudflare Worker URL

// Theme Management
function initTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeUI(theme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon && themeText) {
        if (theme === 'light') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'وضع داكن';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'وضع فاتح';
        }
    }
}

// Initialize theme on page load
initTheme();

async function sendToTelegram(data) {
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return null;
    }
}

function getVisitorInfo() {
    const now = new Date();
    const dateStr = now.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return {
        timestamp: dateStr,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        referrer: document.referrer || 'Direct',
        platform: navigator.platform
    };
}

function trackAction(action) {
    // Only track actions locally, don't send to Telegram
    console.log('Action tracked:', action);
}

function showSection(sectionId) {
    // This function is for the main index page navigation
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const sectionNames = {
        'menu': 'Menu',
        'order': 'Order Now',
        'location': 'Location',
        'review': 'Review Us'
    };
    
    trackAction(`Viewed ${sectionNames[sectionId]} Section`);
}

// Order Form Functions
function openOrderForm() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        trackAction('Opened Order Form');
    }
}

function closeOrderForm() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        // Reset form
        const form = document.getElementById('orderForm');
        if (form) {
            form.reset();
        }
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeOrderForm();
    }
}

// Phone number validation
function validatePhoneNumber(phone) {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
}

// Form submission
async function submitOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const orderData = {
        customerName: formData.get('customerName'),
        phoneNumber: '+962' + formData.get('phoneNumber'),
        orderType: formData.get('orderType'),
        meatType: formData.get('meatType'),
        amount: formData.get('amount'),
        notes: formData.get('notes') || 'لا توجد ملاحظات'
    };
    
    // Validate required fields
    if (!orderData.customerName || !orderData.phoneNumber || !orderData.orderType || !orderData.meatType || !orderData.amount) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // Validate phone number
    const phoneNumber = formData.get('phoneNumber');
    if (!validatePhoneNumber(phoneNumber)) {
        alert('يرجى إدخال رقم هاتف صحيح (9 أرقام)');
        return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';
    
    try {
        // Create order message for Telegram
        const orderMessage = `
🍽️ <b>طلب جديد من الموقع</b>

👤 <b>اسم العميل:</b> ${orderData.customerName}
📞 <b>رقم الهاتف:</b> ${orderData.phoneNumber}
🍖 <b>نوع الطلب:</b> ${orderData.orderType}
🥩 <b>نوع اللحم:</b> ${orderData.meatType}
📦 <b>الكمية:</b> ${orderData.amount}
📝 <b>ملاحظات:</b> ${orderData.notes}

📅 <b>وقت الطلب:</b> ${new Date().toLocaleString('ar-JO')}
        `.trim();
        
        // Send to Telegram
        const response = await sendToTelegram({ 
            type: 'order', 
            message: orderMessage,
            orderData: orderData
        });
        
        if (response) {
            alert('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
            closeOrderForm();
            trackAction('Order Submitted Successfully');
        } else {
            throw new Error('Failed to send order');
        }
        
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.');
        trackAction('Order Submission Failed');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'إرسال الطلب';
    }
}

// Initialize page load tracking
window.addEventListener('load', async () => {
    // Only track visits locally, don't send to Telegram
    console.log('Page loaded');

    // Animate navigation buttons if they exist
    document.querySelectorAll('.nav-btn').forEach((btn, index) => {
        setTimeout(() => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            btn.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
    
    // Add form submission event listener
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
});
