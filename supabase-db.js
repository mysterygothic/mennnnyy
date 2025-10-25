// Supabase Database Functions
// This file contains all database operations for menu, categories, and orders

// ========== INITIALIZATION ==========

let supabase = null;
let useLocalStorageFallback = false;

// Initialize Supabase connection
async function initializeDatabase() {
    try {
        if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.isConfigured()) {
            supabase = await window.SUPABASE_CONFIG.init();
            if (supabase) {
                console.log('✅ Database connected (Supabase)');
                useLocalStorageFallback = false;
                return true;
            }
        }
        
        console.warn('⚠️ Falling back to localStorage');
        useLocalStorageFallback = true;
        return false;
    } catch (error) {
        console.error('Database initialization error:', error);
        useLocalStorageFallback = true;
        return false;
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
});

// ========== MENU ITEMS OPERATIONS ==========

/**
 * Get all menu items
 * @returns {Promise<Array>} Array of menu items
 */
async function getMenuItems() {
    if (useLocalStorageFallback || !supabase) {
        // Fallback to localStorage
        const data = localStorage.getItem('menu_data');
        return data ? JSON.parse(data) : getDefaultMenuData();
    }
    
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        // Transform database format to app format
        return data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            basePrice: item.base_price,
            category: item.category,
            image: item.image,
            meatType: "دجاج",
            meatOptions: item.meat_options || [],
            quantityOptions: item.quantity_options || [],
            meatQuantityOptions: item.meat_quantity_options || []
        }));
    } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to localStorage on error
        const data = localStorage.getItem('menu_data');
        return data ? JSON.parse(data) : getDefaultMenuData();
    }
}

/**
 * Save menu item (create or update)
 * @param {Object} item - Menu item object
 * @returns {Promise<boolean>} Success status
 */
async function saveMenuItem(item) {
    // Always save to localStorage as cache
    const menuData = await getMenuItems();
    const existingIndex = menuData.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
        menuData[existingIndex] = item;
    } else {
        menuData.push(item);
    }
    localStorage.setItem('menu_data', JSON.stringify(menuData));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        // Transform to database format
        const dbItem = {
            name: item.name,
            description: item.description,
            base_price: item.basePrice,
            category: item.category,
            image: item.image,
            meat_options: item.meatOptions,
            quantity_options: item.quantityOptions,
            meat_quantity_options: item.meatQuantityOptions,
            updated_at: new Date().toISOString()
        };
        
        if (item.id) {
            // Update existing
            const { error } = await supabase
                .from('menu_items')
                .update(dbItem)
                .eq('id', item.id);
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('menu_items')
                .insert([dbItem]);
            
            if (error) throw error;
        }
        
        console.log('✅ Menu item saved to database');
        return true;
    } catch (error) {
        console.error('Error saving menu item:', error);
        return false;
    }
}

/**
 * Delete menu item
 * @param {number} itemId - Item ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteMenuItem(itemId) {
    // Always delete from localStorage cache
    const menuData = await getMenuItems();
    const filtered = menuData.filter(item => item.id !== itemId);
    localStorage.setItem('menu_data', JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', itemId);
        
        if (error) throw error;
        
        console.log('✅ Menu item deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return false;
    }
}

// ========== CATEGORIES OPERATIONS ==========

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
async function getCategories() {
    if (useLocalStorageFallback || !supabase) {
        const data = localStorage.getItem('categories');
        return data ? JSON.parse(data) : [{ id: 1, name: 'سدور', value: 'sudor' }];
    }
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        const data = localStorage.getItem('categories');
        return data ? JSON.parse(data) : [{ id: 1, name: 'سدور', value: 'sudor' }];
    }
}

/**
 * Save category (create or update)
 * @param {Object} category - Category object
 * @returns {Promise<boolean>} Success status
 */
