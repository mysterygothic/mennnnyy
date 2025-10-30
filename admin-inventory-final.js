// نظام الجرد اليومي - النسخة النهائية
let purchaseCategories = [];
let charts = { salesPurchases: null, profit: null, distribution: null };

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    const dateInput = document.getElementById('inventoryDate');
    dateInput.value = new Date().toISOString().split('T')[0];
    
    await loadPurchaseCategories();
    await loadInventoryData(dateInput.value);
    initializeCharts();
    await loadInventoryHistory();
    await calculateAverageSales();
    populateMonthSelect();
    
    dateInput.addEventListener('change', async function() {
        await loadInventoryData(this.value);
    });
}

async function loadPurchaseCategories() {
    try {
        if (!window.DB || !window.DB.supabase) {
            console.warn('Database not available, using default categories');
            purchaseCategories = [
                { id: 1, category_name: 'لحوم', display_order: 1 },
                { id: 2, category_name: 'دجاج', display_order: 2 },
                { id: 3, category_name: 'فاين', display_order: 3 },
                { id: 4, category_name: 'خضار', display_order: 4 },
                { id: 5, category_name: 'بندورة', display_order: 5 },
                { id: 6, category_name: 'بطاطا', display_order: 6 },
                { id: 7, category_name: 'بصل', display_order: 7 },
                { id: 8, category_name: 'ثوم', display_order: 8 },
                { id: 9, category_name: 'توابل', display_order: 9 },
                { id: 10, category_name: 'زيت', display_order: 10 },
                { id: 11, category_name: 'أرز', display_order: 11 },
                { id: 12, category_name: 'خبز', display_order: 12 },
                { id: 13, category_name: 'مشروبات', display_order: 13 },
                { id: 14, category_name: 'أخرى', display_order: 14 }
            ];
            renderPurchasesGrid();
            return;
        }
        
        const { data, error } = await window.DB.supabase
            .from('purchase_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) {
            console.error('Error loading categories:', error);
            console.log('Using default categories instead');
            purchaseCategories = [
                { id: 1, category_name: 'لحوم', display_order: 1 },
                { id: 2, category_name: 'دجاج', display_order: 2 },
                { id: 3, category_name: 'فاين', display_order: 3 },
                { id: 4, category_name: 'خضار', display_order: 4 },
                { id: 5, category_name: 'بندورة', display_order: 5 },
                { id: 6, category_name: 'بطاطا', display_order: 6 },
                { id: 7, category_name: 'بصل', display_order: 7 },
                { id: 8, category_name: 'ثوم', display_order: 8 },
                { id: 9, category_name: 'توابل', display_order: 9 },
                { id: 10, category_name: 'زيت', display_order: 10 },
                { id: 11, category_name: 'أرز', display_order: 11 },
                { id: 12, category_name: 'خبز', display_order: 12 },
                { id: 13, category_name: 'مشروبات', display_order: 13 },
                { id: 14, category_name: 'أخرى', display_order: 14 }
            ];
            renderPurchasesGrid();
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('No categories found in database, using defaults');
            purchaseCategories = [
                { id: 1, category_name: 'لحوم', display_order: 1 },
                { id: 2, category_name: 'دجاج', display_order: 2 },
                { id: 3, category_name: 'فاين', display_order: 3 },
                { id: 4, category_name: 'خضار', display_order: 4 },
                { id: 5, category_name: 'بندورة', display_order: 5 },
                { id: 6, category_name: 'بطاطا', display_order: 6 },
                { id: 7, category_name: 'بصل', display_order: 7 },
                { id: 8, category_name: 'ثوم', display_order: 8 },
                { id: 9, category_name: 'توابل', display_order: 9 },
                { id: 10, category_name: 'زيت', display_order: 10 },
                { id: 11, category_name: 'أرز', display_order: 11 },
                { id: 12, category_name: 'خبز', display_order: 12 },
                { id: 13, category_name: 'مشروبات', display_order: 13 },
                { id: 14, category_name: 'أخرى', display_order: 14 }
            ];
        } else {
            purchaseCategories = data;
            console.log('Loaded categories from database:', data.length);
        }
        
        renderPurchasesGrid();
        
    } catch (error) {
        console.error('Error:', error);
        purchaseCategories = [
            { id: 1, category_name: 'لحوم', display_order: 1 },
            { id: 2, category_name: 'دجاج', display_order: 2 },
            { id: 3, category_name: 'فاين', display_order: 3 },
            { id: 4, category_name: 'خضار', display_order: 4 },
            { id: 5, category_name: 'بندورة', display_order: 5 },
            { id: 6, category_name: 'بطاطا', display_order: 6 },
            { id: 7, category_name: 'بصل', display_order: 7 },
            { id: 8, category_name: 'ثوم', display_order: 8 },
            { id: 9, category_name: 'توابل', display_order: 9 },
            { id: 10, category_name: 'زيت', display_order: 10 },
            { id: 11, category_name: 'أرز', display_order: 11 },
            { id: 12, category_name: 'خبز', display_order: 12 },
            { id: 13, category_name: 'مشروبات', display_order: 13 },
            { id: 14, category_name: 'أخرى', display_order: 14 }
        ];
        renderPurchasesGrid();
    }
}

