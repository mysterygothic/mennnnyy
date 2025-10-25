// Ramadan Orders Management
let ramadanCart = [];
let currentRamadanFilter = 'all';
let deleteOrderId = null;
let editOrderId = null;
let quickEntrySessionCount = 0;
let allOrders = []; // For search functionality

// Telegram Configuration (using Cloudflare Worker)
const TELEGRAM_WORKER_URL = 'https://mataamshiekh-ramadan.zlmsn3mk.workers.dev'; // Your worker URL

// Get Ramadan orders from database (with localStorage fallback)
async function getRamadanOrders() {
    if (window.DB && window.DB.getRamadanOrders) {
        return await window.DB.getRamadanOrders();
    }
    // Fallback to localStorage
    const data = localStorage.getItem(STORAGE_KEYS.RAMADAN_ORDERS);
    return data ? JSON.parse(data) : [];
}

// Save Ramadan orders to database (with localStorage cache)
async function saveRamadanOrders(orders) {
    // Save to localStorage as cache
    localStorage.setItem(STORAGE_KEYS.RAMADAN_ORDERS, JSON.stringify(orders));
    
    // Save to database if available
    if (window.DB && window.DB.saveRamadanOrders) {
        await window.DB.saveRamadanOrders(orders);
    }
}

function normalizePhone(phone) {
    if (!phone) return '';
    let p = String(phone).trim();
    p = p.replace(/\s|-/g, '');
    if (p.startsWith('+962')) {
        p = p.substring(4);
    }
    if (p.startsWith('0')) {
        p = p.substring(1);
    }
    return p;
}

// Initialize Ramadan page
document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('ramadanOrdersTable')) {
        await loadRamadanOrders();
        await updateRamadanStats();
    }
});

// Load Ramadan orders table
async function loadRamadanOrders(ordersToDisplay = null) {
    const orders = ordersToDisplay || await getRamadanOrders();
    allOrders = await getRamadanOrders(); // Store all orders for search
    const tbody = document.getElementById('ramadanOrdersBody');
    
    const phoneCounts = {};
    orders.forEach(o => {
        const p = normalizePhone(o.phoneNumber || '');
        if (!p) return;
        phoneCounts[p] = (phoneCounts[p] || 0) + 1;
    });
    const duplicatePhones = new Set(Object.keys(phoneCounts).filter(p => phoneCounts[p] > 1));
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state">لا توجد طلبات</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td>طلب رقم ${order.serialNumber}</td>
            <td>${order.customerName}</td>
            <td>${formatOrderItems(order.items)}</td>
            <td><strong>${order.totalAmount} دينار</strong></td>
            <td>${duplicatePhones.has(normalizePhone(order.phoneNumber)) ? `<span class="badge badge-duplicate" title="رقم مكرر">${order.phoneNumber}</span>` : order.phoneNumber}</td>
            <td><span class="badge ${order.deliveryType === 'توصيل' ? 'badge-delivery' : 'badge-pickup'}">${order.deliveryType}</span></td>
            <td>${order.deliveryType === 'توصيل' ? (order.deliveryAddress || '-') : '-'}</td>
            <td>${order.otherDetails || '-'}</td>
            <td>${formatDate(order.date)}</td>
            <td>
                <button class="action-btn edit-order-btn" onclick="openEditOrderModal(${order.id})" title="تعديل">✏️</button>
                <button class="action-btn view-btn" onclick="viewOrder(${order.id})" title="عرض">👁️</button>
                <button class="action-btn delete-order-btn" onclick="openDeleteOrderModal(${order.id})" title="حذف">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Format order items for display
function formatOrderItems(items) {
    if (!items || items.length === 0) return '-';
    
    return items.map(item => {
        // إذا كان طلب سريع (meatType = '-')
        if (item.meatType === '-') {
            // اعرض فقط اسم الطلب كما كتبه المستخدم
            return item.name;
        }
        // إذا كان طلب من المنيو العادي
        return `${item.name} (${item.meatType}) - ${item.selectedQuantity} × ${item.quantity}`;
    }).join('<br>');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-JO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update Ramadan statistics
async function updateRamadanStats() {
    const orders = await getRamadanOrders();
    
    // Total orders
    document.getElementById('totalOrders').textContent = orders.length;
    
    // Delivery orders revenue
    const deliveryOrders = orders.filter(order => order.deliveryType === 'توصيل');
    const deliveryRevenue = deliveryOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    document.getElementById('deliveryRevenue').textContent = `${deliveryRevenue} دينار`;
    
    // Today's orders
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.date).toDateString() === today
    );
    document.getElementById('todayOrders').textContent = todayOrders.length;
    
    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    document.getElementById('totalRevenue').textContent = `${totalRevenue} دينار`;
}

// Show Ramadan order form
async function showRamadanOrderForm() {
    const formSection = document.getElementById('ramadanOrderFormSection');
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth' });
    
    // Load menu items for ordering
    await loadRamadanFoodItems();
}

// Hide Ramadan order form
function hideRamadanOrderForm() {
    const formSection = document.getElementById('ramadanOrderFormSection');
    formSection.style.display = 'none';
    
    // Clear cart
    ramadanCart = [];
    updateRamadanCartDisplay();
    
    // Reset form
    document.getElementById('ramadanCustomerForm').reset();
}