async function saveCategory(category) {
    // Always save to localStorage as cache
    const categories = await getCategories();
    const existingIndex = categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
        categories[existingIndex] = category;
    } else {
        categories.push(category);
    }
    localStorage.setItem('categories', JSON.stringify(categories));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        if (category.id) {
            // Update existing
            const { error } = await supabase
                .from('categories')
                .update({ name: category.name, value: category.value })
                .eq('id', category.id);
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('categories')
                .insert([{ name: category.name, value: category.value }]);
            
            if (error) throw error;
        }
        
        console.log('✅ Category saved to database');
        return true;
    } catch (error) {
        console.error('Error saving category:', error);
        return false;
    }
}

/**
 * Delete category
 * @param {number} categoryId - Category ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteCategory(categoryId) {
    // Always delete from localStorage cache
    const categories = await getCategories();
    const filtered = categories.filter(cat => cat.id !== categoryId);
    localStorage.setItem('categories', JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) throw error;
        
        console.log('✅ Category deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
}

// ========== RAMADAN ORDERS OPERATIONS ==========

/**
 * Get all Ramadan orders
 * @returns {Promise<Array>} Array of orders
 */
async function getRamadanOrders() {
    if (useLocalStorageFallback || !supabase) {
        const data = localStorage.getItem(STORAGE_KEYS.RAMADAN_ORDERS);
        return data ? JSON.parse(data) : [];
    }
    
    try {
        const { data, error } = await supabase
            .from('ramadan_orders')
            .select('*')
            .order('serial_number', { ascending: true });
        
        if (error) throw error;
        
        // Transform database format to app format
        return data.map(order => ({
            id: order.id,
            serialNumber: order.serial_number,
            customerName: order.customer_name,
            phoneNumber: order.phone_number,
            deliveryType: order.delivery_type,
            deliveryAddress: order.delivery_address,
            otherDetails: order.other_details,
            items: order.items,
            totalAmount: order.total_amount,
            date: order.order_date
        }));
    } catch (error) {
        console.error('Error fetching Ramadan orders:', error);
        const data = localStorage.getItem(STORAGE_KEYS.RAMADAN_ORDERS);
        return data ? JSON.parse(data) : [];
    }
}

/**
 * Save Ramadan order (create or update)
 * @param {Object} order - Order object
 * @returns {Promise<boolean>} Success status
 */
async function saveRamadanOrder(order) {
    // Always save to localStorage as cache
    const orders = await getRamadanOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
        orders[existingIndex] = order;
    } else {
        orders.push(order);
    }
    localStorage.setItem(STORAGE_KEYS.RAMADAN_ORDERS, JSON.stringify(orders));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        // Transform to database format
        const dbOrder = {
            serial_number: order.serialNumber,
            customer_name: order.customerName,
            phone_number: order.phoneNumber,
            delivery_type: order.deliveryType,
            delivery_address: order.deliveryAddress,
            other_details: order.otherDetails,
            items: order.items,
            total_amount: order.totalAmount,
            order_date: order.date,
            driver_id: order.driver_id || order.driverId || null,
            driver_name: order.driver_name || order.driverName || null,
            cash_amount: order.cash_amount || order.cashAmount || 0,
            delivery_status: order.delivery_status || order.deliveryStatus || 'pending',
            delivery_notes: order.delivery_notes || order.deliveryNotes || null
        };
        
        if (order.id && order.id > 1000000000000) {
            // New order (timestamp ID) - use insert
            const { error } = await supabase
                .from('ramadan_orders')
                .insert([dbOrder]);
            
            if (error) throw error;
        } else if (order.id) {
            // Existing order - use update
            const { error } = await supabase
                .from('ramadan_orders')
                .update(dbOrder)
                .eq('id', order.id);
            
            if (error) throw error;
        } else {
            // No ID - insert
            const { error } = await supabase
                .from('ramadan_orders')
                .insert([dbOrder]);
            
            if (error) throw error;
        }
        
        console.log('✅ Ramadan order saved to database');
        return true;
    } catch (error) {
        console.error('Error saving Ramadan order:', error);
        return false;
    }
}

