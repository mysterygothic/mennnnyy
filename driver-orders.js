// Driver Orders Management - طلبات السائقين والمبالغ النقدية

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('driversOrdersList')) {
        await loadDriverOrders();
    }
});

// ========== LOAD DRIVER ORDERS ==========

async function loadDriverOrders() {
    try {
        // Get all drivers
        const drivers = await window.DB.getDrivers();
        console.log('Drivers loaded:', drivers);
        
        // Get all Ramadan orders
        const allOrders = await window.DB.getRamadanOrders();
        console.log('All orders loaded:', allOrders);
        
        // Filter orders that have a driver assigned AND are delivery type
        const ordersWithDrivers = allOrders.filter(order => {
            const hasDriver = (order.driver_id || order.driverId);
            const isDelivery = (order.deliveryType === 'توصيل' || order.delivery_type === 'توصيل');
            console.log(`Order ${order.id}: hasDriver=${hasDriver}, isDelivery=${isDelivery}, driverId=${order.driver_id || order.driverId}`);
            return hasDriver && isDelivery;
        });
        
        console.log('Orders with drivers:', ordersWithDrivers);
        
        // Group orders by driver
        const driverOrdersMap = {};
        let grandTotal = 0;
        
        ordersWithDrivers.forEach(order => {
            const driverId = order.driver_id || order.driverId;
            if (!driverOrdersMap[driverId]) {
                driverOrdersMap[driverId] = [];
            }
            driverOrdersMap[driverId].push(order);
            const cashAmount = parseFloat(order.cash_amount || order.cashAmount || order.totalAmount || 0);
            grandTotal += cashAmount;
            console.log(`Added order to driver ${driverId}, cash amount: ${cashAmount}`);
        });
        
        console.log('Driver orders map:', driverOrdersMap);
        console.log('Grand total:', grandTotal);
        
        // Render
        renderDriverOrders(drivers, driverOrdersMap, grandTotal);
        
    } catch (error) {
        console.error('Error loading driver orders:', error);
        document.getElementById('driversOrdersList').innerHTML = 
            '<p class="no-orders">حدث خطأ في تحميل البيانات</p>';
    }
}

