const API_URL = 'http://localhost:3000/api';

// ===== КЛАСС КОРЗИНЫ =====
class Cart {
    constructor() {
        this.items = [];
        this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('arashanCart');
            if (saved) this.items = JSON.parse(saved);
        } catch (e) {}
    }

    saveCart() {
        localStorage.setItem('arashanCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.showNotification(`"${product.name}" добавлен в корзину`);
    }

    updateCartCount() {
        const total = this.items.reduce((s, i) => s + i.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(c => {
            if (c) c.textContent = total;
        });
    }

    showNotification(msg) {
        const n = document.createElement('div');
        n.className = 'add-notification';
        n.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    }
}

window.cart = new Cart();

// ===== ЗАГРУЗКА И ФИЛЬТРАЦИЯ ТОВАРОВ =====
let allProducts = [];
let currentType = 'all';
let currentForm = 'all';
let currentSort = 'name_asc';

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Загрузка витаминов...</div>';
    
    try {
        const resp = await fetch(`${API_URL}/medicines/filter?category=vitamins`);
        if (!resp.ok) throw new Error('Ошибка загрузки');
        allProducts = await resp.json();
        applyFiltersAndSort();
    } catch (e) {
        console.error('Ошибка:', e);
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-database"></i>
                <h3>Ошибка загрузки</h3>
                <p>Запустите сервер: npm start</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px20px;background:#2a7f62;color:white;border:none;border-radius:8px;cursor:pointer;">
                    Обновить
                </button>
            </div>
        `;
    }
}

function applyFiltersAndSort() {
    let filtered = [...allProducts];
    
    // Фильтр по типу витаминов
    if (currentType !== 'all') {
        filtered = filtered.filter(p => p.type === currentType);
    }
    
    // Фильтр по форме выпуска
    if (currentForm !== 'all') {
        filtered = filtered.filter(p => p.form === currentForm);
    }
    
    // Сортировка
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'name_asc':
                return a.name.localeCompare(b.name, 'ru');
            case 'name_desc':
                return b.name.localeCompare(a.name, 'ru');
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Показано ${filtered.length} товаров`;
    }
    
    const grid = document.getElementById('productsGrid');
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>Витамины не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    filtered.forEach(p => grid.appendChild(createProductCard(p)));
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const formLabels = {
        tablets: 'Таблетки',
        capsules: 'Капсулы',
        liquid: 'Жидкий',
        effervescent: 'Шипучие'
    };
    
    card.innerHTML = `
        ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
        ${product.form ? `<span class="form-badge">${formLabels[product.form] || product.form}</span>` : ''}
        <div class="product-image">
            <i class="fas ${product.icon || 'fa-heartbeat'}"></i>
        </div>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-footer">
            <div>
                <span class="product-price">${product.price} сом</span>
                <span class="in-stock">${product.in_stock ? '✅ В наличии' : '❌ Нет'}</span>
            </div>
            <button class="btn-add" data-id="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i>
            </button>
        </div>
    `;
    
    const btn = card.querySelector('.btn-add');
    if (btn && product.in_stock) {
        btn.addEventListener('click', () => {
            window.cart.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                icon: product.icon,
                in_stock: product.in_stock
            });
        });
    }
    
    return card;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ОБНОВЛЕНИЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ =====
function updateUserMenu() {
    const token = localStorage.getItem('token');
    const menu = document.getElementById('userMenu');
    if (!menu) return;
    
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        menu.innerHTML = `
            <a href="profile.html" style="margin-right:15px;color:#1e2b3c;text-decoration:none;">
                <i class="fas fa-user"></i> ${user.full_name || user.username || 'Профиль'}
            </a>
            <button id="logoutBtnHeader" style="background:none;border:none;color:#dc3545;cursor:pointer;">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        document.getElementById('logoutBtnHeader')?.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    } else {
        menu.innerHTML = `<a href="login.html" class="btn-call" style="background:#2a7f62;color:white;padding:8px20px;border-radius:30px;text-decoration:none;">Войти</a>`;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async () => {
    updateUserMenu();
    await loadProducts();
    
    // Фильтр по типу витаминов
    document.querySelectorAll('#typeFilterButtons .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#typeFilterButtons .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            applyFiltersAndSort();
        });
    });
    
    // Фильтр по форме выпуска
    document.querySelectorAll('#formFilterButtons .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#formFilterButtons .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentForm = btn.dataset.form;
            applyFiltersAndSort();
        });
    });
    
    // Сортировка
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }
    
    // Кнопка заказа звонка
    const callButton = document.getElementById('callButton');
    if (callButton) {
        callButton.addEventListener('click', () => {
            window.cart.showNotification('Спасибо! Мы перезвоним вам в ближайшее время.');
        });
    }
});