function renderPurchasesGrid() {
    const grid = document.getElementById('purchasesGrid');
    
    if (!grid) {
        console.error('purchasesGrid element not found!');
        return;
    }
    
    grid.innerHTML = '';
    
    console.log('Rendering purchases grid with', purchaseCategories.length, 'categories');
    
    if (purchaseCategories.length === 0) {
        grid.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">لا توجد فئات متاحة</p>';
        return;
    }
    
    purchaseCategories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'purchase-item';
        item.innerHTML = `
            <label>${category.category_name}</label>
            <input type="number" 
                   class="purchase-input" 
                   data-category="${category.category_name}"
                   min="0" 
                   step="0.5" 
                   value="0"
                   placeholder="0.00"
                   onchange="calculateAllTotals()">
        `;
        grid.appendChild(item);
    });
    
    console.log('Grid rendered successfully');
}

async function loadInventoryData(date) {
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .eq('inventory_date', date)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading inventory:', error);
            return;
        }
        
        if (data) {
            document.getElementById('totalSalesInput').value = data.total_sales || 0;
            document.getElementById('totalDamageInput').value = data.total_damage || 0;
            
            const purchases = data.purchase_items || {};
            document.querySelectorAll('.purchase-input').forEach(input => {
                const category = input.dataset.category;
                input.value = purchases[category] || 0;
            });
            
            document.getElementById('inventoryNotes').value = data.notes || '';
        } else {
            clearForm();
        }
        
        calculateAllTotals();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function clearForm() {
    document.getElementById('totalSalesInput').value = 0;
    document.getElementById('totalDamageInput').value = 0;
    document.querySelectorAll('.purchase-input').forEach(input => {
        input.value = 0;
    });
    document.getElementById('inventoryNotes').value = '';
    calculateAllTotals();
}

function calculateAllTotals() {
    const salesTotal = parseFloat(document.getElementById('totalSalesInput').value) || 0;
    const damageTotal = parseFloat(document.getElementById('totalDamageInput').value) || 0;
    
    let purchasesTotal = 0;
    document.querySelectorAll('.purchase-input').forEach(input => {
        purchasesTotal += parseFloat(input.value) || 0;
    });
    
    const netCash = salesTotal - purchasesTotal;
    const netProfit = salesTotal - purchasesTotal - damageTotal;
    
    document.getElementById('purchasesTotal').textContent = purchasesTotal.toFixed(2) + ' د.أ';
    
    document.getElementById('totalSalesDisplay').textContent = salesTotal.toFixed(2) + ' د.أ';
    document.getElementById('totalPurchasesDisplay').textContent = purchasesTotal.toFixed(2) + ' د.أ';
    document.getElementById('totalDamageDisplay').textContent = damageTotal.toFixed(2) + ' د.أ';
    document.getElementById('netCashDisplay').textContent = netCash.toFixed(2) + ' د.أ';
    document.getElementById('netProfitDisplay').textContent = netProfit.toFixed(2) + ' د.أ';
    
    updateDistributionChart(salesTotal, purchasesTotal, damageTotal);
}

async function saveInventory() {
    try {
        const purchaseItems = {};
        document.querySelectorAll('.purchase-input').forEach(input => {
            const category = input.dataset.category;
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                purchaseItems[category] = value;
            }
        });
        
        const totalSales = parseFloat(document.getElementById('totalSalesInput').value) || 0;
        const totalDamage = parseFloat(document.getElementById('totalDamageInput').value) || 0;
        const notes = document.getElementById('inventoryNotes').value.trim();
        const date = document.getElementById('inventoryDate').value;
        
        const currentUser = getCurrentAdmin();
        
        const inventoryData = {
            inventory_date: date,
            total_sales: totalSales,
            purchase_items: purchaseItems,
            total_damage: totalDamage,
            notes: notes,
            created_by: currentUser?.username || 'admin'
        };
        
        if (!window.DB || !window.DB.supabase) {
            alert('⚠️ قاعدة البيانات غير متاحة');
            return;
        }
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .upsert(inventoryData, { onConflict: 'inventory_date' })
            .select();
        
        if (error) {
            console.error('Error saving:', error);
            alert('❌ حدث خطأ: ' + error.message);
            return;
        }
        
        alert('✅ تم حفظ البيانات بنجاح!');
        await loadInventoryHistory();
        await updateCharts();
        await calculateAverageSales();
        await loadMonthlySummary();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ حدث خطأ');
    }
}