/**
 * Save multiple Ramadan orders at once
 * @param {Array} orders - Array of order objects
 * @returns {Promise<boolean>} Success status
 */
async function saveRamadanOrders(orders) {
    // Always save to localStorage as cache
    localStorage.setItem(STORAGE_KEYS.RAMADAN_ORDERS, JSON.stringify(orders));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        // Delete all existing orders
        await supabase.from('ramadan_orders').delete().neq('id', 0);
        
        // Insert all new orders
        const dbOrders = orders.map(order => ({
            serial_number: order.serialNumber,
            customer_name: order.customerName,
            phone_number: order.phoneNumber,
            delivery_type: order.deliveryType,
            delivery_address: order.deliveryAddress,
            other_details: order.otherDetails,
            items: order.items,
            total_amount: order.totalAmount,
            order_date: order.date,
            driver_id: order.driver_id || order.driverId || null,
            driver_name: order.driver_name || order.driverName || null,
            cash_amount: order.cash_amount || order.cashAmount || 0,
            delivery_status: order.delivery_status || order.deliveryStatus || 'pending',
            delivery_notes: order.delivery_notes || order.deliveryNotes || null
        }));
        
        const { error } = await supabase
            .from('ramadan_orders')
            .insert(dbOrders);
        
        if (error) throw error;
        
        console.log('✅ All Ramadan orders saved to database');
        return true;
    } catch (error) {
        console.error('Error saving Ramadan orders:', error);
        return false;
    }
}

/**
 * Delete Ramadan order
 * @param {number} orderId - Order ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteRamadanOrder(orderId) {
    // Always delete from localStorage cache
    const orders = await getRamadanOrders();
    const filtered = orders.filter(order => order.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.RAMADAN_ORDERS, JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('ramadan_orders')
            .delete()
            .eq('id', orderId);
        
        if (error) throw error;
        
        console.log('✅ Ramadan order deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting Ramadan order:', error);
        return false;
    }
}

// ========== DEFAULT DATA ==========

function getDefaultMenuData() {
    return [
        {
            id: 1,
            name: "زرب",
            description: "زرب مع الأرز البسمتي والبهارات الخاصة",
            basePrice: 5,
            category: "sudor",
            image: "picturesfood/zarbjaj.jpg",
            meatType: "دجاج",
            meatOptions: [
                { type: "دجاج", image: "picturesfood/zarbjaj.jpg", priceMultiplier: 1 },
                { type: "لحم", image: "picturesfood/zarblaham.jpg", priceMultiplier: 1.5 }
            ],
            quantityOptions: [
                { label: "سدر نصف دجاجة", value: "سدر نصف دجاجة", price: 5 },
                { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                { label: "دجاجتين", value: "دجاجتين", price: 15 },
                { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
            ],
            meatQuantityOptions: [
                { label: "نصف كيلو", value: "نصف كيلو", price: 8 },
                { label: "1 كيلو", value: "1 كيلو", price: 13 },
                { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                { label: "2 كيلو", value: "2 كيلو", price: 25 },
                { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                { label: "3 كيلو", value: "3 كيلو", price: 32 }
            ]
        }
    ];
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Check if using Supabase or localStorage
 * @returns {boolean} True if using Supabase
 */
function isUsingSupabase() {
    return !useLocalStorageFallback && supabase !== null;
}

/**
 * Get database status
 * @returns {string} Status message
 */
function getDatabaseStatus() {
    if (isUsingSupabase()) {
        return '✅ Connected to Supabase Database';
    } else {
        return '⚠️ Using localStorage (Offline Mode)';
    }
}

// ========== DRIVERS OPERATIONS ==========

/**
 * Get all drivers
 * @returns {Promise<Array>} Array of drivers
 */
