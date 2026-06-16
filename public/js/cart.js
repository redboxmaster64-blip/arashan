const API_URL = 'http://localhost:3000/api';

// Лимиты корзины
const CART_LIMITS = {
    MAX_QUANTITY_PER_ITEM: 10,      // Максимум 10 единиц одного товара
    MAX_TOTAL_ITEMS: 50,             // Максимум 50 различных товаров в корзине
    MIN_QUANTITY: 1,                 // Минимальное количество
    MAX_ORDER_AMOUNT: 500000         // Максимальная сумма заказа (500,000 сом)
};

class Cart {
    constructor() {
        this.items = [];
        this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('arashanCart');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch(e) {
            console.error('Ошибка загрузки корзины:', e);
        }
    }

    saveCart() {
        localStorage.setItem('arashanCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Проверка лимитов перед добавлением
    async checkCartLimits(product, quantity) {
        const currentTotal = this.getTotalPrice();
        const newTotal = currentTotal + (product.price * quantity);
        
        // Проверка максимальной суммы
        if (newTotal > CART_LIMITS.MAX_ORDER_AMOUNT) {
            return {
                valid: false,
                message: `Сумма заказа не может превышать ${CART_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()} сом`
            };
        }
        
        // Проверка наличия товара на складе через сервер
        try {
            const response = await fetch(`${API_URL}/medicines/${product.id}`);
            if (response.ok) {
                const dbProduct = await response.json();
                if (!dbProduct.in_stock) {
                    return {
                        valid: false,
                        message: `Товар "${product.name}" закончился на складе`
                    };
                }
                // Обновляем актуальную цену
                if (dbProduct.price !== product.price) {
                    product.price = dbProduct.price;
                }
            }
        } catch (error) {
            console.error('Ошибка проверки товара:', error);
        }
        
        return { valid: true, message: 'OK', updatedProduct: product };
    }

    // Добавление товара в корзину
    async addItem(product, quantity = 1) {
        // Проверка лимитов
        const checkResult = await this.checkCartLimits(product, quantity);
        
        if (!checkResult.valid) {
            this.showNotification(checkResult.message, 'error');
            return false;
        }
        
        // Обновляем товар актуальной ценой если нужно
        const finalProduct = checkResult.updatedProduct || product;
        
        const existing = this.items.find(i => i.id === finalProduct.id);
        
        if (existing) {
            const newQuantity = existing.quantity + quantity;
            if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
                this.showNotification(`Нельзя добавить больше ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} единиц товара "${finalProduct.name}"`, 'error');
                return false;
            }
            existing.quantity = newQuantity;
        } else {
            if (this.items.length >= CART_LIMITS.MAX_TOTAL_ITEMS) {
                this.showNotification(`Нельзя добавить больше ${CART_LIMITS.MAX_TOTAL_ITEMS} различных товаров в корзину`, 'error');
                return false;
            }
            this.items.push({ ...finalProduct, quantity: quantity });
        }
        
        this.saveCart();
        this.showNotification(`"${finalProduct.name}" добавлен в корзину`, 'success');
        return true;
    }

    // Удаление товара из корзины
    removeItem(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            this.items = this.items.filter(i => i.id !== id);
            this.saveCart();
            this.showNotification(`"${item.name}" удален из корзины`, 'info');
        }
    }

