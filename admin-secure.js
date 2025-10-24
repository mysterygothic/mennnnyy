// Secure Admin System - Uses Cloudflare Worker for Authentication
// No credentials stored in client code!

// ========== CONFIGURATION ==========
const AUTH_WORKER_URL = 'https://authmataamshiekh-guard.zlmsn3mk.workers.dev'; // Your auth worker URL

// Storage keys
const STORAGE_KEYS = {
    ADMIN_TOKEN: 'admin_token',
    ADMIN_USER: 'admin_user',
    MENU_DATA: 'menu_data',
    CATEGORIES: 'categories',
    RAMADAN_ORDERS: 'ramadan_orders'
};

function isProtectedAdminPage() {
  try {
    const path = (window.location && window.location.pathname) || '';
    if (!path) return false;
    if (path.endsWith('/admin.html')) return false;
    const name = path.split('/').pop();
    return /^admin-(dashboard|ramadan|delivery)\.html$/i.test(name);
  } catch (_e) { return false; }
}

function guardAdminPage() {
  try {
    if (!isProtectedAdminPage()) return;
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!token) {
      window.location.href = 'admin.html';
      return;
    }
    isAdminLoggedIn().then(function(ok){
      if (!ok) {
        window.location.href = 'admin.html';
      }
    }).catch(function(){
      window.location.href = 'admin.html';
    });
  } catch (_e) {}
}

(function(){
  try { guardAdminPage(); } catch (_e) {}
})();