async function getDrivers() {
    if (useLocalStorageFallback || !supabase) {
        const data = localStorage.getItem('drivers');
        return data ? JSON.parse(data) : [];
    }
    
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error fetching drivers:', error);
        const data = localStorage.getItem('drivers');
        return data ? JSON.parse(data) : [];
    }
}

/**
 * Save driver (create or update)
 * @param {Object} driver - Driver object
 * @returns {Promise<boolean>} Success status
 */
async function saveDriver(driver) {
    // Always save to localStorage as cache
    const drivers = await getDrivers();
    const existingIndex = drivers.findIndex(d => d.id === driver.id);
    
    if (existingIndex >= 0) {
        drivers[existingIndex] = driver;
    } else {
        drivers.push(driver);
    }
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const dbDriver = {
            name: driver.name,
            phone_number: driver.phoneNumber || driver.phone_number,
            vehicle_type: driver.vehicleType || driver.vehicle_type,
            vehicle_plate: driver.vehiclePlate || driver.vehicle_plate,
            status: driver.status || 'active',
            notes: driver.notes,
            updated_at: new Date().toISOString()
        };
        
        if (driver.id && typeof driver.id === 'number' && driver.id < 1000000000000) {
            // Update existing
            const { error } = await supabase
                .from('drivers')
                .update(dbDriver)
                .eq('id', driver.id);
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('drivers')
                .insert([dbDriver]);
            
            if (error) throw error;
        }
        
        console.log('✅ Driver saved to database');
        return true;
    } catch (error) {
        console.error('Error saving driver:', error);
        return false;
    }
}

/**
 * Delete driver
 * @param {number} driverId - Driver ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteDriver(driverId) {
    // Always delete from localStorage cache
    const drivers = await getDrivers();
    const filtered = drivers.filter(driver => driver.id !== driverId);
    localStorage.setItem('drivers', JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('drivers')
            .delete()
            .eq('id', driverId);
        
        if (error) throw error;
        
        console.log('✅ Driver deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting driver:', error);
        return false;
    }
}

// ========== CUSTOMERS OPERATIONS ==========

/**
 * Get all customers
 * @returns {Promise<Array>} Array of customers
 */
async function getCustomers() {
    if (useLocalStorageFallback || !supabase) {
        const data = localStorage.getItem('customers');
        return data ? JSON.parse(data) : [];
    }
    
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('last_order_date', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        const data = localStorage.getItem('customers');
        return data ? JSON.parse(data) : [];
    }
}

/**
 * Save or update customer
 * @param {Object} customer - Customer object
 * @returns {Promise<boolean>} Success status
 */
async function saveCustomer(customer) {
    // Always save to localStorage as cache
    const customers = await getCustomers();
    const existingIndex = customers.findIndex(c => c.phone_number === customer.phone_number || c.phoneNumber === customer.phoneNumber);
    
    if (existingIndex >= 0) {
        customers[existingIndex] = customer;
    } else {
        customers.push(customer);
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const dbCustomer = {
            customer_name: customer.customer_name || customer.customerName,
            phone_number: customer.phone_number || customer.phoneNumber,
            delivery_address: customer.delivery_address || customer.deliveryAddress || null,
            order_count: customer.order_count || customer.orderCount || 1,
            total_spent: customer.total_spent || customer.totalSpent || 0,
            last_order_date: customer.last_order_date || customer.lastOrderDate || new Date().toISOString(),
            notes: customer.notes || null,
            updated_at: new Date().toISOString()
        };
        
        // Use upsert (insert or update)
        const { error } = await supabase
            .from('customers')
            .upsert([dbCustomer], { onConflict: 'phone_number' });
        
        if (error) throw error;
        
        console.log('✅ Customer saved to database');
        return true;
    } catch (error) {
        console.error('Error saving customer:', error);
        return false;
    }
}