// Load food items for Ramadan ordering
async function loadRamadanFoodItems() {
    const menuData = await getMenuData();
    const categories = await getCategories();
    const grid = document.getElementById('ramadanFoodItems');
    const categoryButtons = document.getElementById('ramadanCategoryButtons');
    
    // Update category buttons
    if (categoryButtons) {
        categoryButtons.innerHTML = categories.map(cat => 
            `<button class="category-btn ${currentRamadanFilter === cat.value ? 'active' : ''}" onclick="filterRamadanCategory('${cat.value}')">${cat.name}</button>`
        ).join('');
    }
    
    const filteredItems = currentRamadanFilter === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentRamadanFilter);
    
    grid.innerHTML = filteredItems.map(item => `
        <div class="food-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="food-item-image" loading="lazy">
            <div class="food-item-content">
                <h3 class="food-item-name">${item.name}</h3>
                <p class="food-item-description">${item.description}</p>
                <div class="food-item-price">من ${item.basePrice} دينار</div>
                
                <div class="meat-selection">
                    <label>نوع السدر:</label>
                    <div class="meat-options">
                        <button class="meat-btn active" data-type="دجاج" onclick="selectRamadanMeatType(${item.id}, 'دجاج')">دجاج</button>
                        <button class="meat-btn" data-type="لحم" onclick="selectRamadanMeatType(${item.id}, 'لحم')">لحم</button>
                    </div>
                </div>
                
                <div class="quantity-selection">
                    <label for="ramadan-quantity-${item.id}">اختر الكمية:</label>
                    <select id="ramadan-quantity-${item.id}" onchange="updateRamadanItemQuantity(${item.id})">
                        <option value="">اختر الكمية</option>
                        ${item.quantityOptions.map(option => 
                            `<option value="${option.value}" data-price="${option.price}">${option.label} - ${option.price} دينار</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="food-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseRamadanQuantity(${item.id})" disabled>-</button>
                        <span class="quantity-display" id="ramadan-qty-${item.id}">0</span>
                        <button class="quantity-btn" onclick="increaseRamadanQuantity(${item.id})" disabled>+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToRamadanCart(${item.id})" disabled>
                        أضف للسلة
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Ramadan category
async function filterRamadanCategory(category) {
    currentRamadanFilter = category;
    
    document.querySelectorAll('#ramadanCategoryButtons .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    await loadRamadanFoodItems();
}

// Select meat type for Ramadan order
async function selectRamadanMeatType(itemId, meatType) {
    const menuData = await getMenuData();
    const item = menuData.find(item => item.id === itemId);
    const meatButtons = document.querySelectorAll(`#ramadanFoodItems [data-id="${itemId}"] .meat-btn`);
    const quantitySelect = document.getElementById(`ramadan-quantity-${itemId}`);
    
    // Update active button
    meatButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === meatType) {
            btn.classList.add('active');
        }
    });
    
    // Update image
    const meatOption = item.meatOptions.find(option => option.type === meatType);
    const foodImage = document.querySelector(`#ramadanFoodItems [data-id="${itemId}"] .food-item-image`);
    foodImage.src = meatOption.image;
    
    // Update quantity options
    const options = meatType === 'دجاج' ? item.quantityOptions : item.meatQuantityOptions;
    const optionsHTML = options.map(option => 
        `<option value="${option.value}" data-price="${option.price}">${option.label} - ${option.price} دينار</option>`
    ).join('');
    
    quantitySelect.innerHTML = '<option value="">اختر الكمية</option>' + optionsHTML;
    quantitySelect.selectedIndex = 0;
    
    // Update item in cart if exists
    const cartItem = ramadanCart.find(item => item.id === itemId);
    if (cartItem) {
        cartItem.meatType = meatType;
        cartItem.selectedQuantity = '';
        cartItem.price = 0;
        cartItem.quantity = 0;
    }
    
    updateRamadanQuantityDisplay(itemId);
    updateRamadanCartDisplay();
    updateRamadanAddToCartButton(itemId);
}

// Update item quantity for Ramadan order
async function updateRamadanItemQuantity(itemId) {
    const select = document.getElementById(`ramadan-quantity-${itemId}`);
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const menuData = await getMenuData();
        const item = menuData.find(item => item.id === itemId);
        const selectedQuantity = selectedOption.value;
        const selectedPrice = parseFloat(selectedOption.dataset.price);
        const activeMeatBtn = document.querySelector(`#ramadanFoodItems [data-id="${itemId}"] .meat-btn.active`);
        const meatType = activeMeatBtn ? activeMeatBtn.dataset.type : 'دجاج';
        
        // Update or add to cart
        const cartItem = ramadanCart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.selectedQuantity = selectedQuantity;
            cartItem.price = selectedPrice;
            cartItem.meatType = meatType;
        } else {
            ramadanCart.push({
                ...item,
                selectedQuantity: selectedQuantity,
                price: selectedPrice,
                meatType: meatType,
                quantity: 1
            });
        }
        
        updateRamadanQuantityDisplay(itemId);
        updateRamadanCartDisplay();
        updateRamadanAddToCartButton(itemId);
    }
}