// ========== CHECK IF ADMIN IS LOGGED IN ==========
async function isAdminLoggedIn() {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    if (!token) {
        return false;
    }
    
    try {
        // Verify token with server
        const response = await fetch(`${AUTH_WORKER_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });
        
        const result = await response.json();
        
        if (result.success && result.valid) {
            return true;
        } else {
            // Token invalid, clear it
            localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
            return false;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

// ========== ADMIN LOGIN ==========
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
    }
});

async function handleLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const submitBtn = document.querySelector('.admin-login-btn');
    
    // Clear previous errors
    errorMessage.classList.remove('show');
    
    // Show loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    
    try {
        // Call auth worker
        const response = await fetch(`${AUTH_WORKER_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username, 
                password: password 
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.token) {
            // Save token and user info
            localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, result.token);
            localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify({
                username: result.username,
                role: result.role
            }));
            
            // Redirect to dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Show error
            errorMessage.textContent = result.error || 'خطأ في تسجيل الدخول';
            errorMessage.classList.add('show');
            
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
        errorMessage.classList.add('show');
        
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// ========== ADMIN LOGOUT ==========
async function adminLogout() {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    if (token) {
        try {
            // Call logout endpoint
            await fetch(`${AUTH_WORKER_URL}/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    
    // Redirect to login
    window.location.href = 'admin.html';
}

// ========== GET CURRENT ADMIN USER ==========
function getCurrentAdmin() {
    const userStr = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (error) {
            return null;
        }
    }
    return null;
}

// ========== INITIALIZE DEFAULT DATA ==========
function initializeDefaultData() {
    // Initialize categories if not exists
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        const defaultCategories = [
            { id: 1, name: 'سدور', value: 'sudor' }
        ];
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }
    
    // Initialize menu data if not exists
    if (!localStorage.getItem(STORAGE_KEYS.MENU_DATA)) {
        const defaultMenuData = [
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
            },
            {
                id: 2,
                name: "منسف",
                description: "منسف مع الأرز واللبن واللوز",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/mansaf.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/mansaf.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/mansaf.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            },
            {
                id: 3,
                name: "مندي",
                description: "مندي مع الأرز البسمتي والبهارات",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/mande.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/mande.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/mande.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            },
            {
                id: 4,
                name: "برياني",
                description: "برياني حار بالفلفل الحار والخلطة العدنية السرية لمطعم الشيخ",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/breane.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/breane.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/breane.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            },
            {
                id: 5,
                name: "كبسة",
                description: "كبسة سعودية خاصة بمطعم الشيخ عيش تجربة الكبسة السعودية وأطلب كبسة ..",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/kabsa.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/kabsa.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/kabsa.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8},
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            },
            {
                id: 6,
                name: "قدرة",
                description: "القدرة الخليلية على أصولها من عند مطعم الشيخ باللحم والدجاج",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/qedra.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/qedra.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/qedra.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            },
            {
                id: 7,
                name: "فريكة",
                description: "فريكة جنين الشهية من مطعم الشيخ بالدجاج واللحم",
                basePrice: 5,
                category: "sudor",
                image: "picturesfood/freke.jpg",
                meatType: "دجاج",
                meatOptions: [
                    { type: "دجاج", image: "picturesfood/freke.jpg", priceMultiplier: 1 },
                    { type: "لحم", image: "picturesfood/freke.jpg", priceMultiplier: 1.5 }
                ],
                quantityOptions: [
                    { label: "سدر دجاجة", value: "سدر دجاجة", price: 8 },
                    { label: "دجاجة ونص", value: "دجاجة ونص", price: 12 },
                    { label: "دجاجتين", value: "دجاجتين", price: 15 },
                    { label: "دجاجتين ونص", value: "دجاجتين ونص", price: 18 },
                    { label: "ثلاث دجاجات", value: "ثلاث دجاجات", price: 22 }
                ],
                meatQuantityOptions: [
                    { label: "1 كيلو", value: "1 كيلو", price: 13 },
                    { label: "كيلو ونص", value: "كيلو ونص", price: 21 },
                    { label: "2 كيلو", value: "2 كيلو", price: 25 },
                    { label: "2 كيلو ونص", value: "2 كيلو ونص", price: 28 },
                    { label: "3 كيلو", value: "3 كيلو", price: 32 }
                ]
            }
        ];
        localStorage.setItem(STORAGE_KEYS.MENU_DATA, JSON.stringify(defaultMenuData));
    }
}

// Initialize on load
initializeDefaultData();

// ========== MENU DATA FUNCTIONS ==========
function getMenuData() {
    const data = localStorage.getItem(STORAGE_KEYS.MENU_DATA);
    return data ? JSON.parse(data) : [];
}

function saveMenuData(data) {
    localStorage.setItem(STORAGE_KEYS.MENU_DATA, JSON.stringify(data));
}

function getCategories() {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
}

function saveCategories(data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
}

// ========== ADMIN SECTION NAVIGATION ==========
function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (sectionId === 'menu-management') {
        loadMenuItems();
    } else if (sectionId === 'categories') {
        loadCategories();
    }
}

// ========== FILTER MENU ITEMS ==========
let currentMenuFilter = 'all';
function filterMenuItems(category) {
    currentMenuFilter = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    loadMenuItems();
}

// ========== LOAD MENU ITEMS ==========
function loadMenuItems() {
    const menuData = getMenuData();
    const categories = getCategories();
    const grid = document.getElementById('adminMenuItems');
    const categoryFilterButtons = document.getElementById('categoryFilterButtons');
    
    if (!grid) return;
    
    // Update category filter buttons
    if (categoryFilterButtons) {
        categoryFilterButtons.innerHTML = categories.map(cat => 
            `<button class="filter-btn ${currentMenuFilter === cat.value ? 'active' : ''}" onclick="filterMenuItems('${cat.value}')">${cat.name}</button>`
        ).join('');
    }
    
    const filteredItems = currentMenuFilter === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentMenuFilter);
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">لا توجد عناصر</p>';
        return;
    }
    
    grid.innerHTML = filteredItems.map(item => {
        const category = categories.find(cat => cat.value === item.category);
        return `
            <div class="admin-item-card">
                <img src="${item.image}" alt="${item.name}" class="admin-item-image">
                <div class="admin-item-content">
                    <div class="admin-item-header">
                        <h3 class="admin-item-name">${item.name}</h3>
                        <span class="admin-item-category">${category ? category.name : item.category}</span>
                    </div>
                    <p class="admin-item-description">${item.description}</p>
                    <div class="admin-item-price">من ${item.basePrice} دينار</div>
                    <div class="admin-item-actions">
                        <button class="edit-btn" onclick="editMenuItem(${item.id})">تعديل</button>
                        <button class="delete-btn" onclick="deleteMenuItem(${item.id})">حذف</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== LOAD CATEGORIES ==========
function loadCategories() {
    const categories = getCategories();
    const list = document.getElementById('categoriesList');
    
    if (!list) return;
    
    if (categories.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">لا توجد فئات</p>';
        return;
    }
    
    list.innerHTML = categories.map(cat => `
        <div class="category-card">
            <div class="category-info">
                <h3>${cat.name}</h3>
                <p>${cat.value}</p>
            </div>
            <div class="category-actions">
                <button class="edit-btn" onclick="editCategory(${cat.id})">تعديل</button>
                <button class="delete-btn" onclick="deleteCategory(${cat.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

// ========== MODAL FUNCTIONS ==========
function openAddItemModal() {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    const modalTitle = document.getElementById('itemModalTitle');
    
    if (!modal || !form) return;
    
    modalTitle.textContent = 'إضافة صنف جديد';
    form.reset();
    document.getElementById('itemId').value = '';
    document.getElementById('chickenPreview').innerHTML = '';
    document.getElementById('meatPreview').innerHTML = '';
    
    const categories = getCategories();
    const categorySelect = document.getElementById('itemCategory');
    if (categorySelect) {
        categorySelect.innerHTML = categories.map(cat => 
            `<option value="${cat.value}">${cat.name}</option>`
        ).join('');
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeItemModal() {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function editMenuItem(itemId) {
    const menuData = getMenuData();
    const item = menuData.find(i => i.id === itemId);
    
    if (!item) return;
    
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('itemModalTitle');
    
    modalTitle.textContent = 'تعديل الصنف';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemBasePrice').value = item.basePrice;
    document.getElementById('itemCategory').value = item.category;
    
    if (item.image) {
        document.getElementById('chickenPreview').innerHTML = `<img src="${item.image}" alt="Chicken">`;
    }
    if (item.meatOptions && item.meatOptions[1] && item.meatOptions[1].image) {
        document.getElementById('meatPreview').innerHTML = `<img src="${item.meatOptions[1].image}" alt="Meat">`;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function deleteMenuItem(itemId) {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
    
    let menuData = getMenuData();
    menuData = menuData.filter(item => item.id !== itemId);
    saveMenuData(menuData);
    loadMenuItems();
    
    alert('تم حذف الصنف بنجاح');
}

function openAddCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('categoryModalTitle');
    
    if (!modal || !form) return;
    
    modalTitle.textContent = 'إضافة فئة جديدة';
    form.reset();
    document.getElementById('categoryId').value = '';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function editCategory(categoryId) {
    const categories = getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) return;
    
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('categoryModalTitle');
    
    modalTitle.textContent = 'تعديل الفئة';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryValue').value = category.value;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function deleteCategory(categoryId) {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    
    let categories = getCategories();
    categories = categories.filter(cat => cat.id !== categoryId);
    saveCategories(categories);
    loadCategories();
    
    alert('تم حذف الفئة بنجاح');
}

function previewImage(event, previewId) {
    const preview = document.getElementById(previewId);
    const file = event.target.files[0];
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function addChickenQuantityRow() {
    const container = document.getElementById('chickenQuantityOptions');
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'quantity-option-row';
    row.innerHTML = `
        <input type="text" placeholder="اسم الخيار" class="chicken-qty-label">
        <input type="text" placeholder="القيمة" class="chicken-qty-value">
        <input type="number" placeholder="السعر" step="0.5" class="chicken-qty-price">
        <button type="button" onclick="removeQuantityRow(this)">❌</button>
    `;
    container.appendChild(row);
}

function addMeatQuantityRow() {
    const container = document.getElementById('meatQuantityOptions');
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'quantity-option-row';
    row.innerHTML = `
        <input type="text" placeholder="اسم الخيار" class="meat-qty-label">
        <input type="text" placeholder="القيمة" class="meat-qty-value">
        <input type="number" placeholder="السعر" step="0.5" class="meat-qty-price">
        <button type="button" onclick="removeQuantityRow(this)">❌</button>
    `;
    container.appendChild(row);
}

function removeQuantityRow(button) {
    button.parentElement.remove();
}

function saveMenuItem() {
    const itemId = document.getElementById('itemId').value;
    const menuData = getMenuData();
    
    const chickenRows = document.querySelectorAll('#chickenQuantityOptions .quantity-option-row');
    const chickenQuantityOptions = Array.from(chickenRows).map(row => ({
        label: row.querySelector('.chicken-qty-label').value,
        value: row.querySelector('.chicken-qty-value').value,
        price: parseFloat(row.querySelector('.chicken-qty-price').value) || 0
    })).filter(opt => opt.label && opt.value);
    
    const meatRows = document.querySelectorAll('#meatQuantityOptions .quantity-option-row');
    const meatQuantityOptions = Array.from(meatRows).map(row => ({
        label: row.querySelector('.meat-qty-label').value,
        value: row.querySelector('.meat-qty-value').value,
        price: parseFloat(row.querySelector('.meat-qty-price').value) || 0
    })).filter(opt => opt.label && opt.value);
    
    const chickenPreview = document.querySelector('#chickenPreview img');
    const meatPreview = document.querySelector('#meatPreview img');
    
    const chickenImage = chickenPreview ? chickenPreview.src : 'picturesfood/default.jpg';
    const meatImage = meatPreview ? meatPreview.src : chickenImage;
    
    const newItem = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        basePrice: parseFloat(document.getElementById('itemBasePrice').value),
        category: document.getElementById('itemCategory').value,
        image: chickenImage,
        meatType: "دجاج",
        meatOptions: [
            { type: "دجاج", image: chickenImage, priceMultiplier: 1 },
            { type: "لحم", image: meatImage, priceMultiplier: 1.5 }
        ],
        quantityOptions: chickenQuantityOptions,
        meatQuantityOptions: meatQuantityOptions
    };
    
    if (itemId) {
        const index = menuData.findIndex(item => item.id === parseInt(itemId));
        if (index !== -1) {
            menuData[index] = { ...menuData[index], ...newItem };
        }
    } else {
        const newId = menuData.length > 0 ? Math.max(...menuData.map(item => item.id)) + 1 : 1;
        newItem.id = newId;
        menuData.push(newItem);
    }
    
    saveMenuData(menuData);
    closeItemModal();
    loadMenuItems();
    
    alert(itemId ? 'تم تحديث الصنف بنجاح' : 'تم إضافة الصنف بنجاح');
}

function saveCategory() {
    const categoryId = document.getElementById('categoryId').value;
    const categories = getCategories();
    
    const newCategory = {
        name: document.getElementById('categoryName').value,
        value: document.getElementById('categoryValue').value
    };
    
    if (categoryId) {
        const index = categories.findIndex(cat => cat.id === parseInt(categoryId));
        if (index !== -1) {
            categories[index] = { ...categories[index], ...newCategory };
        }
    } else {
        const newId = categories.length > 0 ? Math.max(...categories.map(cat => cat.id)) + 1 : 1;
        newCategory.id = newId;
        categories.push(newCategory);
    }
    
    saveCategories(categories);
    closeCategoryModal();
    loadCategories();
    
    alert(categoryId ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMenuItem();
        });
    }
    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategory();
        });
    }
});

// Close modals on outside click
window.onclick = function(event) {
    const itemModal = document.getElementById('itemModal');
    const categoryModal = document.getElementById('categoryModal');
    
    if (event.target === itemModal) {
        closeItemModal();
    }
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
};

// ========== EXPORT MENU FILE ==========
function exportMenuFile() {
    const menuData = getMenuData();
    
    if (menuData.length === 0) {
        alert('لا توجد بيانات لتصديرها');
        return;
    }
    
    // Generate food-menu.js file content
    const fileContent = `// Food Menu Data - Load from localStorage (managed by admin)
function getFoodItems() {
    const data = localStorage.getItem('menu_data');
    if (data) {
        return JSON.parse(data);
    }
    // Return default data if not available
    return ${JSON.stringify(menuData, null, 8)};
}

// Initialize menu data in localStorage if not exists
function initMenuData() {
    if (!localStorage.getItem('menu_data')) {
        const defaultData = getFoodItems();
        localStorage.setItem('menu_data', JSON.stringify(defaultData));
    }
}

// Initialize on load
initMenuData();

const foodItems = getFoodItems();

// Cart Management
let cart = [];
let currentFilter = 'all';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderFoodItems();
    updateCartDisplay();
});

// Filter food items by category
function filterCategory(category) {
    currentFilter = category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderFoodItems();
}

// Render food items
function renderFoodItems() {
    const grid = document.getElementById('foodItemsGrid');
    const foodItems = getFoodItems(); // Get fresh data
    const filteredItems = currentFilter === 'all' 
        ? foodItems 
        : foodItems.filter(item => item.category === currentFilter);
    
    grid.innerHTML = filteredItems.map(item => \`
        <div class="food-item" data-id="\${item.id}">
            <img src="\${item.image}" alt="\${item.name}" class="food-item-image" loading="lazy">
            <div class="food-item-content">
                <h3 class="food-item-name">\${item.name}</h3>
                <p class="food-item-description">\${item.description}</p>
                <div class="food-item-price">من \${item.basePrice} دينار</div>
                
                <div class="meat-selection">
                    <label>نوع السدر:</label>
                    <div class="meat-options">
                        <button class="meat-btn active" data-type="دجاج" onclick="selectMeatType(\${item.id}, 'دجاج')">دجاج</button>
                        <button class="meat-btn" data-type="لحم" onclick="selectMeatType(\${item.id}, 'لحم')">لحم</button>
                    </div>
                </div>
                
                <div class="quantity-selection">
                    <label for="quantity-\${item.id}">اختر الكمية:</label>
                    <select id="quantity-\${item.id}" onchange="updateItemQuantity(\${item.id})">
                        <option value="">اختر الكمية</option>
                        <div id="quantity-options-\${item.id}">
                            \${item.quantityOptions.map(option => 
                                \`<option value="\${option.value}" data-price="\${option.price}">\${option.label} - \${option.price} دينار</option>\`
                            ).join('')}
                        </div>
                    </select>
                </div>
                
                <div class="food-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(\${item.id})" disabled>-</button>
                        <span class="quantity-display" id="qty-\${item.id}">0</span>
                        <button class="quantity-btn" onclick="increaseQuantity(\${item.id})" disabled>+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(\${item.id})" disabled>
                        أضف للسلة
                    </button>
                </div>
            </div>
        </div>
    \`).join('');
}

// Select meat type
function selectMeatType(itemId, meatType) {
    const foodItems = getFoodItems();
    const item = foodItems.find(item => item.id === itemId);
    const meatButtons = document.querySelectorAll(\`[data-id="\${itemId}"] .meat-btn\`);
    const quantitySelect = document.getElementById(\`quantity-\${itemId}\`);
    const quantityOptionsDiv = document.getElementById(\`quantity-options-\${itemId}\`);
    
    // Update active button
    meatButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === meatType) {
            btn.classList.add('active');
        }
    });
    
    // Update image
    const meatOption = item.meatOptions.find(option => option.type === meatType);
    const foodImage = document.querySelector(\`[data-id="\${itemId}"] .food-item-image\`);
    foodImage.src = meatOption.image;
    
    // Update quantity options
    const options = meatType === 'دجاج' ? item.quantityOptions : item.meatQuantityOptions;
    const optionsHTML = options.map(option => 
        \`<option value="\${option.value}" data-price="\${option.price}">\${option.label} - \${option.price} دينار</option>\`
    ).join('');
    
    // Update the select element with new options
    quantitySelect.innerHTML = '<option value="">اختر الكمية</option>' + optionsHTML;
    
    // Reset quantity selection
    quantitySelect.selectedIndex = 0;
    
    // Update item in cart if exists
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
        cartItem.meatType = meatType;
        cartItem.selectedQuantity = '';
        // Update price based on new meat type
        const meatOption = item.meatOptions.find(option => option.type === meatType);
        cartItem.basePrice = meatOption.price;
        cartItem.price = 0;
        cartItem.quantity = 0;
    }
    
    updateQuantityDisplay(itemId);
    updateCartDisplay();
    updateAddToCartButton(itemId);
}

// Update item quantity selection
function updateItemQuantity(itemId) {
    const select = document.getElementById(\`quantity-\${itemId}\`);
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const foodItems = getFoodItems();
        const item = foodItems.find(item => item.id === itemId);
        const selectedQuantity = selectedOption.value;
        const selectedPrice = parseFloat(selectedOption.dataset.price);
        const activeMeatBtn = document.querySelector(\`[data-id="\${itemId}"] .meat-btn.active\`);
        const meatType = activeMeatBtn ? activeMeatBtn.dataset.type : 'دجاج';
        
        // Update or add to cart
        const cartItem = cart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.selectedQuantity = selectedQuantity;
            cartItem.price = selectedPrice;
            cartItem.meatType = meatType;
        } else {
            cart.push({
                ...item,
                selectedQuantity: selectedQuantity,
                price: selectedPrice,
                meatType: meatType,
                quantity: 1
            });
        }
        
        updateQuantityDisplay(itemId);
        updateCartDisplay();
        updateAddToCartButton(itemId);
    }
}

// Increase quantity
function increaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    
    if (cartItem && cartItem.selectedQuantity) {
        cartItem.quantity++;
        updateQuantityDisplay(itemId);
        updateCartDisplay();
    }
}

// Decrease quantity
function decreaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    
    if (cartItem && cartItem.selectedQuantity) {
        cartItem.quantity--;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== itemId);
            // Reset select
            const select = document.getElementById(\`quantity-\${itemId}\`);
            select.selectedIndex = 0;
            // Reset meat selection to default (دجاج)
            const meatButtons = document.querySelectorAll(\`[data-id="\${itemId}"] .meat-btn\`);
            meatButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === 'دجاج') {
                    btn.classList.add('active');
                }
            });
            // Reset to chicken image and options
            selectMeatType(itemId, 'دجاج');
        }
    }
    
    updateQuantityDisplay(itemId);
    updateCartDisplay();
    updateAddToCartButton(itemId);
}

// Update quantity display
function updateQuantityDisplay(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    const quantityDisplay = document.getElementById(\`qty-\${itemId}\`);
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

// Update add to cart button
function updateAddToCartButton(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    const addBtn = document.querySelector(\`[data-id="\${itemId}"] .add-to-cart-btn\`);
    
    if (cartItem && cartItem.selectedQuantity) {
        addBtn.disabled = false;
        addBtn.textContent = 'أضف للسلة';
    } else {
        addBtn.disabled = true;
        addBtn.textContent = 'اختر الكمية أولاً';
    }
}

// Add to cart
function addToCart(itemId) {
    increaseQuantity(itemId);
}

// Update cart display
function updateCartDisplay() {
    const cartSection = document.getElementById('cartSection');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const totalPrice = document.getElementById('totalPrice');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Show/hide cart
    if (cart.length > 0) {
        cartSection.classList.add('visible');
    } else {
        cartSection.classList.remove('visible');
    }
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => \`
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">\${item.name} (\${item.meatType})</div>
                    <div class="cart-item-details">\${item.selectedQuantity} • \${item.quantity}x</div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-price">\${item.price * item.quantity} دينار</div>
                    <button class="remove-item-btn" onclick="removeFromCart(\${item.id})" title="إزالة">×</button>
                </div>
            </div>
        \`).join('');
        checkoutBtn.disabled = false;
    }
    
    // Update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = \`\${total} دينار\`;
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    // Reset select
    const select = document.getElementById(\`quantity-\${itemId}\`);
    if (select) {
        select.selectedIndex = 0;
    }
    // Reset meat selection to default (دجاج)
    const meatButtons = document.querySelectorAll(\`[data-id="\${itemId}"] .meat-btn\`);
    meatButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === 'دجاج') {
            btn.classList.add('active');
        }
    });
    // Reset to chicken image and options
    selectMeatType(itemId, 'دجاج');
    updateQuantityDisplay(itemId);
    updateCartDisplay();
    updateAddToCartButton(itemId);
}

// Checkout
function checkout() {
    if (cart.length === 0) return;
    
    const modal = document.getElementById('customerInfoModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
        console.log('Started Checkout Process');
}

// Close customer modal
function closeCustomerModal() {
    const modal = document.getElementById('customerInfoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('customerInfoForm');
    form.reset();
}

// Show order confirmation modal
function showOrderConfirmation() {
    const modal = document.getElementById('orderConfirmationModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close order confirmation modal
function closeOrderConfirmation() {
    const modal = document.getElementById('orderConfirmationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Submit order
async function submitOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate phone number
    const phoneNumber = formData.get('phoneNumber');
    if (!phoneNumber || phoneNumber.trim() === '') {
        alert('رقم الهاتف مطلوب! يرجى إدخال رقم هاتف صحيح');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    if (phoneNumber.length < 9 || phoneNumber.length > 10) {
        alert('يرجى إدخال رقم هاتف صحيح (9-10 أرقام)');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    // Check if phone number contains only digits
    if (!/^\\d+$/.test(phoneNumber)) {
        alert('رقم الهاتف يجب أن يحتوي على أرقام فقط');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    // Format phone number (remove leading 0 if present and add +962)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
        formattedPhone = phoneNumber.substring(1);
    }
    
    const orderData = {
        customerName: formData.get('customerName'),
        phoneNumber: '+962' + formattedPhone,
        deliveryAddress: formData.get('deliveryAddress') || 'لا يوجد عنوان',
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            selectedQuantity: item.selectedQuantity,
            meatType: item.meatType,
            price: item.price,
            total: item.price * item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Validate required fields
    if (!orderData.customerName || !orderData.phoneNumber) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';
    
    try {
        // Create order message for Telegram
        const itemsList = orderData.items.map(item => 
            \`• \${item.name} (\${item.meatType}) - \${item.selectedQuantity} × \${item.quantity} = \${item.total} دينار\`
        ).join('\\n');
        
        const orderMessage = \`
🍽️ <b>طلب جديد من الموقع</b>

👤 <b>اسم العميل:</b> \${orderData.customerName}
📞 <b>رقم الهاتف:</b> \${orderData.phoneNumber}
📍 <b>عنوان التوصيل:</b> \${orderData.deliveryAddress}

📋 <b>تفاصيل الطلب:</b>
\${itemsList}

💰 <b>المجموع الكلي:</b> \${orderData.totalAmount} دينار

📅 <b>وقت الطلب:</b> \${new Date().toLocaleString('ar-JO')}
        \`.trim();
        
        // Send to Telegram
        const response = await sendToTelegram({ 
            type: 'food_order', 
            message: orderMessage,
            orderData: orderData
        });
        
        if (response) {
            // Success - Show confirmation modal
            showOrderConfirmation();
            closeCustomerModal();
            
            // Clear cart
            cart = [];
            updateCartDisplay();
            renderFoodItems();
            
            console.log('Food Order Submitted Successfully');
        } else {
            throw new Error('Failed to send order');
        }
        
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.');
        console.log('Food Order Submission Failed');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'إرسال الطلب';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const customerModal = document.getElementById('customerInfoModal');
    if (event.target === customerModal) {
        closeCustomerModal();
    }
}

// Initialize form submission
document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customerInfoForm');
    if (customerForm) {
        customerForm.addEventListener('submit', submitOrder);
    }
});
`;
    
    // Create blob and download
    const blob = new Blob([fileContent], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-menu.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ تم تصدير ملف food-menu.js بنجاح!\n\n📝 الخطوات:\n1. حمّل الملف (food-menu.js)\n2. اذهب لـ GitHub repository\n3. استبدل ملف food-menu.js القديم\n4. Commit التغييرات\n5. انتظر 1-2 دقيقة\n6. ✅ جميع الزوار يشوفون التعديلات!');
}

// ========== INITIALIZE DASHBOARD ==========
document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on a protected page
    const protectedPages = ['admin-dashboard.html', 'admin-ramadan.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        // For now, skip authentication check if using old system
        // Uncomment below when Worker is ready:
        /*
        const isLoggedIn = await isAdminLoggedIn();
        if (!isLoggedIn) {
            window.location.href = 'admin.html';
            return;
        }
        */
        
        // Show current admin user
        const user = getCurrentAdmin();
        if (user) {
            console.log('Logged in as:', user.username);
        }
    }
    
    // Load initial data
    initializeDefaultData();
    
    if (document.getElementById('adminMenuItems')) {
        loadMenuItems();
    }
    if (document.getElementById('categoriesList')) {
        loadCategories();
    }
});