async function loadInventoryHistory() {
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .order('inventory_date', { ascending: false })
            .limit(30);
        
        if (error) {
            console.error('Error loading history:', error);
            return;
        }
        
        const tbody = document.getElementById('historyTableBody');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">لا يوجد سجلات</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(record => `
            <tr>
                <td>${new Date(record.inventory_date).toLocaleDateString('ar-JO')}</td>
                <td style="color: #10b981; font-weight: 600;">${record.total_sales.toFixed(2)} د.أ</td>
                <td style="color: #ef4444; font-weight: 600;">${record.total_purchases.toFixed(2)} د.أ</td>
                <td style="color: #f59e0b; font-weight: 600;">${record.total_damage.toFixed(2)} د.أ</td>
                <td style="color: #3b82f6; font-weight: 600;">${record.net_cash.toFixed(2)} د.أ</td>
                <td style="color: #8b5cf6; font-weight: 600;">${record.net_profit.toFixed(2)} د.أ</td>
                <td>
                    <button class="edit-btn" onclick="loadInventoryForDate('${record.inventory_date}')">عرض</button>
                    <button class="delete-btn" onclick="deleteInventory('${record.inventory_date}')">حذف</button>
                </td>
            </tr>
        `).join('');
        
        await updateCharts();
        
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

async function loadInventoryForDate(date) {
    document.getElementById('inventoryDate').value = date;
    await loadInventoryData(date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteInventory(date) {
    if (!confirm('هل أنت متأكد من حذف سجل هذا اليوم؟')) return;
    
    try {
        const { error } = await window.DB.supabase
            .from('daily_inventory')
            .delete()
            .eq('inventory_date', date);
        
        if (error) {
            alert('❌ حدث خطأ أثناء الحذف');
            return;
        }
        
        alert('✅ تم حذف السجل بنجاح');
        await loadInventoryHistory();
        await calculateAverageSales();
        await loadMonthlySummary();
        
    } catch (error) {
        alert('❌ حدث خطأ أثناء الحذف');
    }
}

async function calculateAverageSales() {
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('total_sales, inventory_date')
            .order('inventory_date', { ascending: false });
        
        if (error || !data || data.length === 0) {
            document.getElementById('averageSales').textContent = '0.00 د.أ';
            document.getElementById('averageSubtitle').textContent = 'لا توجد بيانات';
            return;
        }
        
        const totalSales = data.reduce((sum, record) => sum + parseFloat(record.total_sales), 0);
        const average = totalSales / data.length;
        const lastDate = new Date(data[0].inventory_date).toLocaleDateString('ar-JO');
        
        document.getElementById('averageSales').textContent = average.toFixed(2) + ' د.أ';
        document.getElementById('averageSubtitle').textContent = `حتى ${lastDate} (${data.length} يوم)`;
        
    } catch (error) {
        console.error('Error calculating average:', error);
    }
}

function populateMonthSelect() {
    const select = document.getElementById('monthSelect');
    const currentDate = new Date();
    
    select.innerHTML = '<option value="">اختر الشهر</option>';
    
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = `${year}-${String(month).padStart(2, '0')}`;
        option.textContent = monthName;
        select.appendChild(option);
    }
}

async function loadMonthlySummary() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect.value;
    
    if (!selectedMonth) {
        document.getElementById('monthlySales').textContent = '0.00 د.أ';
        document.getElementById('monthlyPurchases').textContent = '0.00 د.أ';
        document.getElementById('monthlyDamage').textContent = '0.00 د.أ';
        document.getElementById('monthlyProfit').textContent = '0.00 د.أ';
        return;
    }
    
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        const [year, month] = selectedMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .gte('inventory_date', startDate)
            .lte('inventory_date', endDate)
            .order('inventory_date', { ascending: true });
        
        if (error || !data || data.length === 0) {
            document.getElementById('monthlySales').textContent = '0.00 د.أ';
            document.getElementById('monthlyPurchases').textContent = '0.00 د.أ';
            document.getElementById('monthlyDamage').textContent = '0.00 د.أ';
            document.getElementById('monthlyProfit').textContent = '0.00 د.أ';
            return;
        }
        
        const totalSales = data.reduce((sum, r) => sum + parseFloat(r.total_sales), 0);
        const totalPurchases = data.reduce((sum, r) => sum + parseFloat(r.total_purchases), 0);
        const totalDamage = data.reduce((sum, r) => sum + parseFloat(r.total_damage), 0);
        const totalProfit = data.reduce((sum, r) => sum + parseFloat(r.net_profit), 0);
        
        document.getElementById('monthlySales').textContent = totalSales.toFixed(2) + ' د.أ';
        document.getElementById('monthlyPurchases').textContent = totalPurchases.toFixed(2) + ' د.أ';
        document.getElementById('monthlyDamage').textContent = totalDamage.toFixed(2) + ' د.أ';
        document.getElementById('monthlyProfit').textContent = totalProfit.toFixed(2) + ' د.أ';
        
    } catch (error) {
        console.error('Error loading monthly summary:', error);
    }
}

function initializeCharts() {
    const ctx1 = document.getElementById('salesPurchasesChart');
    if (ctx1) {
        charts.salesPurchases = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'المبيعات',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: 'المشتريات',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: true, position: 'top' } }
            }
        });
    }
    
    const ctx2 = document.getElementById('profitChart');
    if (ctx2) {
        charts.profit = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'صافي الربح',
                    data: [],
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    const ctx3 = document.getElementById('distributionChart');
    if (ctx3) {
        charts.distribution = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: ['المبيعات', 'المشتريات', 'الإتلاف'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

async function updateCharts() {
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .order('inventory_date', { ascending: false })
            .limit(7);
        
        if (error || !data || data.length === 0) return;
        
        data.reverse();
        
        const labels = data.map(r => new Date(r.inventory_date).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' }));
        const sales = data.map(r => r.total_sales);
        const purchases = data.map(r => r.total_purchases);
        const profits = data.map(r => r.net_profit);
        
        if (charts.salesPurchases) {
            charts.salesPurchases.data.labels = labels;
            charts.salesPurchases.data.datasets[0].data = sales;
            charts.salesPurchases.data.datasets[1].data = purchases;
            charts.salesPurchases.update();
        }
        
        if (charts.profit) {
            charts.profit.data.labels = labels;
            charts.profit.data.datasets[0].data = profits;
            charts.profit.update();
        }
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function updateDistributionChart(sales, purchases, damage) {
    if (charts.distribution) {
        charts.distribution.data.datasets[0].data = [sales, purchases, damage];
        charts.distribution.update();
    }
}

function exportToExcel() {
    const date = document.getElementById('inventoryDate').value;
    const formattedDate = new Date(date).toLocaleDateString('ar-JO');
    
    const salesTotal = document.getElementById('totalSalesInput').value;
    const damageTotal = document.getElementById('totalDamageInput').value;
    
    const purchasesData = [];
    document.querySelectorAll('.purchase-input').forEach(input => {
        const category = input.dataset.category;
        const value = parseFloat(input.value) || 0;
        if (value > 0) {
            purchasesData.push([category, value.toFixed(2)]);
        }
    });
    
    const totalPurchases = document.getElementById('totalPurchasesDisplay').textContent;
    const netCash = document.getElementById('netCashDisplay').textContent;
    const netProfit = document.getElementById('netProfitDisplay').textContent;
    const notes = document.getElementById('inventoryNotes').value;
    
    let csv = '\uFEFF';
    csv += `تقرير الجرد اليومي - ${formattedDate}\n\n`;
    
    csv += 'المبيعات اليومية:\n';
    csv += `إجمالي المبيعات:,${salesTotal} د.أ\n\n`;
    
    csv += 'المشتريات اليومية:\n';
    csv += 'الصنف,السعر\n';
    purchasesData.forEach(row => csv += row.join(',') + ' د.أ\n');
    csv += `المجموع الكلي:,${totalPurchases}\n\n`;
    
    csv += `الإتلاف اليومي:,${damageTotal} د.أ\n\n`;
    
    csv += 'الملخص المالي:\n';
    csv += `الصافي النقدي:,${netCash}\n`;
    csv += `صافي الربح:,${netProfit}\n\n`;
    
    if (notes) {
        csv += `ملاحظات:\n${notes}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${date}.csv`;
    link.click();
    
    alert('✅ تم تصدير الملف بنجاح!');
}

async function exportMonthlyInventory() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect.value;
    
    if (!selectedMonth) {
        alert('⚠️ الرجاء اختيار الشهر أولاً');
        return;
    }
    
    try {
        if (!window.DB || !window.DB.supabase) {
            alert('⚠️ قاعدة البيانات غير متاحة');
            return;
        }
        
        const [year, month] = selectedMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`;
        
        const { data, error } = await window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .gte('inventory_date', startDate)
            .lte('inventory_date', endDate)
            .order('inventory_date', { ascending: true });
        
        if (error) {
            console.error('Error:', error);
            alert('❌ حدث خطأ في تحميل البيانات');
            return;
        }
        
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' });
        
        // تنظيم البيانات حسب التاريخ
        const dataByDate = {};
        if (data) {
            data.forEach(record => {
                const day = new Date(record.inventory_date).getDate();
                dataByDate[day] = record;
            });
        }
        
        // جمع جميع الأصناف
        const allCategories = new Set();
        purchaseCategories.forEach(cat => allCategories.add(cat.category_name));
        allCategories.add('الإتلاف');
        
        let csv = '\uFEFF';
        csv += `الجرد الشهري - ${monthName}\n\n`;
        
        // رأس الجدول
        csv += 'الصنف';
        for (let day = 1; day <= daysInMonth; day++) {
            csv += `,${day}`;
        }
        csv += ',المجموع الشهري\n';
        
        // صفوف المشتريات
        const categoryTotals = {};
        allCategories.forEach(category => {
            csv += category;
            let categoryTotal = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayData = dataByDate[day];
                let value = 0;
                
                if (dayData) {
                    if (category === 'الإتلاف') {
                        value = dayData.total_damage || 0;
                    } else {
                        const purchases = dayData.purchase_items || {};
                        value = purchases[category] || 0;
                    }
                }
                
                csv += `,${value > 0 ? value.toFixed(2) : '-'}`;
                categoryTotal += value;
            }
            
            csv += `,${categoryTotal.toFixed(2)}\n`;
            categoryTotals[category] = categoryTotal;
        });
        
        csv += '\n';
        
        // صف المبيعات اليومية
        csv += 'المبيعات اليومية';
        let totalSales = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = dataByDate[day];
            const sales = dayData ? (dayData.total_sales || 0) : 0;
            csv += `,${sales > 0 ? sales.toFixed(2) : '-'}`;
            totalSales += sales;
        }
        csv += `,${totalSales.toFixed(2)}\n`;
        
        // صف إجمالي المشتريات اليومية
        csv += 'إجمالي المشتريات';
        let totalPurchases = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = dataByDate[day];
            const purchases = dayData ? (dayData.total_purchases || 0) : 0;
            csv += `,${purchases > 0 ? purchases.toFixed(2) : '-'}`;
            totalPurchases += purchases;
        }
        csv += `,${totalPurchases.toFixed(2)}\n`;
        
        // صف الصافي النقدي اليومي
        csv += 'الصافي النقدي';
        let totalNetCash = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = dataByDate[day];
            const netCash = dayData ? (dayData.net_cash || 0) : 0;
            csv += `,${netCash !== 0 ? netCash.toFixed(2) : '-'}`;
            totalNetCash += netCash;
        }
        csv += `,${totalNetCash.toFixed(2)}\n`;
        
        // صف صافي الربح اليومي
        csv += 'صافي الربح';
        let totalProfit = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = dataByDate[day];
            const profit = dayData ? (dayData.net_profit || 0) : 0;
            csv += `,${profit !== 0 ? profit.toFixed(2) : '-'}`;
            totalProfit += profit;
        }
        csv += `,${totalProfit.toFixed(2)}\n`;
        
        csv += '\n';
        
        // الملخص الشهري
        csv += 'الملخص الشهري\n';
        csv += `إجمالي المبيعات الشهرية:,${totalSales.toFixed(2)} د.أ\n`;
        csv += `إجمالي المشتريات الشهرية:,${totalPurchases.toFixed(2)} د.أ\n`;
        csv += `إجمالي الإتلاف الشهري:,${categoryTotals['الإتلاف'].toFixed(2)} د.أ\n`;
        csv += `الصافي النقدي الشهري:,${totalNetCash.toFixed(2)} د.أ\n`;
        csv += `صافي الربح الشهري:,${totalProfit.toFixed(2)} د.أ\n`;
        
        csv += '\n\nتفاصيل المشتريات:\n';
        allCategories.forEach(category => {
            if (category !== 'الإتلاف' && categoryTotals[category] > 0) {
                csv += `${category}:,${categoryTotals[category].toFixed(2)} د.أ\n`;
            }
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `monthly_inventory_${selectedMonth}.csv`;
        link.click();
        
        alert('✅ تم تصدير الجرد الشهري بنجاح!');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ حدث خطأ في التصدير');
    }
}
