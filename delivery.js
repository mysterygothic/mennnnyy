// Delivery Management System
// Manages driver assignments and delivery tracking

// ========== CONFIGURATION ==========
const DRIVERS_LIST = [
    'ابو حمزة',
    'ابو ضياء',
    'عبدالله المبيضين'
];

// Storage key
const DELIVERY_ASSIGNMENTS_KEY = 'delivery_assignments';
const TELEGRAM_WORKER_URL = 'https://mataamshiekh-ramadan.zlmsn3mk.workers.dev';

// ========== GET DELIVERY ORDERS ==========
function getDeliveryOrders() {
    // Get all Ramadan orders
    const ramadanOrders = getRamadanOrders();
    
    // Filter only delivery orders
    return ramadanOrders.filter(order => order.deliveryType === 'توصيل');
}

// ========== GET/SAVE DRIVER ASSIGNMENTS ==========
function getDriverAssignments() {
    const data = localStorage.getItem(DELIVERY_ASSIGNMENTS_KEY);
    return data ? JSON.parse(data) : {};
}

function saveDriverAssignments(assignments) {
    localStorage.setItem(DELIVERY_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

// ========== ASSIGN DRIVER TO ORDER ==========
function assignDriver(orderId, driverName) {
    const assignments = getDriverAssignments();
    assignments[orderId] = driverName;
    saveDriverAssignments(assignments);
    
    // Refresh display
    loadDeliveryOrders();
}

// ========== GET ORDERS BY DRIVER ==========
function getOrdersByDriver(driverName) {
    const deliveryOrders = getDeliveryOrders();
    const assignments = getDriverAssignments();
    
    return deliveryOrders.filter(order => assignments[order.id] === driverName);
}

// ========== CALCULATE DRIVER TOTAL ==========
function calculateDriverTotal(driverName) {
    const orders = getOrdersByDriver(driverName);
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
}

// ========== GET DELIVERY ORDERS COUNT ==========
function getDeliveryOrdersCount() {
    return getDeliveryOrders().length;
}

// ========== LOAD DELIVERY ORDERS ==========
function loadDeliveryOrders() {
    const deliveryOrders = getDeliveryOrders();
    const assignments = getDriverAssignments();
    const ordersList = document.getElementById('deliveryOrdersList');
    
    if (!ordersList) return;
    
    if (deliveryOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-state">لا توجد طلبات توصيل</p>';
        updateDriversSummary();
        return;
    }
    
    ordersList.innerHTML = deliveryOrders.map(order => {
        const assignedDriver = assignments[order.id] || '';
        
        return `
            <div class="delivery-order-card">
                <div class="order-info">
                    <div class="order-header">
                        <h4>طلب رقم ${order.serialNumber}</h4>
                        <span class="order-price">${order.totalAmount} دينار</span>
                    </div>
                    <div class="order-details">
                        <p><strong>العميل:</strong> ${order.customerName}</p>
                        <p><strong>التلفون:</strong> ${order.phoneNumber}</p>
                        <p><strong>العنوان:</strong> ${order.deliveryAddress || '-'}</p>
                        <p><strong>الطلب:</strong> ${formatOrderItems(order.items)}</p>
                    </div>
                </div>
                <div class="driver-assignment">
                    <label for="driver-${order.id}">السائق:</label>
                    <select id="driver-${order.id}" onchange="assignDriver(${order.id}, this.value)" class="driver-select">
                        <option value="">اختر السائق</option>
                        ${DRIVERS_LIST.map(driver => 
                            `<option value="${driver}" ${assignedDriver === driver ? 'selected' : ''}>${driver}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
    }).join('');
    
    // Update drivers summary
    updateDriversSummary();
    
    // Update count in header
    document.querySelector('.delivery-orders-container h3').textContent = 
        `طلبات التوصيل (${deliveryOrders.length} طلب)`;
}

// ========== UPDATE DRIVERS SUMMARY ==========
function updateDriversSummary() {
    const summaryContainer = document.getElementById('driversSummary');
    
    if (!summaryContainer) return;
    
    const totalDeliveryAmount = getDeliveryOrders().reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    summaryContainer.innerHTML = DRIVERS_LIST.map(driver => {
        const orders = getOrdersByDriver(driver);
        const total = calculateDriverTotal(driver);
        
        return `
            <div class="driver-card">
                <div class="driver-icon">🚗</div>
                <h4>${driver}</h4>
                <div class="driver-stats">
                    <div class="stat">
                        <span class="stat-label">الطلبات</span>
                        <span class="stat-value">${orders.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">المطلوب</span>
                        <span class="stat-value total-amount">${total} دينار</span>
                    </div>
                </div>
            </div>
        `;
    }).join('') + `
        <div class="driver-card total-card">
            <div class="driver-icon">💰</div>
            <h4>المجموع الكلي</h4>
            <div class="driver-stats">
                <div class="stat">
                    <span class="stat-label">الطلبات</span>
                    <span class="stat-value">${getDeliveryOrders().length}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">المجموع</span>
                    <span class="stat-value total-amount">${totalDeliveryAmount} دينار</span>
                </div>
            </div>
        </div>
    `;
}

// ========== FORMAT ORDER ITEMS ==========
function formatOrderItems(items) {
    if (!items || items.length === 0) return '-';
    
    return items.map(item => {
        if (item.meatType === '-') {
            return item.name;
        }
        return `${item.name} (${item.meatType}) - ${item.selectedQuantity} × ${item.quantity}`;
    }).join(', ');
}

// ========== EXPORT DRIVERS REPORT ==========
async function exportDriversReport() {
    const deliveryOrders = getDeliveryOrders();
    
    if (deliveryOrders.length === 0) {
        alert('لا توجد طلبات توصيل لتصديرها');
        return;
    }
    
    const assignments = getDriverAssignments();
    
    // Prepare data for each driver
    const driverReports = DRIVERS_LIST.map(driver => {
        const driverOrders = getOrdersByDriver(driver);
        const driverTotal = calculateDriverTotal(driver);
        
        return {
            driver: driver,
            orders: driverOrders,
            total: driverTotal
        };
    });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create sheet for each driver
    driverReports.forEach(report => {
        if (report.orders.length > 0) {
            const driverData = report.orders.map((order, index) => ({
                'الرقم': index + 1,
                'رقم الطلب': `طلب رقم ${order.serialNumber}`,
                'اسم العميل': order.customerName,
                'التلفون': order.phoneNumber,
                'العنوان': order.deliveryAddress || '-',
                'الطلب': formatOrderItems(order.items),
                'المبلغ': `${order.totalAmount} دينار`
            }));
            
            // Add total row
            driverData.push({
                'الرقم': '',
                'رقم الطلب': '',
                'اسم العميل': '',
                'التلفون': '',
                'العنوان': 'المجموع الكلي:',
                'الطلب': '',
                'المبلغ': `${report.total} دينار`
            });
            
            const ws = XLSX.utils.json_to_sheet(driverData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 8 },   // الرقم
                { wch: 15 },  // رقم الطلب
                { wch: 20 },  // اسم العميل
                { wch: 15 },  // التلفون
                { wch: 35 },  // العنوان
                { wch: 40 },  // الطلب
                { wch: 15 }   // المبلغ
            ];
            
            XLSX.utils.book_append_sheet(wb, ws, report.driver);
        }
    });
    
    // Create summary sheet
    const summaryData = driverReports.map(report => ({
        'السائق': report.driver,
        'عدد الطلبات': report.orders.length,
        'المبلغ المطلوب': `${report.total} دينار`
    }));
    
    // Add total
    const totalOrders = deliveryOrders.length;
    const totalAmount = deliveryOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    summaryData.push({
        'السائق': 'المجموع الكلي',
        'عدد الطلبات': totalOrders,
        'المبلغ المطلوب': `${totalAmount} دينار`
    });
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [
        { wch: 25 },  // السائق
        { wch: 15 },  // عدد الطلبات
        { wch: 20 }   // المبلغ
    ];
    
    // Add summary as first sheet
    XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص السواقين', true);
    
    // Move summary to first position
    const sheets = wb.SheetNames;
    const summaryIndex = sheets.indexOf('ملخص السواقين');
    if (summaryIndex > 0) {
        sheets.splice(summaryIndex, 1);
        sheets.unshift('ملخص السواقين');
    }
    
    // Generate filename
    const date = new Date();
    const filename = `تقرير_السواقين_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    // Show summary
    let message = '✅ تم تصدير تقرير السواقين!\n\n';
    driverReports.forEach(report => {
        if (report.orders.length > 0) {
            message += `🚗 ${report.driver}: ${report.orders.length} طلب (${report.total} دينار)\n`;
        }
    });
    message += `\n💰 المجموع الكلي: ${totalAmount} دينار`;
    
    alert(message);
    
    // Ask if user wants to send to Telegram
    if (confirm('هل تريد إرسال التقرير للتليجرام؟')) {
        sendDriversReportToTelegram(wb, filename, message);
    }
}

// ========== SEND DRIVERS REPORT TO TELEGRAM ==========
async function sendDriversReportToTelegram(workbook, filename, summary) {
    try {
        // Convert workbook to base64
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        
        // Create caption
        const caption = `🚚 تقرير السواقين\n${summary}\n📅 ${new Date().toLocaleString('ar-JO')}`;
        
        // Send to Telegram
        const response = await fetch(TELEGRAM_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upload',
                filename: filename,
                filedata: wbout,
                caption: caption
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ تم إرسال التقرير للتليجرام بنجاح!');
        } else {
            throw new Error(result.error || 'فشل الإرسال');
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        alert('❌ حدث خطأ في إرسال التقرير للتليجرام');
    }
}

// ========== GET RAMADAN ORDERS ==========
function getRamadanOrders() {
    const data = localStorage.getItem('ramadan_orders');
    return data ? JSON.parse(data) : [];
}