    // Обновление количества товара
    updateQuantity(id, qty) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            if (qty > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
                this.showNotification(`Нельзя установить больше ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} единиц товара`, 'error');
                return;
            }
            if (qty < CART_LIMITS.MIN_QUANTITY) {
                this.removeItem(id);
            } else {
                item.quantity = qty;
                this.saveCart();
            }
        }
    }

    // Очистка корзины
    clearCart() {
        this.items = [];
        this.saveCart();
        this.showNotification('Корзина очищена', 'info');
    }

    // Получение общего количества товаров
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Получение общей суммы заказа
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Получение всех товаров
    getItems() {
        return this.items;
    }

    // Обновление счетчика корзины на всех страницах
    updateCartCount() {
        const total = this.getTotalItems();
        document.querySelectorAll('.cart-count').forEach(counter => {
            if (counter) counter.textContent = total;
        });
    }

    // Показ уведомления
    showNotification(msg, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `add-notification ${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${msg}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'info' ? '#17a2b8' : '#2a7f62'};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Оформление заказа
    async checkout(customerData) {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showNotification('Пожалуйста, войдите в аккаунт', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return false;
        }

        // Проверка лимитов перед оформлением
        if (this.items.length === 0) {
            this.showNotification('Корзина пуста', 'error');
            return false;
        }

        if (this.items.length > CART_LIMITS.MAX_TOTAL_ITEMS) {
            this.showNotification(`Нельзя оформить заказ с более чем ${CART_LIMITS.MAX_TOTAL_ITEMS} различными товарами`, 'error');
            return false;
        }

        const totalAmount = this.getTotalPrice();
        
        if (totalAmount > CART_LIMITS.MAX_ORDER_AMOUNT) {
            this.showNotification(`Сумма заказа не может превышать ${CART_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()} сом`, 'error');
            return false;
        }

        // Проверка количества каждого товара
        for (const item of this.items) {
            if (item.quantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
                this.showNotification(`Нельзя заказать более ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} единиц товара "${item.name}"`, 'error');
                return false;
            }
            
            // Проверка наличия на складе
            try {
                const response = await fetch(`${API_URL}/medicines/${item.id}`);
                if (response.ok) {
                    const dbItem = await response.json();
                    if (!dbItem.in_stock) {
                        this.showNotification(`Товар "${item.name}" закончился на складе`, 'error');
                        return false;
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки товара:', error);
            }
        }

        try {
            this.showNotification('Оформление заказа...', 'info');
            
            const resp = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customer_name: customerData.name,
                    customer_phone: customerData.phone,
                    customer_email: customerData.email || '',
                    delivery_address: customerData.address || '',
                    total_amount: totalAmount,
                    items: this.items.map(i => ({
                        id: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity
                    }))
                })
            });

            const data = await resp.json();
            
            if (resp.ok) {
                this.clearCart();
                this.showNotification(`✅ Заказ №${data.orderNumber} оформлен! Мы свяжемся с вами.`, 'success');
                return true;
            } else {
                this.showNotification(data.error || '❌ Ошибка оформления заказа', 'error');
                return false;
            }
        } catch (e) {
            console.error('Ошибка оформления:', e);
            this.showNotification('❌ Ошибка подключения к серверу', 'error');
            return false;
        }
    }

    // Получение информации о лимитах
    getLimits() {
        return CART_LIMITS;
    }
}

// Создаем глобальный экземпляр корзины
window.cart = new Cart();

// Функция отображения корзины на странице cart.html
function displayCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    
    if (!container) return;
    
    const items = window.cart.getItems();
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
                <a href="index.html" class="btn-primary">Перейти в каталог</a>
            </div>
        `;
        if (summary) summary.innerHTML = '';
        return;
    }
    
    // Отображаем товары
    container.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <i class="fas ${item.icon || 'fa-tablets'}"></i>
            </div>
            <div class="cart-item-info">
                <h3>${escapeHtml(item.name)}</h3>
                <div class="cart-item-price">${item.price} сом</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">−</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">
                ${item.price * item.quantity} сом
                <button class="btn-remove" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Отображаем итоги
    const totalItems = window.cart.getTotalItems();
    const totalPrice = window.cart.getTotalPrice();
    const limits = window.cart.getLimits();
    
    summary.innerHTML = `
        <h3>Ваш заказ</h3>
        <div class="summary-row">
            <span>Товары (${totalItems} шт.)</span>
            <span>${totalPrice} сом</span>
        </div>
        <div class="summary-row">
            <span>Доставка</span>
            <span class="delivery-free">Бесплатно</span>
        </div>
        ${totalPrice > limits.MAX_ORDER_AMOUNT ? `
            <div class="summary-row" style="color: #dc3545;">
                <span>⚠️ Превышен лимит!</span>
                <span>Макс. ${limits.MAX_ORDER_AMOUNT.toLocaleString()} сом</span>
            </div>
        ` : ''}
        <div class="summary-row total">
            <span>Итого:</span>
            <span>${totalPrice} сом</span>
        </div>
        <button class="checkout-btn" id="checkoutBtn" ${totalPrice > limits.MAX_ORDER_AMOUNT ? 'disabled' : ''}>
            <i class="fas fa-credit-card"></i> Оформить заказ
        </button>
        <button class="continue-shopping" onclick="window.location.href='index.html'">
            <i class="fas fa-arrow-left"></i> Продолжить покупки
        </button>
        <div class="cart-limits-info" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #edf2f9; font-size: 12px; color: #6b7a8c;">
            <small>
                📦 Лимиты: макс. ${limits.MAX_QUANTITY_PER_ITEM} шт./товар, 
                макс. ${limits.MAX_TOTAL_ITEMS} товаров, 
                макс. сумма ${limits.MAX_ORDER_AMOUNT.toLocaleString()} сом
            </small>
        </div>
    `;
    
    // Добавляем обработчики событий
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = window.cart.getItems().find(i => i.id === id);
            if (item) {
                window.cart.updateQuantity(id, item.quantity - 1);
                displayCart();
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = window.cart.getItems().find(i => i.id === id);
            if (item && item.quantity < limits.MAX_QUANTITY_PER_ITEM) {
                window.cart.updateQuantity(id, item.quantity + 1);
                displayCart();
            } else if (item && item.quantity >= limits.MAX_QUANTITY_PER_ITEM) {
                window.cart.showNotification(`Нельзя добавить больше ${limits.MAX_QUANTITY_PER_ITEM} единиц товара`, 'error');
            }
        });
    });
    
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            window.cart.removeItem(parseInt(btn.dataset.id));
            displayCart();
        });
    });
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showCheckoutModal);
    }
}