// Increase Ramadan quantity
function increaseRamadanQuantity(itemId) {
    const cartItem = ramadanCart.find(item => item.id === itemId);
    
    if (cartItem && cartItem.selectedQuantity) {
        cartItem.quantity++;
        updateRamadanQuantityDisplay(itemId);
        updateRamadanCartDisplay();
    }
}

// Decrease Ramadan quantity
function decreaseRamadanQuantity(itemId) {
    const cartItem = ramadanCart.find(item => item.id === itemId);
    
    if (cartItem && cartItem.selectedQuantity) {
        cartItem.quantity--;
        if (cartItem.quantity <= 0) {
            ramadanCart = ramadanCart.filter(item => item.id !== itemId);
            const select = document.getElementById(`ramadan-quantity-${itemId}`);
            select.selectedIndex = 0;
            const meatButtons = document.querySelectorAll(`#ramadanFoodItems [data-id="${itemId}"] .meat-btn`);
            meatButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === 'دجاج') {
                    btn.classList.add('active');
                }
            });
            selectRamadanMeatType(itemId, 'دجاج');
        }
    }
    
    updateRamadanQuantityDisplay(itemId);
    updateRamadanCartDisplay();
    updateRamadanAddToCartButton(itemId);
}

// Update Ramadan quantity display
function updateRamadanQuantityDisplay(itemId) {
    const cartItem = ramadanCart.find(item => item.id === itemId);
    const quantityDisplay = document.getElementById(`ramadan-qty-${itemId}`);
    if (!quantityDisplay) return;
    
    const decreaseBtn = quantityDisplay.parentElement.querySelector('.quantity-btn:first-child');
    const increaseBtn = quantityDisplay.parentElement.querySelector('.quantity-btn:last-child');
    
    if (cartItem && cartItem.selectedQuantity) {
        quantityDisplay.textContent = cartItem.quantity;
        decreaseBtn.disabled = false;
        increaseBtn.disabled = false;
    } else {
        quantityDisplay.textContent = '0';
        decreaseBtn.disabled = true;
        increaseBtn.disabled = true;
    }
}

// Update Ramadan add to cart button
function updateRamadanAddToCartButton(itemId) {
    const cartItem = ramadanCart.find(item => item.id === itemId);
    const addBtn = document.querySelector(`#ramadanFoodItems [data-id="${itemId}"] .add-to-cart-btn`);
    
    if (addBtn) {
        if (cartItem && cartItem.selectedQuantity) {
            addBtn.disabled = false;
            addBtn.textContent = 'أضف للسلة';
        } else {
            addBtn.disabled = true;
            addBtn.textContent = 'اختر الكمية أولاً';
        }
    }
}

// Add to Ramadan cart
function addToRamadanCart(itemId) {
    increaseRamadanQuantity(itemId);
}

// Update Ramadan cart display
function updateRamadanCartDisplay() {
    const cartItems = document.getElementById('ramadanCartItems');
    const cartCount = document.getElementById('ramadanCartCount');
    const totalPrice = document.getElementById('ramadanTotalPrice');
    
    // Update cart count
    const totalItems = ramadanCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (ramadanCart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
    } else {
        cartItems.innerHTML = ramadanCart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name} (${item.meatType})</div>
                    <div class="cart-item-details">${item.selectedQuantity} • ${item.quantity}x</div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-price">${item.price * item.quantity} دينار</div>
                    <button class="remove-item-btn" onclick="removeFromRamadanCart(${item.id})" title="إزالة">×</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total price
    const total = ramadanCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `${total} دينار`;
}

// Remove from Ramadan cart
function removeFromRamadanCart(itemId) {
    ramadanCart = ramadanCart.filter(item => item.id !== itemId);
    const select = document.getElementById(`ramadan-quantity-${itemId}`);
    if (select) {
        select.selectedIndex = 0;
    }
    const meatButtons = document.querySelectorAll(`#ramadanFoodItems [data-id="${itemId}"] .meat-btn`);
    meatButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === 'دجاج') {
            btn.classList.add('active');
        }
    });
    selectRamadanMeatType(itemId, 'دجاج');
    updateRamadanQuantityDisplay(itemId);
    updateRamadanCartDisplay();
    updateRamadanAddToCartButton(itemId);
}

// Handle Ramadan customer form submission
document.addEventListener('DOMContentLoaded', function() {
    const ramadanForm = document.getElementById('ramadanCustomerForm');
    if (ramadanForm) {
        ramadanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRamadanOrder();
        });
    }
});

