// Customers Management
let allCustomers = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('customersTableBody')) {
        await loadCustomers();
    }
});

async function loadCustomers() {
    try {
        allCustomers = await window.DB.getCustomers();
        renderCustomersTable(allCustomers);
        updateCustomerStats();
    } catch (error) {
        console.error('Error loading customers:', error);
        allCustomers = [];
        renderCustomersTable([]);
    }
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">لا يوجد زبائن</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map((customer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${customer.customer_name || customer.customerName}</strong></td>
            <td>${customer.phone_number || customer.phoneNumber}</td>
            <td>${customer.delivery_address || customer.deliveryAddress || '-'}</td>
            <td>${customer.order_count || customer.orderCount || 0}</td>
            <td><strong style="color: #27ae60;">${(customer.total_spent || customer.totalSpent || 0).toFixed(2)} دينار</strong></td>
            <td>${formatDate(customer.last_order_date || customer.lastOrderDate)}</td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-JO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateCustomerStats() {
    const totalCustomers = allCustomers.length;
    const totalOrders = allCustomers.reduce((sum, c) => sum + (c.order_count || c.orderCount || 0), 0);
    const totalSales = allCustomers.reduce((sum, c) => sum + parseFloat(c.total_spent || c.totalSpent || 0), 0);
    
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSales').textContent = totalSales.toFixed(2) + ' دينار';
}

function searchCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    
    if (!searchTerm) {
        renderCustomersTable(allCustomers);
        return;
    }
    
    const filtered = allCustomers.filter(customer => {
        const name = (customer.customer_name || customer.customerName || '').toLowerCase();
        const phone = (customer.phone_number || customer.phoneNumber || '').toLowerCase();
        
        return name.includes(searchTerm) || phone.includes(searchTerm);
    });
    
    renderCustomersTable(filtered);
}

function clearCustomerSearch() {
    document.getElementById('searchCustomers').value = '';
    renderCustomersTable(allCustomers);
}

async function exportCustomers() {
    try {
        const data = [
            ['قاعدة بيانات الزبائن'],
            ['مطعم ومطبخ الشيخ'],
            ['التاريخ: ' + new Date().toLocaleDateString('ar-JO')],
            [],
            ['الرقم', 'اسم الزبون', 'رقم التلفون', 'العنوان', 'عدد الطلبات', 'إجمالي المشتريات (دينار)', 'تاريخ أول طلب', 'تاريخ آخر طلب']
        ];
        
        allCustomers.forEach((customer, index) => {
            data.push([
                index + 1,
                customer.customer_name || customer.customerName,
                customer.phone_number || customer.phoneNumber,
                customer.delivery_address || customer.deliveryAddress || '-',
                customer.order_count || customer.orderCount || 0,
                (customer.total_spent || customer.totalSpent || 0).toFixed(2),
                formatDate(customer.first_order_date || customer.firstOrderDate),
                formatDate(customer.last_order_date || customer.lastOrderDate)
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'قاعدة بيانات الزبائن');
        
        const fileName = `قاعدة_بيانات_الزبائن_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        alert('✅ تم تصدير قاعدة البيانات بنجاح!');
    } catch (error) {
        console.error('Error exporting customers:', error);
        alert('❌ حدث خطأ في التصدير');
    }
}
