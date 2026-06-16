// ===== КЛАСС КОРЗИНЫ =====
class Cart {
    constructor() {
        this.items = [];
        this.loadCart();
        this.updateCartCount();
    }
    
    loadCart() {
        try {
            const savedCart = localStorage.getItem('arashanCart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch(e) {}
    }
    
    saveCart() {
        localStorage.setItem('arashanCart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
    }
    
    updateCartCount() {
        const cartCounters = document.querySelectorAll('.cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCounters.forEach(counter => {
            if (counter) counter.textContent = totalItems;
        });
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `add-notification ${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

const cart = new Cart();

// ===== ФОРМА ОБРАТНОЙ СВЯЗИ =====
const form = document.getElementById('feedbackForm');
const successMsg = document.getElementById('successMessage');
const errorMsg = document.getElementById('errorMessage');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем значения
        const name = document.getElementById('userName')?.value.trim();
        const phone = document.getElementById('userPhone')?.value.trim();
        const email = document.getElementById('userEmail')?.value.trim();
        const subject = document.getElementById('subject')?.value;
        const message = document.getElementById('message')?.value.trim();
        
        // Простая валидация
        if (!name || !phone || !subject || !message) {
            errorMsg.style.display = 'block';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 3000);
            return;
        }
        
        // Здесь можно отправить данные на сервер
        // Для демонстрации просто показываем успех
        
        // Показываем успех
        successMsg.style.display = 'block';
        cart.showNotification('Сообщение отправлено! Мы свяжемся с вами.', 'success');
        
        // Очищаем форму
        form.reset();
        
        // Скрываем сообщение через 5 секунд
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    });
}

// ===== КНОПКА ЗВОНКА =====
const callButton = document.getElementById('callButton');
if (callButton) {
    callButton.addEventListener('click', () => {
        cart.showNotification('Спасибо! Мы перезвоним вам в ближайшее время.', 'info');
    });
}

// ===== ОБНОВЛЕНИЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ =====
function updateUserMenu() {
    const token = localStorage.getItem('token');
    const userMenuContainer = document.querySelector('.header-actions');
    if (!userMenuContainer) return;
    
    // Проверяем, есть ли уже меню пользователя
    const existingUserMenu = document.getElementById('userMenu');
    if (existingUserMenu) return;
    
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userMenu = document.createElement('div');
        userMenu.id = 'userMenu';
        userMenu.style.display = 'inline-block';
        userMenu.innerHTML = `
            <a href="profile.html" style="text-decoration:none;color:#1e2b3c;margin-right:15px;">
                <i class="fas fa-user"></i> ${user.full_name || user.username || 'Профиль'}
            </a>
            <button id="logoutBtnHeader" style="background:none;border:none;color:#dc3545;cursor:pointer;">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        // Вставляем перед cart-link
        const cartLink = userMenuContainer.querySelector('.cart-link');
        if (cartLink) {
            userMenuContainer.insertBefore(userMenu, cartLink);
        } else {
            userMenuContainer.prepend(userMenu);
        }
        
        document.getElementById('logoutBtnHeader')?.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
});