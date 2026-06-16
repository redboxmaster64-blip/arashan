const API_URL = 'http://localhost:3000/api';

// Корзина
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

// Вспомогательные функции
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let imageHtml = '';
    if (product.image_url) {
        imageHtml = `<img src="${product.image_url}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\'fas ${product.icon || 'fa-tablets'}\'></i>';">`;
    } else {
        imageHtml = `<i class="fas ${product.icon || 'fa-tablets'}"></i>`;
    }
    
    card.innerHTML = `
        ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
        <div class="product-image">${imageHtml}</div>
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

// Загрузка товаров
async function loadProducts(category = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Загрузка товаров...</div>';
    
    try {
        const url = category !== 'all' ? `${API_URL}/medicines?category=${category}` : `${API_URL}/medicines`;

        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const products = await response.json();
        
        const countEl = document.getElementById('productsCount');
        if (countEl) countEl.textContent = products.length;
        
        if (products.length === 0) {
            grid.innerHTML = '<div class="no-products"><i class="fas fa-box-open"></i><h3>Товары не найдены</h3></div>';
            return;
        }
        
        grid.innerHTML = '';
        products.forEach(product => {
            grid.appendChild(createProductCard(product));
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-database"></i>
                <h3>Ошибка подключения к серверу</h3>
                <p>Убедитесь, что сервер запущен: npm start</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#2a7f62;color:white;border:none;border-radius:8px;cursor:pointer;">
                    Обновить
                </button>
            </div>
        `;
    }
}

// Поиск товаров
async function searchProducts(query) {
    if (!query.trim()) {
        loadProducts();
        return;
    }
    
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Поиск...</div>';
    
    try {
        const response = await fetch(`${API_URL}/medicines`);
        const allProducts = await response.json();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.description.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>Ничего не найдено</h3>
                    <p>По запросу "${escapeHtml(query)}" ничего не найдено</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        filtered.forEach(p => grid.appendChild(createProductCard(p)));
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

// Обновление меню пользователя
function updateUserMenu() {
    const token = localStorage.getItem('token');
    const menu = document.getElementById('userMenu');
    if (!menu) return;
    
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        menu.innerHTML = `
            <a href="profile.html" style="text-decoration:none;color:#1e2b3c;margin-right:15px;">
                <i class="fas fa-user"></i> ${user.full_name || user.username || 'Профиль'}
            </a>
            <button id="logoutBtnHeader" style="background:none;border:none;color:#dc3545;cursor:pointer;">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        document.getElementById('logoutBtnHeader')?.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    } else {
        menu.innerHTML = `<a href="login.html" class="btn-call" style="background:#2a7f62;color:white;padding:8px 20px;border-radius:30px;text-decoration:none;">Войти</a>`;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
    loadProducts();
    
    // Поиск
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput?.value || '';
            searchProducts(query);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value || '';
                searchProducts(query);
            }
        });
    }
    
    // Кнопка заказа звонка
    const callButton = document.getElementById('callButton');
    if (callButton) {
        callButton.addEventListener('click', () => {
            window.cart.showNotification('Спасибо! Мы перезвоним вам.');
        });
    }
    
    // Фильтр по категориям
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.category);
        });
    });
});