function renderDriverOrders(drivers, driverOrdersMap, grandTotal) {
    const container = document.getElementById('driversOrdersList');
    const grandTotalEl = document.getElementById('grandTotal');
    
    // Update grand total
    grandTotalEl.textContent = `${grandTotal.toFixed(2)} دينار`;
    
    // Filter drivers that have orders
    const driversWithOrders = drivers.filter(driver => driverOrdersMap[driver.id]);
    
    if (driversWithOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">لا توجد طلبات مُعيّنة لأي سائق</p>';
        return;
    }
    
    // Render each driver's section
    container.innerHTML = driversWithOrders.map(driver => {
        const orders = driverOrdersMap[driver.id] || [];
        const driverTotal = orders.reduce((sum, order) => 
            sum + parseFloat(order.cash_amount || order.cashAmount || order.totalAmount || 0), 0
        );
        
        return `
            <div class="driver-section">
                <div class="driver-header">
                    <div class="driver-info">
                        <h3>🚗 ${driver.name}</h3>
                        <p>${driver.phone_number || driver.phoneNumber || 'لا يوجد رقم'} | ${driver.vehicle_type || driver.vehicleType || 'سيارة'} - ${driver.vehicle_plate || driver.vehiclePlate || '-'}</p>
                    </div>
                    <div class="driver-summary">
                        <p class="total-amount">${driverTotal.toFixed(2)} دينار</p>
                        <p class="orders-count">${orders.length} طلب</p>
                    </div>
                </div>
                
                <table class="driver-orders-table">
                    <thead>
                        <tr>
                            <th>رقم الطلب</th>
                            <th>اسم العميل</th>
                            <th>رقم التلفون</th>
                            <th>عنوان التوصيل</th>
                            <th>الأصناف</th>
                            <th>المبلغ المطلوب</th>
                            <th>الحالة</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td><strong>طلب رقم ${order.serialNumber}</strong></td>
                                <td>${order.customerName}</td>
                                <td>${order.phoneNumber}</td>
                                <td>${order.deliveryAddress || '-'}</td>
                                <td>${formatOrderItems(order.items)}</td>
                                <td><strong style="color: #27ae60;">${(order.cash_amount || order.cashAmount || order.totalAmount || 0).toFixed(2)} دينار</strong></td>
                                <td><span class="status-badge status-${order.delivery_status || order.deliveryStatus || 'assigned'}">${getStatusText(order.delivery_status || order.deliveryStatus)}</span></td>
                                <td>${order.delivery_notes || order.deliveryNotes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

// Format order items
function formatOrderItems(items) {
    if (!items || items.length === 0) return '-';
    
    return items.map(item => {
        if (item.meatType === '-') {
            return item.name;
        }
        return `${item.name} (${item.meatType})`;
    }).join(', ');
}

// Get status text
function getStatusText(status) {
    switch(status) {
        case 'assigned': return 'مُعيّن';
        case 'in_progress': return 'قيد التوصيل';
        case 'delivered': return 'تم التوصيل';
        case 'pending': return 'قيد الانتظار';
        default: return 'مُعيّن';
    }
}

// ========== EXPORT TO EXCEL ==========

async function exportDriversReport() {
    try {
        // Get all data
        const drivers = await window.DB.getDrivers();
        const allOrders = await window.DB.getRamadanOrders();
        
        // Filter orders with drivers
        const ordersWithDrivers = allOrders.filter(order => 
            (order.driver_id || order.driverId) && 
            (order.deliveryType === 'توصيل')
        );
        
        // Group by driver
        const driverOrdersMap = {};
        ordersWithDrivers.forEach(order => {
            const driverId = order.driver_id || order.driverId;
            if (!driverOrdersMap[driverId]) {
                driverOrdersMap[driverId] = [];
            }
            driverOrdersMap[driverId].push(order);
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Summary by Driver
        const summaryData = [
            ['تقرير طلبات السائقين والمبالغ النقدية'],
            ['مطعم ومطبخ الشيخ'],
            ['التاريخ: ' + new Date().toLocaleDateString('ar-JO')],
            [],
            ['اسم السائق', 'رقم التلفون', 'عدد الطلبات', 'إجمالي المبالغ (دينار)']
        ];
        
        let grandTotal = 0;
        drivers.forEach(driver => {
            const orders = driverOrdersMap[driver.id] || [];
            if (orders.length > 0) {
                const driverTotal = orders.reduce((sum, order) => 
                    sum + parseFloat(order.cash_amount || order.cashAmount || order.totalAmount || 0), 0
                );
                grandTotal += driverTotal;
                
                summaryData.push([
                    driver.name,
                    driver.phone_number || driver.phoneNumber || '-',
                    orders.length,
                    driverTotal.toFixed(2)
                ]);
            }
        });
        
        summaryData.push([]);
        summaryData.push(['إجمالي المبالغ النقدية:', '', '', grandTotal.toFixed(2) + ' دينار']);
        
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'ملخص السائقين');
        
        // Sheet 2: Detailed Orders
        const detailedData = [
            ['السائق', 'رقم الطلب', 'اسم العميل', 'رقم التلفون', 'عنوان التوصيل', 'الأصناف', 'المبلغ (دينار)', 'الحالة', 'ملاحظات', 'التاريخ']
        ];
        
        drivers.forEach(driver => {
            const orders = driverOrdersMap[driver.id] || [];
            orders.forEach(order => {
                detailedData.push([
                    driver.name,
                    'طلب رقم ' + order.serialNumber,
                    order.customerName,
                    order.phoneNumber,
                    order.deliveryAddress || '-',
                    formatOrderItems(order.items),
                    (order.cash_amount || order.cashAmount || order.totalAmount || 0).toFixed(2),
                    getStatusText(order.delivery_status || order.deliveryStatus),
                    order.delivery_notes || order.deliveryNotes || '-',
                    new Date(order.date).toLocaleDateString('ar-JO')
                ]);
            });
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(wb, ws2, 'تفاصيل الطلبات');
        
        // Download
        const fileName = `تقرير_السائقين_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        alert('✅ تم تصدير التقرير بنجاح!');
        
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('❌ حدث خطأ في التصدير');
    }
}