// Submit Ramadan order
async function submitRamadanOrder() {
    if (ramadanCart.length === 0) {
        alert('السلة فارغة! يرجى إضافة عناصر للطلب');
        return;
    }
    
    const customerName = document.getElementById('ramadanCustomerName').value;
    const phoneNumber = document.getElementById('ramadanPhoneNumber').value;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const otherDetails = document.getElementById('ramadanOtherDetails').value;
    
    if (!customerName || !phoneNumber) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
        formattedPhone = phoneNumber.substring(1);
    }
    formattedPhone = '+962' + formattedPhone;
    
    // Get existing orders
    const orders = await getRamadanOrders();
    
    if (orders.some(o => normalizePhone(o.phoneNumber) === normalizePhone(formattedPhone))) {
        alert('⚠️ تحذير: رقم التلفون هذا موجود مسبقًا ضمن الطلبات. سيتم تمييز الطلبات المكررة باللون الأحمر في الجدول.');
    }
    
    // Generate serial number
    const serialNumber = orders.length > 0 ? Math.max(...orders.map(o => o.serialNumber)) + 1 : 1;
    
    // Calculate total
    const totalAmount = ramadanCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order object
    const newOrder = {
        id: Date.now(),
        serialNumber: serialNumber,
        customerName: customerName,
        phoneNumber: formattedPhone,
        deliveryType: deliveryType,
        otherDetails: otherDetails,
        items: ramadanCart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            selectedQuantity: item.selectedQuantity,
            meatType: item.meatType,
            price: item.price,
            total: item.price * item.quantity
        })),
        totalAmount: totalAmount,
        date: new Date().toISOString()
    };
    
    // Save order
    orders.push(newOrder);
    await saveRamadanOrders(orders);
    
    // Clear cart and form
    ramadanCart = [];
    updateRamadanCartDisplay();
    document.getElementById('ramadanCustomerForm').reset();
    hideRamadanOrderForm();
    
    // Refresh orders table and stats
    await loadRamadanOrders();
    await updateRamadanStats();
    
    alert(`تم حفظ الطلب بنجاح!\nرقم الطلب: ${serialNumber}`);
}

// View order details
async function viewOrder(orderId) {
    const orders = await getRamadanOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('الطلب غير موجود');
        return;
    }
    
    const itemsList = order.items.map(item => 
        `• ${item.name} (${item.meatType}) - ${item.selectedQuantity} × ${item.quantity} = ${item.total} دينار`
    ).join('\n');
    
    let orderDetails = `
طلب رقم ${order.serialNumber}
━━━━━━━━━━━━━━━━━━━━

اسم العميل: ${order.customerName}
رقم التلفون: ${order.phoneNumber}
توصيل/استلام: ${order.deliveryType}`;

    if (order.deliveryType === 'توصيل' && order.deliveryAddress) {
        orderDetails += `\nعنوان التوصيل: ${order.deliveryAddress}`;
    }
    
    orderDetails += `
تفاصيل أخرى: ${order.otherDetails || 'لا يوجد'}

تفاصيل الطلب:
${itemsList}

المجموع: ${order.totalAmount} دينار
التاريخ: ${formatDate(order.date)}
    `;
    
    alert(orderDetails);
}

