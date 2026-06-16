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

// ===== АНИМАЦИЯ ПРИ ПРОКРУТКЕ =====
function initScrollAnimations() {
    const elements = document.querySelectorAll('.stat-item, .advantage-card, .team-card, .license-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
    initScrollAnimations();
    
    // Кнопка заказа звонка
    const callButton = document.getElementById('callButton');
    if (callButton) {
        callButton.addEventListener('click', () => {
            window.cart.showNotification('Спасибо! Мы перезвоним вам в ближайшее время.');
        });
    }
    
    // Ссылки для скачивания PDF (можно добавить реальные файлы)
    document.querySelectorAll('.btn-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.cart.showNotification('Функция скачивания будет доступна в ближайшее время.', 'info');
        });
    });
    
});