// Функция отображения модального окна оформления заказа
function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Оформление заказа</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Ваше имя *</label>
                    <input type="text" id="customerName" required placeholder="Введите ваше имя">
                </div>
                <div class="form-group">
                    <label>Телефон *</label>
                    <input type="tel" id="customerPhone" required placeholder="+996 XXX XXX XXX">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="customerEmail" placeholder="example@mail.com">
                </div>
                <div class="form-group">
                    <label>Адрес доставки</label>
                    <textarea id="customerAddress" rows="3" placeholder="г. Бишкек, ул. ..."></textarea>
                    <small>Если не указать - самовывоз</small>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="cancelCheckout">Отмена</button>
                <button class="btn-primary" id="submitOrder">Оформить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('#cancelCheckout')?.addEventListener('click', closeModal);
    
    modal.querySelector('#submitOrder')?.addEventListener('click', async () => {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        
        if (!name || !phone) {
            window.cart.showNotification('Заполните имя и телефон', 'error');
            return;
        }
        
        const success = await window.cart.checkout({
            name: name,
            phone: phone,
            email: document.getElementById('customerEmail').value.trim(),
            address: document.getElementById('customerAddress').value.trim()
        });
        
        if (success) {
            closeModal();
            displayCart();
            // Перенаправляем на главную через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    });
}

// Функция экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обновление меню пользователя
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    } else {
        menu.innerHTML = `<a href="login.html" class="btn-call" style="background:#2a7f62;color:white;padding:8px20px;border-radius:30px;text-decoration:none;">Войти</a>`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
    
    // Если мы на странице корзины, отображаем ее
    if (document.getElementById('cartItems')) {
        displayCart();
    }
    
    // Кнопка заказа звонка
    const callButton = document.getElementById('callButton');
    if (callButton) {
        callButton.addEventListener('click', () => {
            window.cart.showNotification('Спасибо! Мы перезвоним вам в ближайшее время.', 'success');
        });
    }
    
});