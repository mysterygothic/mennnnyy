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
    populateChartMonthSelect();
    
    dateInput.addEventListener('change', async function() {
        await loadInventoryData(this.value);
    });
}

async function loadPurchaseCategories() {
    try {
        // التحقق من أن Supabase جاهز
        if (!window.DB || !window.DB.supabase) {
            console.warn('⚠️ Supabase not ready yet, retrying...');
            // إعادة المحاولة بعد ثانية
            setTimeout(loadPurchaseCategories, 1000);
            return;
        }
        
        console.log('📦 Loading purchase categories...');
        
        const { data, error } = await window.DB.supabase
            .from('expense_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) {
            console.error('❌ Error loading categories:', error);
            throw error;
        }
        
        purchaseCategories = data || [];
        console.log(`✅ Loaded ${purchaseCategories.length} categories`);
        renderExpensesList();
        
    } catch (error) {
        console.error('❌ Error in loadPurchaseCategories:', error);
        purchaseCategories = [];
        renderExpensesList();
    }
}

function renderExpensesList() {
    const list = document.getElementById('expensesList');
    if (!list) return;
    
    // إذا لم تكن هناك فئات، أظهر رسالة تحميل
    if (purchaseCategories.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">⏳ جاري تحميل الفئات...</p>
                <small>إذا استمرت المشكلة، تحقق من اتصال قاعدة البيانات</small>
            </div>
        `;
        return;
    }
    
    const grouped = {};
    purchaseCategories.forEach(item => {
        if (!grouped[item.main_category]) grouped[item.main_category] = {};
        if (!grouped[item.main_category][item.sub_category]) grouped[item.main_category][item.sub_category] = [];
        grouped[item.main_category][item.sub_category].push(item);
    });
    
    list.innerHTML = '';
    Object.entries(grouped).forEach(([mainCat, subCats]) => {
        const catGroup = document.createElement('div');
        catGroup.className = 'expense-category-group';
        catGroup.innerHTML = `<div class="category-header" onclick="toggleCategory(this)"><span>${mainCat}</span><span class="toggle-icon">▼</span></div>`;
        
        Object.entries(subCats).forEach(([subCat, items]) => {
            const subGroup = document.createElement('div');
            subGroup.className = 'subcategory-group';
            subGroup.innerHTML = `<div class="subcategory-header">${subCat || 'عام'}</div><div class="expense-items"></div>`;
            
            const itemsContainer = subGroup.querySelector('.expense-items');
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'expense-item';
                itemDiv.innerHTML = `<label>${item.item_name}</label><input type="number" class="expense-input" data-item="${item.item_name}" min="0" step="0.5" placeholder="0" onchange="calculateAllTotals()">`;
                itemsContainer.appendChild(itemDiv);
            });
            
            catGroup.appendChild(subGroup);
        });
        
        list.appendChild(catGroup);
    });
}

function toggleCategory(header) {
    header.classList.toggle('collapsed');
    const group = header.parentElement;
    const subgroups = group.querySelectorAll('.subcategory-group');
    subgroups.forEach(sg => sg.style.display = header.classList.contains('collapsed') ? 'none' : 'block');
}

function filterItems() {
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    // إذا كان البحث فارغاً، أظهر كل شيء
    if (!search) {
        // إظهار جميع العناصر
        document.querySelectorAll('.expense-item').forEach(item => {
            item.style.display = 'flex';
        });
        
        // إظهار جميع الفئات الفرعية
        document.querySelectorAll('.subcategory-group').forEach(group => {
            group.style.display = 'block';
        });
        
        // إظهار جميع الفئات الرئيسية
        document.querySelectorAll('.expense-category-group').forEach(group => {
            group.style.display = 'block';
            const header = group.querySelector('.category-header');
            if (header) {
                header.classList.remove('collapsed');
            }
        });
        
        // إخفاء رسالة "لا توجد نتائج"
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        return;
    }
    
    // البحث في العناصر
    let totalVisibleItems = 0;
    
    document.querySelectorAll('.expense-category-group').forEach(categoryGroup => {
        let categoryHasVisibleItems = false;
        
        // فحص كل فئة فرعية
        categoryGroup.querySelectorAll('.subcategory-group').forEach(subGroup => {
            let subGroupHasVisibleItems = false;
            
            // فحص كل عنصر في الفئة الفرعية
            subGroup.querySelectorAll('.expense-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                const matches = text.includes(search);
                
                item.style.display = matches ? 'flex' : 'none';
                
                if (matches) {
                    subGroupHasVisibleItems = true;
                    categoryHasVisibleItems = true;
                    totalVisibleItems++;
                }
            });
            
            // إخفاء أو إظهار الفئة الفرعية بناءً على وجود عناصر مرئية
            subGroup.style.display = subGroupHasVisibleItems ? 'block' : 'none';
        });
        
        // إخفاء أو إظهار الفئة الرئيسية بناءً على وجود عناصر مرئية
        if (categoryHasVisibleItems) {
            categoryGroup.style.display = 'block';
            // فتح الفئة تلقائياً عند البحث
            const header = categoryGroup.querySelector('.category-header');
            if (header) {
                header.classList.remove('collapsed');
            }
        } else {
            categoryGroup.style.display = 'none';
        }
    });
    
    // إظهار أو إخفاء رسالة "لا توجد نتائج"
    if (noResultsMessage) {
        noResultsMessage.style.display = totalVisibleItems === 0 ? 'block' : 'none';
    }
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
            document.getElementById('totalSalesInput').value = data.total_sales || '';
            
            const purchases = data.purchase_items || {};
            document.querySelectorAll('.expense-input').forEach(input => {
                const item = input.dataset.item;
                const value = purchases[item];
                input.value = value > 0 ? value : '';
            });
            
            if (document.getElementById('inventoryNotes')) {
                document.getElementById('inventoryNotes').value = data.notes || '';
            }
        } else {
            clearForm();
        }
        
        calculateAllTotals();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function clearForm() {
    document.getElementById('totalSalesInput').value = '';
    document.querySelectorAll('.expense-input').forEach(input => {
        input.value = '';
    });
    if (document.getElementById('inventoryNotes')) {
        document.getElementById('inventoryNotes').value = '';
    }
    calculateAllTotals();
}

function calculateAllTotals() {
    const salesTotal = parseFloat(document.getElementById('totalSalesInput').value) || 0;
    
    let purchasesTotal = 0;
    let damageTotal = 0;
    let salariesTotal = 0;
    
    document.querySelectorAll('.expense-input').forEach(input => {
        const value = parseFloat(input.value) || 0;
        const item = input.dataset.item;
        
        // حساب الإتلاف
        if (item && (item.includes('تلف') || item.includes('صلاحية') || item.includes('بواقي') || item.includes('مرتجعات'))) {
            damageTotal += value;
        }
        
        // حساب الرواتب
        if (item && (item.includes('راتب') || item.includes('رواتب') || item.includes('أجور') || item.includes('موظف'))) {
            salariesTotal += value;
        }
        
        purchasesTotal += value;
    });
    
    const netCash = salesTotal - purchasesTotal;
    const netProfit = salesTotal - purchasesTotal;
    
    document.getElementById('purchasesTotal').textContent = purchasesTotal.toFixed(2) + ' د.أ';
    
    if (document.getElementById('totalSalesDisplay')) {
        document.getElementById('totalSalesDisplay').textContent = salesTotal.toFixed(2) + ' د.أ';
        document.getElementById('totalPurchasesDisplay').textContent = purchasesTotal.toFixed(2) + ' د.أ';
        document.getElementById('totalDamageDisplay').textContent = damageTotal.toFixed(2) + ' د.أ';
        document.getElementById('totalSalariesDisplay').textContent = salariesTotal.toFixed(2) + ' د.أ';
        document.getElementById('netCashDisplay').textContent = netCash.toFixed(2) + ' د.أ';
        document.getElementById('netProfitDisplay').textContent = netProfit.toFixed(2) + ' د.أ';
    }
    
    updateDistributionChart(salesTotal, purchasesTotal, damageTotal, salariesTotal);
}

async function saveInventory() {
    try {
        const purchaseItems = {};
        let totalDamage = 0;
        let totalSalaries = 0;
        
        document.querySelectorAll('.expense-input').forEach(input => {
            const item = input.dataset.item;
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                purchaseItems[item] = value;
                
                // حساب الإتلاف
                if (item && (item.includes('تلف') || item.includes('صلاحية') || item.includes('بواقي') || item.includes('مرتجعات'))) {
                    totalDamage += value;
                }
                
                // حساب الرواتب
                if (item && (item.includes('راتب') || item.includes('رواتب') || item.includes('أجور') || item.includes('موظف'))) {
                    totalSalaries += value;
                }
            }
        });
        
        const totalSales = parseFloat(document.getElementById('totalSalesInput').value) || 0;
        const notes = document.getElementById('inventoryNotes').value.trim();
        const date = document.getElementById('inventoryDate').value;
        
        const currentUser = getCurrentAdmin();
        
        const inventoryData = {
            inventory_date: date,
            total_sales: totalSales,
            purchase_items: purchaseItems,
            total_damage: totalDamage,
            total_salaries: totalSalaries,
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
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">لا يوجد سجلات</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(record => `
            <tr>
                <td>${new Date(record.inventory_date).toLocaleDateString('ar-JO')}</td>
                <td style="color: #10b981; font-weight: 600;">${record.total_sales.toFixed(2)} د.أ</td>
                <td style="color: #ef4444; font-weight: 600;">${record.total_purchases.toFixed(2)} د.أ</td>
                <td style="color: #f59e0b; font-weight: 600;">${(record.total_damage || 0).toFixed(2)} د.أ</td>
                <td style="color: #6366f1; font-weight: 600;">${(record.total_salaries || 0).toFixed(2)} د.أ</td>
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
        document.getElementById('monthlySalaries').textContent = '0.00 د.أ';
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
            document.getElementById('monthlySalaries').textContent = '0.00 د.أ';
            document.getElementById('monthlyProfit').textContent = '0.00 د.أ';
            return;
        }
        
        const totalSales = data.reduce((sum, r) => sum + parseFloat(r.total_sales), 0);
        const totalPurchases = data.reduce((sum, r) => sum + parseFloat(r.total_purchases), 0);
        const totalDamage = data.reduce((sum, r) => sum + parseFloat(r.total_damage || 0), 0);
        const totalSalaries = data.reduce((sum, r) => sum + parseFloat(r.total_salaries || 0), 0);
        const totalProfit = data.reduce((sum, r) => sum + parseFloat(r.net_profit), 0);
        
        document.getElementById('monthlySales').textContent = totalSales.toFixed(2) + ' د.أ';
        document.getElementById('monthlyPurchases').textContent = totalPurchases.toFixed(2) + ' د.أ';
        document.getElementById('monthlyDamage').textContent = totalDamage.toFixed(2) + ' د.أ';
        document.getElementById('monthlySalaries').textContent = totalSalaries.toFixed(2) + ' د.أ';
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
                labels: ['المبيعات', 'المشتريات', 'الإتلاف', 'الرواتب'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1']
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

async function updateCharts(period = 'last7', selectedMonth = null) {
    try {
        if (!window.DB || !window.DB.supabase) return;
        
        let query = window.DB.supabase
            .from('daily_inventory')
            .select('*')
            .order('inventory_date', { ascending: true });
        
        // تحديد الفترة الزمنية
        if (period === 'last7') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query = query.gte('inventory_date', sevenDaysAgo.toISOString().split('T')[0]);
        } else if (period === 'last30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query = query.gte('inventory_date', thirtyDaysAgo.toISOString().split('T')[0]);
        } else if (period === 'month' && selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            const startDate = `${year}-${month}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
            query = query.gte('inventory_date', startDate).lte('inventory_date', endDate);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error loading chart data:', error);
            return;
        }
        
        if (!data || data.length === 0) {
            // مسح الرسوم البيانية إذا لم تكن هناك بيانات
            if (charts.salesPurchases) {
                charts.salesPurchases.data.labels = [];
                charts.salesPurchases.data.datasets[0].data = [];
                charts.salesPurchases.data.datasets[1].data = [];
                charts.salesPurchases.update();
            }
            if (charts.profit) {
                charts.profit.data.labels = [];
                charts.profit.data.datasets[0].data = [];
                charts.profit.update();
            }
            return;
        }
        
        const labels = data.map(r => new Date(r.inventory_date).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' }));
        const sales = data.map(r => parseFloat(r.total_sales) || 0);
        const purchases = data.map(r => parseFloat(r.total_purchases) || 0);
        const profits = data.map(r => parseFloat(r.net_profit) || 0);
        
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
        
        // تحديث عناوين الرسوم البيانية
        updateChartTitles(period, selectedMonth);
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function updateChartTitles(period, selectedMonth) {
    const salesChartTitle = document.querySelector('.chart-container:nth-child(1) h3');
    const profitChartTitle = document.querySelector('.chart-container:nth-child(2) h3');
    
    let periodText = '';
    if (period === 'last7') {
        periodText = 'آخر 7 أيام';
    } else if (period === 'last30') {
        periodText = 'آخر 30 يوم';
    } else if (period === 'month' && selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        periodText = `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    if (salesChartTitle) {
        salesChartTitle.textContent = `المبيعات vs المشتريات (${periodText})`;
    }
    if (profitChartTitle) {
        profitChartTitle.textContent = `صافي الربح (${periodText})`;
    }
}

function populateChartMonthSelect() {
    const select = document.getElementById('chartMonthSelect');
    if (!select) return;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    select.innerHTML = '<option value="">اختر الشهر</option>';
    
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // إضافة آخر 12 شهر
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = month.toString().padStart(2, '0');
        const value = `${year}-${monthStr}`;
        const label = `${monthNames[date.getMonth()]} ${year}`;
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    }
}

function updateChartsByPeriod() {
    const periodSelect = document.getElementById('chartPeriodSelect');
    const monthSelect = document.getElementById('chartMonthSelect');
    const period = periodSelect.value;
    
    if (period === 'month') {
        monthSelect.style.display = 'inline-block';
        if (monthSelect.value) {
            updateCharts('month', monthSelect.value);
        }
    } else {
        monthSelect.style.display = 'none';
        updateCharts(period);
    }
}

function updateChartsByMonth() {
    const monthSelect = document.getElementById('chartMonthSelect');
    const selectedMonth = monthSelect.value;
    
    if (selectedMonth) {
        updateCharts('month', selectedMonth);
    }
}

function updateDistributionChart(sales, purchases, damage, salaries) {
    if (charts.distribution) {
        charts.distribution.data.datasets[0].data = [sales, purchases, damage, salaries || 0];
        charts.distribution.update();
    }
}

function exportToExcel() {
    const date = document.getElementById('inventoryDate').value;
    const formattedDate = new Date(date).toLocaleDateString('ar-JO');
    
    const salesTotal = parseFloat(document.getElementById('totalSalesInput').value) || 0;
    
    const expensesData = [];
    let totalExpenses = 0;
    let totalDamage = 0;
    
    document.querySelectorAll('.expense-input').forEach(input => {
        const item = input.dataset.item;
        const value = parseFloat(input.value) || 0;
        if (value > 0) {
            expensesData.push([item, value.toFixed(2)]);
            totalExpenses += value;
            
            if (item && (item.includes('تلف') || item.includes('صلاحية') || item.includes('بواقي') || item.includes('مرتجعات'))) {
                totalDamage += value;
            }
        }
    });
    
    const netCash = salesTotal - totalExpenses;
    const netProfit = salesTotal - totalExpenses;
    const notes = document.getElementById('inventoryNotes') ? document.getElementById('inventoryNotes').value : '';
    
    let csv = '\uFEFF';
    csv += `تقرير الجرد اليومي - ${formattedDate}\n\n`;
    
    csv += 'المبيعات اليومية:\n';
    csv += `إجمالي المبيعات:,${salesTotal.toFixed(2)} د.أ\n\n`;
    
    csv += 'المشتريات والمصاريف:\n';
    csv += 'الصنف,المبلغ\n';
    expensesData.forEach(row => csv += row.join(',') + ' د.أ\n');
    csv += `المجموع الكلي:,${totalExpenses.toFixed(2)} د.أ\n\n`;
    
    csv += `إجمالي الإتلاف:,${totalDamage.toFixed(2)} د.أ\n\n`;
    
    csv += 'الملخص المالي:\n';
    csv += `الصافي النقدي:,${netCash.toFixed(2)} د.أ\n`;
    csv += `صافي الربح:,${netProfit.toFixed(2)} د.أ\n\n`;
    
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
        
        // جمع جميع الأصناف من البيانات الفعلية
        const allItems = new Set();
        if (data) {
            data.forEach(record => {
                const purchases = record.purchase_items || {};
                Object.keys(purchases).forEach(item => allItems.add(item));
            });
        }
        
        const itemsArray = Array.from(allItems).sort();
        
        let csv = '\uFEFF';
        csv += `الجرد الشهري - ${monthName}\n\n`;
        
        // رأس الجدول
        csv += 'الصنف';
        for (let day = 1; day <= daysInMonth; day++) {
            csv += `,${day}`;
        }
        csv += ',المجموع الشهري\n';
        
        // صفوف المشتريات والمصاريف
        const itemTotals = {};
        itemsArray.forEach(item => {
            csv += `"${item}"`;
            let itemTotal = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayData = dataByDate[day];
                let value = 0;
                
                if (dayData) {
                    const purchases = dayData.purchase_items || {};
                    value = purchases[item] || 0;
                }
                
                csv += `,${value > 0 ? value.toFixed(2) : ''}`;
                itemTotal += value;
            }
            
            csv += `,${itemTotal.toFixed(2)}\n`;
            itemTotals[item] = itemTotal;
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
        csv += `إجمالي المشتريات والمصاريف:,${totalPurchases.toFixed(2)} د.أ\n`;
        csv += `الصافي النقدي الشهري:,${totalNetCash.toFixed(2)} د.أ\n`;
        csv += `صافي الربح الشهري:,${totalProfit.toFixed(2)} د.أ\n`;
        
        csv += '\n\nتفاصيل المشتريات والمصاريف:\n';
        csv += 'الصنف,المجموع الشهري\n';
        itemsArray.forEach(item => {
            if (itemTotals[item] > 0) {
                csv += `"${item}",${itemTotals[item].toFixed(2)} د.أ\n`;
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
