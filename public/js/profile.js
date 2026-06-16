const API_URL = 'http://localhost:3000/api';

// Проверка авторизации
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

let currentUser = null;

// Вспомогательная функция показа уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateProfileForm();
        } else {
            throw new Error('Не авторизован');
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

function updateProfileForm() {
    document.getElementById('userName').textContent = currentUser.full_name || currentUser.username;
    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileFullName').value = currentUser.full_name || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    
    const roleSpan = document.getElementById('userRole');
    if (currentUser.role === 'admin') {
        roleSpan.innerHTML = '<span class="badge badge-admin">👑 Администратор</span>';
    } else {
        roleSpan.innerHTML = '<span class="badge badge-user">👤 Пользователь</span>';
    }
    
    // Показываем кнопку админ-панели если админ
    if (currentUser.role === 'admin') {
        const userMenu = document.getElementById('userMenu');
        if (userMenu && !document.getElementById('adminLink')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'adminLink';
            adminLink.href = 'admin.html';
            adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Админ';
            adminLink.style.cssText = 'margin-right: 15px; color: #1e2b3c; text-decoration: none;';
            userMenu.insertBefore(adminLink, userMenu.firstChild);
        }
    }
}

// Обновление профиля
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        full_name: document.getElementById('profileFullName').value,
        phone: document.getElementById('profilePhone').value,
        email: document.getElementById('profileEmail').value
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Профиль успешно обновлен!', 'success');
            loadUserData();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка обновления профиля', 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
});

// Смена пароля
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmNewPassword) {
        showNotification('Новые пароли не совпадают', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Пароль успешно изменен!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showNotification(data.error || 'Ошибка смены пароля', 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
});

// Загрузка заказов
async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Загрузка заказов...</div>';
    
    try {
        const response = await fetch(`${API_URL}/auth/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const orders = await response.json();
        
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-box-open"></i>
                    <h3>У вас пока нет заказов</h3>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Заказ №${order.id}</span>
                    <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-date">📅 ${new Date(order.created_at).toLocaleString('ru-RU')}</div>
                ${order.delivery_address ? `<div class="order-address">📍 ${escapeHtml(order.delivery_address)}</div>` : ''}
                <div class="order-items">
                    ${order.items.map(item => `<div>• ${escapeHtml(item.name)} x ${item.quantity} = ${item.price * item.quantity} сом</div>`).join('')}
                </div>
                <div class="order-total">💰 Итого: ${order.total_amount} сом</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        ordersList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки заказов</h3>
            </div>
        `;
    }
}

function getStatusText(status) {
    const statuses = {
        'new': '🆕 Новый',
        'processing': '⚙️ В обработке',
        'completed': '✅ Выполнен',
        'cancelled': '❌ Отменен'
    };
    return statuses[status] || status;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {}
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Табы
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById(`${tabId}Tab`).classList.add('active');
        
        if (tabId === 'orders') {
            loadOrders();
        }
    });
});

// Обновляем счетчик корзины
function updateCartCount() {
    const savedCart = localStorage.getItem('arashanCart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounters = document.querySelectorAll('.cart-count');
    cartCounters.forEach(counter => {
        if (counter) counter.textContent = totalItems;
    });
}

// Инициализация
loadUserData();
updateCartCount();

// Обновляем счетчик при изменении корзины (если в другом окне)
window.addEventListener('storage', (e) => {
    if (e.key === 'arashanCart') {
        updateCartCount();
    }
});