/**
 * Delete customer
 * @param {number} customerId - Customer ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteCustomer(customerId) {
    // Always delete from localStorage cache
    const customers = await getCustomers();
    const filtered = customers.filter(customer => customer.id !== customerId);
    localStorage.setItem('customers', JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);
        
        if (error) throw error;
        
        console.log('✅ Customer deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        return false;
    }
}

// ========== ADMIN USERS OPERATIONS ==========

/**
 * Get all admin users
 * @returns {Promise<Array>} Array of admin users
 */
async function getAdminUsers() {
    if (useLocalStorageFallback || !supabase) {
        const data = localStorage.getItem('admin_users');
        return data ? JSON.parse(data) : [];
    }
    
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error fetching admin users:', error);
        const data = localStorage.getItem('admin_users');
        return data ? JSON.parse(data) : [];
    }
}

/**
 * Verify admin user login
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object|null>} User object if valid, null otherwise
 */
async function verifyAdminLogin(username, password) {
    if (useLocalStorageFallback || !supabase) {
        return null;
    }
    
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('password_hash', password) // Note: In production, use proper password hashing!
            .eq('is_active', true)
            .single();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error verifying admin login:', error);
        return null;
    }
}

/**
 * Save admin user (create or update)
 * @param {Object} user - Admin user object
 * @returns {Promise<boolean>} Success status
 */
async function saveAdminUser(user) {
    // Always save to localStorage as cache
    const users = await getAdminUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem('admin_users', JSON.stringify(users));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const dbUser = {
            username: user.username,
            password_hash: user.password || user.password_hash || user.passwordHash,
            full_name: user.full_name || user.fullName,
            role: user.role || 'admin',
            is_active: user.is_active !== undefined ? user.is_active : true,
            updated_at: new Date().toISOString()
        };
        
        if (user.id && typeof user.id === 'number' && user.id < 1000000000000) {
            // Update existing
            const { error } = await supabase
                .from('admin_users')
                .update(dbUser)
                .eq('id', user.id);
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('admin_users')
                .insert([dbUser]);
            
            if (error) throw error;
        }
        
        console.log('✅ Admin user saved to database');
        return true;
    } catch (error) {
        console.error('Error saving admin user:', error);
        return false;
    }
}

/**
 * Delete admin user
 * @param {number} userId - User ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteAdminUser(userId) {
    // Always delete from localStorage cache
    const users = await getAdminUsers();
    const filtered = users.filter(user => user.id !== userId);
    localStorage.setItem('admin_users', JSON.stringify(filtered));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('admin_users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        console.log('✅ Admin user deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting admin user:', error);
        return false;
    }
}

/**
 * Delete all Ramadan orders
 * @returns {Promise<boolean>} Success status
 */
async function deleteAllRamadanOrders() {
    // Clear localStorage
    localStorage.setItem(STORAGE_KEYS.RAMADAN_ORDERS, JSON.stringify([]));
    
    if (useLocalStorageFallback || !supabase) {
        return true;
    }
    
    try {
        const { error } = await supabase
            .from('ramadan_orders')
            .delete()
            .neq('id', 0); // Delete all rows
        
        if (error) throw error;
        
        console.log('✅ All Ramadan orders deleted from database');
        return true;
    } catch (error) {
        console.error('Error deleting all Ramadan orders:', error);
        return false;
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.DB = {
        // Menu
        getMenuItems,
        saveMenuItem,
        deleteMenuItem,
        
        // Categories
        getCategories,
        saveCategory,
        deleteCategory,
        
        // Ramadan Orders
        getRamadanOrders,
        saveRamadanOrder,
        saveRamadanOrders,
        deleteRamadanOrder,
        deleteAllRamadanOrders,
        
        // Drivers
        getDrivers,
        saveDriver,
        deleteDriver,
        
        // Customers
        getCustomers,
        saveCustomer,
        deleteCustomer,
        
        // Admin Users
        getAdminUsers,
        verifyAdminLogin,
        saveAdminUser,
        deleteAdminUser,
        
        // Utilities
        isUsingSupabase,
        getDatabaseStatus,
        initializeDatabase
    };
}