// Open delete order modal
function openDeleteOrderModal(orderId) {
    deleteOrderId = orderId;
    const modal = document.getElementById('deleteOrderModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close delete order modal
function closeDeleteOrderModal() {
    deleteOrderId = null;
    const modal = document.getElementById('deleteOrderModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Confirm delete order
async function confirmDeleteOrder() {
    if (!deleteOrderId) return;
    
    // Delete from database
    if (window.DB && window.DB.deleteRamadanOrder) {
        await window.DB.deleteRamadanOrder(deleteOrderId);
    } else {
        // Fallback: delete from localStorage
        let orders = await getRamadanOrders();
        orders = orders.filter(order => order.id !== deleteOrderId);
        await saveRamadanOrders(orders);
    }
    
    closeDeleteOrderModal();
    await loadRamadanOrders();
    await updateRamadanStats();
    
    alert('تم حذف الطلب بنجاح');
}

// Export to Excel
async function exportRamadanOrders() {
    const orders = await getRamadanOrders();
    
    if (orders.length === 0) {
        alert('لا توجد طلبات لتصديرها');
        return;
    }
    
    // Separate orders by delivery type
    const deliveryOrders = orders.filter(order => order.deliveryType === 'توصيل');
    const pickupOrders = orders.filter(order => order.deliveryType === 'استلام');
    
    // Function to format order data
    const formatOrderData = (order) => {
        // Format items - show as written (no repetition or x1)
        const itemsList = order.items.map(item => {
            // إذا كان طلب سريع، اعرض النص فقط
            if (item.meatType === '-') {
                return item.name;
            }
            // إذا كان طلب عادي
            return `${item.name} (${item.meatType}) - ${item.selectedQuantity} × ${item.quantity}`;
        }).join(', ');
        
        return {
            'الرقم التسلسلي للطلب': `طلب رقم ${order.serialNumber}`,
            'اسم العميل': order.customerName,
            'الطلب': itemsList,
            'رقم التلفون': order.phoneNumber,
            'عنوان التوصيل': order.deliveryType === 'توصيل' ? (order.deliveryAddress || '-') : '-',
            'تفاصيل أخرى': order.otherDetails || '-',
            'المجموع': `${order.totalAmount} دينار`,
            'التاريخ': formatDate(order.date)
        };
    };
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create delivery sheet
    if (deliveryOrders.length > 0) {
        const deliveryData = deliveryOrders.map(formatOrderData);
        const wsDelivery = XLSX.utils.json_to_sheet(deliveryData);
        
        // Set column widths
        wsDelivery['!cols'] = [
            { wch: 15 },  // الرقم التسلسلي
            { wch: 20 },  // اسم العميل
            { wch: 50 },  // الطلب
            { wch: 15 },  // رقم التلفون
            { wch: 30 },  // عنوان التوصيل
            { wch: 25 },  // تفاصيل أخرى
            { wch: 15 },  // المجموع
            { wch: 20 }   // التاريخ
        ];
        
        XLSX.utils.book_append_sheet(wb, wsDelivery, 'توصيل');
    }
    
    // Create pickup sheet
    if (pickupOrders.length > 0) {
        const pickupData = pickupOrders.map(formatOrderData);
        const wsPickup = XLSX.utils.json_to_sheet(pickupData);
        
        // Set column widths
        wsPickup['!cols'] = [
            { wch: 15 },  // الرقم التسلسلي
            { wch: 20 },  // اسم العميل
            { wch: 50 },  // الطلب
            { wch: 15 },  // رقم التلفون
            { wch: 30 },  // عنوان التوصيل
            { wch: 25 },  // تفاصيل أخرى
            { wch: 15 },  // المجموع
            { wch: 20 }   // التاريخ
        ];
        
        XLSX.utils.book_append_sheet(wb, wsPickup, 'استلام');
    }
    
    // If no sheets were added, show message
    if (deliveryOrders.length === 0 && pickupOrders.length === 0) {
        alert('لا توجد طلبات لتصديرها');
        return;
    }
    
    // Generate filename with current date
    const date = new Date();
    const filename = `طلبات_رمضان_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    // Show summary
    let message = 'تم تصدير الطلبات إلى ملف Excel بنجاح!\n\n';
    if (deliveryOrders.length > 0) {
        message += `📦 شيت التوصيل: ${deliveryOrders.length} طلب\n`;
    }
    if (pickupOrders.length > 0) {
        message += `🏪 شيت الاستلام: ${pickupOrders.length} طلب\n`;
    }
    
    alert(message);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const deleteModal = document.getElementById('deleteOrderModal');
    const editModal = document.getElementById('editOrderModal');
    
    if (event.target === deleteModal) {
        closeDeleteOrderModal();
    }
    if (event.target === editModal) {
        closeEditOrderModal();
    }
};

// ==================== SEARCH FUNCTIONALITY ====================

// Search orders
function searchRamadanOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Show all orders if search is empty
        loadRamadanOrders();
        return;
    }
    
    const filteredOrders = allOrders.filter(order => {
        const serialNumber = `طلب رقم ${order.serialNumber}`.toLowerCase();
        const customerName = order.customerName.toLowerCase();
        const phoneNumber = order.phoneNumber.toLowerCase();
        const orderDetails = formatOrderItems(order.items).toLowerCase();
        
        return serialNumber.includes(searchTerm) ||
               customerName.includes(searchTerm) ||
               phoneNumber.includes(searchTerm) ||
               orderDetails.includes(searchTerm) ||
               order.serialNumber.toString().includes(searchTerm);
    });
    
    loadRamadanOrders(filteredOrders);
}

// Clear search
function clearSearch() {
    document.getElementById('searchOrders').value = '';
    loadRamadanOrders();
}

// ==================== EDIT ORDER FUNCTIONALITY ====================

// Open edit order modal
async function openEditOrderModal(orderId) {
    const orders = await getRamadanOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('الطلب غير موجود');
        return;
    }
    
    editOrderId = orderId;
    
    // Fill form with order data
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editOrderSerial').value = order.serialNumber;
    document.getElementById('editCustomerName').value = order.customerName;
    document.getElementById('editPhoneNumber').value = order.phoneNumber.replace('+962', '');
    document.getElementById('editOrderDetails').value = formatOrderItems(order.items);
    document.getElementById('editOrderPrice').value = order.totalAmount;
    document.getElementById('editDeliveryType').value = order.deliveryType;
    document.getElementById('editDeliveryAddress').value = order.deliveryAddress || '';
    document.getElementById('editOtherDetails').value = order.otherDetails || '';
    
    // Toggle address field visibility
    toggleEditDeliveryAddress();
    
    // Show modal
    const modal = document.getElementById('editOrderModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close edit order modal
function closeEditOrderModal() {
    editOrderId = null;
    const modal = document.getElementById('editOrderModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('editOrderForm').reset();
}

// Handle edit order form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editOrderForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOrderEdit();
        });
    }
});

// Save edited order
async function saveOrderEdit() {
    if (!editOrderId) return;
    
    let orders = await getRamadanOrders();
    const orderIndex = orders.findIndex(o => o.id === editOrderId);
    
    if (orderIndex === -1) {
        alert('الطلب غير موجود');
        return;
    }
    
    // Get new values
    const newSerial = parseInt(document.getElementById('editOrderSerial').value);
    const newName = document.getElementById('editCustomerName').value;
    const newPhone = document.getElementById('editPhoneNumber').value;
    const newOrderDetails = document.getElementById('editOrderDetails').value;
    const newPrice = parseFloat(document.getElementById('editOrderPrice').value);
    const newDeliveryType = document.getElementById('editDeliveryType').value;
    const newDeliveryAddress = document.getElementById('editDeliveryAddress').value;
    const newDetails = document.getElementById('editOtherDetails').value;
    
    // Validate delivery address if توصيل
    if (newDeliveryType === 'توصيل' && !newDeliveryAddress) {
        alert('يرجى إدخال عنوان التوصيل');
        document.getElementById('editDeliveryAddress').focus();
        return;
    }
    
    // Format phone
    let formattedPhone = newPhone.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('+962')) {
        formattedPhone = '+962' + formattedPhone;
    }
    
    
    if (orders.some((o, idx) => idx !== orderIndex && normalizePhone(o.phoneNumber) === normalizePhone(formattedPhone))) {
        alert('⚠️ تحذير: رقم التلفون هذا موجود مسبقًا ضمن الطلبات. سيتم تمييز الطلبات المكررة باللون الأحمر في الجدول.');
    }
    
    // Update order
    orders[orderIndex] = {
        ...orders[orderIndex],
        serialNumber: newSerial,
        customerName: newName,
        phoneNumber: formattedPhone,
        deliveryType: newDeliveryType,
        deliveryAddress: newDeliveryType === 'توصيل' ? newDeliveryAddress : '-',
        otherDetails: newDetails,
        totalAmount: newPrice,
        items: [{
            name: newOrderDetails,
            quantity: 1,
            selectedQuantity: newOrderDetails,
            meatType: '-',
            price: newPrice,
            total: newPrice
        }]
    };
    
    // Save
    await saveRamadanOrders(orders);
    
    // Close modal
    closeEditOrderModal();
    
    // Refresh display
    await loadRamadanOrders();
    await updateRamadanStats();
    
    alert('✅ تم تحديث الطلب بنجاح!');
}

// ==================== QUICK ENTRY MODE ====================

// Show quick entry form
function showQuickEntryForm() {
    const section = document.getElementById('quickEntrySection');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
    
    // Hide other forms
    document.getElementById('ramadanOrderFormSection').style.display = 'none';
    
    // Initialize delivery address field visibility
    toggleDeliveryAddress();
    
    // Focus first field
    setTimeout(() => {
        document.getElementById('quickCustomerName').focus();
    }, 300);
    
    // Reset session count
    quickEntrySessionCount = 0;
    updateQuickEntryCount();
}

// Hide quick entry form
function hideQuickEntry() {
    document.getElementById('quickEntrySection').style.display = 'none';
    document.getElementById('quickEntryForm').reset();
    quickEntrySessionCount = 0;
    updateQuickEntryCount();
}

// Update quick entry counter
function updateQuickEntryCount() {
    document.getElementById('quickEntryCount').textContent = quickEntrySessionCount;
}

// Handle quick entry form submission
document.addEventListener('DOMContentLoaded', function() {
    const quickForm = document.getElementById('quickEntryForm');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitQuickEntry();
        });
        
        // Auto-advance on Enter
        const inputs = quickForm.querySelectorAll('input:not([type="number"]), select');
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && input.tagName !== 'BUTTON') {
                    e.preventDefault();
                    const nextInput = inputs[index + 1];
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            });
        });
    }
});

// Toggle delivery address field
function toggleDeliveryAddress() {
    const deliveryType = document.getElementById('quickDeliveryType').value;
    const addressGroup = document.getElementById('deliveryAddressGroup');
    const addressInput = document.getElementById('quickDeliveryAddress');
    
    if (deliveryType === 'توصيل') {
        addressGroup.style.display = 'block';
        addressInput.required = true;
    } else {
        addressGroup.style.display = 'none';
        addressInput.required = false;
        addressInput.value = '';
    }
}

// Toggle edit delivery address field
function toggleEditDeliveryAddress() {
    const deliveryType = document.getElementById('editDeliveryType').value;
    const addressGroup = document.getElementById('editDeliveryAddressGroup');
    const addressInput = document.getElementById('editDeliveryAddress');
    
    if (deliveryType === 'توصيل') {
        addressGroup.style.display = 'block';
    } else {
        addressGroup.style.display = 'none';
        addressInput.value = '';
    }
}

// Submit quick entry
async function submitQuickEntry() {
    const customerName = document.getElementById('quickCustomerName').value;
    const phoneNumber = document.getElementById('quickPhoneNumber').value;
    const order = document.getElementById('quickOrder').value;
    const price = parseFloat(document.getElementById('quickPrice').value);
    const deliveryType = document.getElementById('quickDeliveryType').value;
    const deliveryAddress = document.getElementById('quickDeliveryAddress').value;
    const details = document.getElementById('quickDetails').value;
    
    if (!customerName || !phoneNumber || !order || !price) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // Validate delivery address if توصيل
    if (deliveryType === 'توصيل' && !deliveryAddress) {
        alert('يرجى إدخال عنوان التوصيل');
        document.getElementById('quickDeliveryAddress').focus();
        return;
    }
    
    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('+962')) {
        formattedPhone = '+962' + formattedPhone;
    }
    
    // Get existing orders
    const orders = await getRamadanOrders();
    
    // Warn if duplicate phone exists
    if (orders.some(o => normalizePhone(o.phoneNumber) === normalizePhone(formattedPhone))) {
        alert('⚠️ تحذير: رقم التلفون هذا موجود مسبقًا ضمن الطلبات. سيتم تمييز الطلبات المكررة باللون الأحمر في الجدول.');
    }
    
    // Generate serial number
    const serialNumber = orders.length > 0 ? Math.max(...orders.map(o => o.serialNumber)) + 1 : 1;
    
    // Create order object
    const newOrder = {
        id: Date.now(),
        serialNumber: serialNumber,
        customerName: customerName,
        phoneNumber: formattedPhone,
        deliveryType: deliveryType,
        deliveryAddress: deliveryType === 'توصيل' ? deliveryAddress : '-',
        otherDetails: details || '-',
        items: [{
            name: order,
            quantity: 1,
            selectedQuantity: order,
            meatType: '-',
            price: price,
            total: price
        }],
        totalAmount: price,
        date: new Date().toISOString()
    };
    
    // Save order
    orders.push(newOrder);
    await saveRamadanOrders(orders);
    
    // Update session count
    quickEntrySessionCount++;
    updateQuickEntryCount();
    
    // Refresh table and stats
    await loadRamadanOrders();
    await updateRamadanStats();
    
    // Clear form (except delivery type)
    document.getElementById('quickCustomerName').value = '';
    document.getElementById('quickPhoneNumber').value = '';
    document.getElementById('quickOrder').value = '';
    document.getElementById('quickPrice').value = '';
    document.getElementById('quickDeliveryAddress').value = '';
    document.getElementById('quickDetails').value = '';
    
    // Focus first field again
    document.getElementById('quickCustomerName').focus();
    
    // Show brief success
    const submitBtn = document.querySelector('#quickEntryForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✅ تم الحفظ!';
    submitBtn.style.background = '#28a745';
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
    }, 1000);
}

// ==================== TELEGRAM SYNC ====================

// Upload orders to Telegram
async function syncToTelegram() {
    const orders = await getRamadanOrders();
    
    if (orders.length === 0) {
        alert('لا توجد طلبات للرفع');
        return;
    }
    
    // Show loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ جاري الرفع...';
    
    try {
        // Separate orders by delivery type
        const deliveryOrders = orders.filter(order => order.deliveryType === 'توصيل');
        const pickupOrders = orders.filter(order => order.deliveryType === 'استلام');
        
        // Function to format order data
        const formatOrderData = (order) => {
            // Format items - show as written (no repetition or x1)
            const itemsList = order.items.map(item => {
                // إذا كان طلب سريع، اعرض النص فقط
                if (item.meatType === '-') {
                    return item.name;
                }
                // إذا كان طلب عادي
                return `${item.name} (${item.meatType}) - ${item.selectedQuantity} × ${item.quantity}`;
            }).join(', ');
            
            return {
                'الرقم التسلسلي للطلب': `طلب رقم ${order.serialNumber}`,
                'اسم العميل': order.customerName,
                'الطلب': itemsList,
                'رقم التلفون': order.phoneNumber,
                'عنوان التوصيل': order.deliveryType === 'توصيل' ? (order.deliveryAddress || '-') : '-',
                'تفاصيل أخرى': order.otherDetails || '-',
                'المجموع': `${order.totalAmount} دينار`,
                'التاريخ': formatDate(order.date)
            };
        };
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create delivery sheet
        if (deliveryOrders.length > 0) {
            const deliveryData = deliveryOrders.map(formatOrderData);
            const wsDelivery = XLSX.utils.json_to_sheet(deliveryData);
            
            wsDelivery['!cols'] = [
                { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 15 },
                { wch: 30 }, { wch: 15 }, { wch: 20 }
            ];
            
            XLSX.utils.book_append_sheet(wb, wsDelivery, 'توصيل');
        }
        
        // Create pickup sheet
        if (pickupOrders.length > 0) {
            const pickupData = pickupOrders.map(formatOrderData);
            const wsPickup = XLSX.utils.json_to_sheet(pickupData);
            
            wsPickup['!cols'] = [
                { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 15 },
                { wch: 30 }, { wch: 15 }, { wch: 20 }
            ];
            
            XLSX.utils.book_append_sheet(wb, wsPickup, 'استلام');
        }
        
        // Generate file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        
        // Send to Telegram via Worker
        const date = new Date();
        const filename = `طلبات_رمضان_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}${date.getMinutes()}.xlsx`;
        
        // Create caption with summary
        let caption = `📊 طلبات رمضان\n`;
        caption += `📦 إجمالي الطلبات: ${orders.length}\n`;
        if (deliveryOrders.length > 0) {
            caption += `🚚 طلبات التوصيل: ${deliveryOrders.length} (${deliveryOrders.reduce((s, o) => s + o.totalAmount, 0)} دينار)\n`;
        }
        if (pickupOrders.length > 0) {
            caption += `🏪 طلبات الاستلام: ${pickupOrders.length} (${pickupOrders.reduce((s, o) => s + o.totalAmount, 0)} دينار)\n`;
        }
        caption += `💰 المجموع الكلي: ${orders.reduce((sum, o) => sum + o.totalAmount, 0)} دينار\n`;
        caption += `📅 ${new Date().toLocaleString('ar-JO')}`;
        
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
            alert('✅ تم رفع الطلبات إلى التليجرام بنجاح!');
        } else {
            throw new Error(result.error || 'فشل الرفع');
        }
        
    } catch (error) {
        console.error('Error syncing to Telegram:', error);
        alert('❌ حدث خطأ في رفع الطلبات: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// Download orders from Telegram
async function syncFromTelegram(replaceAll = false) {
    // Show loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ جاري التحميل...';
    
    try {
        // Get latest file from Telegram
        const response = await fetch(TELEGRAM_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'download'
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'فشل التحميل');
        }
        
        // Parse Excel file - check both sheets
        const workbook = XLSX.read(result.filedata, { type: 'base64' });
        let allData = [];
        
        // Read from both sheets if they exist
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet);
            allData = [...allData, ...sheetData];
        }
        
        if (allData.length === 0) {
            alert('⚠️ الملف فارغ أو لا يحتوي على بيانات');
            return;
        }
        
        const currentOrders = await getRamadanOrders();
        let maxSerialNumber = currentOrders.length > 0 ? Math.max(...currentOrders.map(o => o.serialNumber)) : 0;
        
        let finalOrders;
        let message;
        
        if (replaceAll) {
            // Replace all orders with new ones from Telegram
            const newOrders = allData.map((row, index) => {
                const serialMatch = row['الرقم التسلسلي للطلب'] ? row['الرقم التسلسلي للطلب'].match(/\d+/) : null;
                const serialNumber = serialMatch ? parseInt(serialMatch[0]) : index + 1;
                
                const priceMatch = row['المجموع'] ? row['المجموع'].match(/[\d.]+/) : null;
                const totalAmount = priceMatch ? parseFloat(priceMatch[0]) : 0;
                
                let deliveryType = 'توصيل';
                if (row['توصيل او استلام']) {
                    deliveryType = row['توصيل او استلام'];
                }
                
                return {
                    id: Date.now() + index,
                    serialNumber: serialNumber,
                    customerName: row['اسم العميل'] || 'غير معروف',
                    phoneNumber: row['رقم التلفون'] || '-',
                    deliveryType: deliveryType,
                    deliveryAddress: row['عنوان التوصيل'] || '-',
                    otherDetails: row['تفاصيل أخرى'] || '-',
                    items: [{
                        name: row['الطلب'] || '-',
                        quantity: 1,
                        selectedQuantity: row['الطلب'] || '-',
                        meatType: '-',
                        price: totalAmount,
                        total: totalAmount
                    }],
                    totalAmount: totalAmount,
                    date: new Date().toISOString()
                };
            });
            
            finalOrders = newOrders.sort((a, b) => a.serialNumber - b.serialNumber);
            message = `✅ تم استبدال جميع الطلبات!\n📦 تم تحميل ${newOrders.length} طلب من التليجرام`;
        } else {
            // Merge - only add NEW orders (skip duplicates based on phone number)
            const existingPhones = new Set(currentOrders.map(o => normalizePhone(o.phoneNumber)));
            let serialCounter = maxSerialNumber;
            let skippedCount = 0;
            
            const newOrders = allData.map((row, index) => {
                const phoneNumber = row['رقم التلفون'] || '-';
                const normalizedPhone = normalizePhone(phoneNumber);
                
                // Skip if phone number already exists
                if (existingPhones.has(normalizedPhone)) {
                    skippedCount++;
                    return null;
                }
                
                // Give new serial number
                serialCounter++;
                const newSerialNumber = serialCounter;
                
                const priceMatch = row['المجموع'] ? row['المجموع'].match(/[\d.]+/) : null;
                const totalAmount = priceMatch ? parseFloat(priceMatch[0]) : 0;
                
                let deliveryType = 'توصيل';
                if (row['توصيل او استلام']) {
                    deliveryType = row['توصيل او استلام'];
                }
                
                // Add to existing phones set
                existingPhones.add(normalizedPhone);
                
                return {
                    id: Date.now() + index,
                    serialNumber: newSerialNumber,
                    customerName: row['اسم العميل'] || 'غير معروف',
                    phoneNumber: phoneNumber,
                    deliveryType: deliveryType,
                    deliveryAddress: row['عنوان التوصيل'] || '-',
                    otherDetails: row['تفاصيل أخرى'] || '-',
                    items: [{
                        name: row['الطلب'] || '-',
                        quantity: 1,
                        selectedQuantity: row['الطلب'] || '-',
                        meatType: '-',
                        price: totalAmount,
                        total: totalAmount
                    }],
                    totalAmount: totalAmount,
                    date: new Date().toISOString()
                };
            }).filter(order => order !== null); // Remove skipped (null) orders
            
            // Add only new orders to existing ones
            finalOrders = [...currentOrders, ...newOrders].sort((a, b) => a.serialNumber - b.serialNumber);
            
            // Build message with stats
            message = `✅ تم دمج الطلبات!\n📦 تم إضافة ${newOrders.length} طلب جديد`;
            if (skippedCount > 0) {
                message += `\n⚠️ تم تجاهل ${skippedCount} طلب مكرر (رقم تلفون موجود مسبقاً)`;
            }
        }
        
        // Save
        await saveRamadanOrders(finalOrders);
        
        // Refresh display
        await loadRamadanOrders();
        await updateRamadanStats();
        
        alert(message);
        
    } catch (error) {
        console.error('Error syncing from Telegram:', error);
        alert('❌ حدث خطأ في تحميل الطلبات: ' + error.message + '\n\nتأكد من تكوين Worker بشكل صحيح');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

