const API_URL = 'http://localhost:3000/api';

// ===== ПРОВЕРКА АДМИНА =====
let currentUser = null;

async function checkAdminAccess() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showLoginForm();
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            if (currentUser.role === 'admin') {
                document.getElementById('logoutBtn').style.display = 'block';
                loadAdminDashboard();
                return true;
            } else {
                showAccessDenied();
                return false;
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLoginForm();
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки:', error);
        showLoginForm();
        return false;
    }
}

function showAccessDenied() {
    const panel = document.getElementById('adminPanel');
    panel.innerHTML = `
        <div class="admin-login">
            <div class="login-card">
                <i class="fas fa-ban" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
                <h2>Доступ запрещён</h2>
                <p>У вас нет прав администратора.</p>
                <a href="index.html" class="btn-primary" style="display: inline-block; margin-top: 20px;">
                    <i class="fas fa-home"></i> На главную
                </a>
            </div>
        </div>
    `;
}

function showLoginForm() {
    const panel = document.getElementById('adminPanel');
    panel.innerHTML = `
        <div class="admin-login">
            <div class="login-card">
                <i class="fas fa-lock" style="font-size: 48px; color: #2a7f62; margin-bottom: 20px;"></i>
                <h2>Вход в админ-панель</h2>
                <p>Войдите под своей учётной записью</p>
                <div class="form-group">
                    <label>Имя пользователя или Email</label>
                    <input type="text" id="adminUsername" placeholder="admin">
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="adminPassword" placeholder="••••••">
                </div>
                <button id="loginBtn" class="btn-primary" style="width: 100%;">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </button>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                    <i class="fas fa-info-circle"></i> Только для администратора
                </p>
            </div>
        </div>
    `;
    
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    
    const handleLogin = async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        if (!username || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: username, password })
            });
            
            const data = await response.json();
            
            if (data.success && data.user.role === 'admin') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showNotification('Добро пожаловать в админ-панель!', 'success');
                checkAdminAccess();
            } else {
                showNotification('Неверные данные или недостаточно прав', 'error');
                passwordInput.value = '';
            }
        } catch (error) {
            showNotification('Ошибка подключения к серверу', 'error');
        }
    };
    
    loginBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `add-notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Вы вышли из админ-панели', 'info');
    showLoginForm();
    document.getElementById('logoutBtn').style.display = 'none';
}

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadAdminDashboard() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    
    panel.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Загрузка данных...</div>';
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/medicines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const medicines = await response.json();
        
        // Подсчёт статистики
        const categories = new Set();
        const inStock = medicines.filter(m => m.in_stock).length;
        medicines.forEach(m => categories.add(m.category));
        
        panel.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-user-shield"></i> Админ-панель</h2>
                <button id="addMedicineBtn" class="btn-primary">
                    <i class="fas fa-plus"></i> Добавить лекарство
                </button>
            </div>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <i class="fas fa-pills"></i>
                    <div class="stat-number">${medicines.length}</div>
                    <div class="stat-label">Всего товаров</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tags"></i>
                    <div class="stat-number">${categories.size}</div>
                    <div class="stat-label">Категорий</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-check-circle"></i>
                    <div class="stat-number">${inStock}</div>
                    <div class="stat-label">В наличии</div>
                </div>
            </div>
            
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr><th>ID</th><th>Название</th><th>Цена</th><th>Категория</th><th>Наличие</th><th>Действия</th></tr>
                    </thead>
                    <tbody>
                        ${medicines.map(med => `
                            <tr>
                                <td>${med.id}</td>
                                <td><strong>${escapeHtml(med.name)}</strong></td>
                                <td>${med.price} сом</td>
                                <td><span class="category-badge">${med.category}</span></td>
                                <td><span class="stock-badge ${med.in_stock ? 'in-stock' : 'out-stock'}">${med.in_stock ? 'В наличии' : 'Нет в наличии'}</span></td>
                                <td>
                                    <button class="edit-btn btn-sm" data-id="${med.id}" title="Редактировать"><i class="fas fa-edit"></i></button>
                                    <button class="delete-btn btn-sm" data-id="${med.id}" title="Удалить"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('addMedicineBtn')?.addEventListener('click', () => showMedicineModal());
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editMedicine(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMedicine(parseInt(btn.dataset.id)));
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        panel.innerHTML = `
            <div class="admin-login">
                <div class="login-card">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
                    <h3>Ошибка загрузки данных</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn-primary">Попробовать снова</button>
                </div>
            </div>
        `;
    }
}

// ===== CRUD ОПЕРАЦИИ =====
async function addMedicine(medicineData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/medicines`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicineData)
    });
    if (!response.ok) throw new Error('Ошибка добавления');
    return await response.json();
}

async function updateMedicine(id, medicineData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicineData)
    });
    if (!response.ok) throw new Error('Ошибка обновления');
    return await response.json();
}

async function deleteMedicineById(id) {
    if (!confirm('Вы уверены, что хотите удалить это лекарство?')) return false;
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Ошибка удаления');
    return true;
}

async function editMedicine(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/medicines/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const medicine = await response.json();
    showMedicineModal(medicine);
}

async function deleteMedicine(id) {
    try {
        await deleteMedicineById(id);
        showNotification('Лекарство удалено!', 'success');
        loadAdminDashboard();
    } catch (error) {
        showNotification('Ошибка удаления: ' + error.message, 'error');
    }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function showMedicineModal(medicine = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const isEdit = !!medicine;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? 'Редактировать' : 'Добавить'} лекарство</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="medicineForm">
                    <div class="form-group">
                        <label>Название *</label>
                        <input type="text" name="name" required value="${escapeHtml(medicine?.name || '')}">
                    </div>
                    <div class="form-group">
                        <label>Описание *</label>
                        <textarea name="description" rows="3" required>${escapeHtml(medicine?.description || '')}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Цена (сом) *</label>
                            <input type="number" name="price" step="0.01" required value="${medicine?.price || ''}">
                        </div>
                        <div class="form-group">
                            <label>Категория *</label>
                            <select name="category" required>
                                <option value="painkillers" ${medicine?.category === 'painkillers' ? 'selected' : ''}>Обезболивающие</option>
                                <option value="vitamins" ${medicine?.category === 'vitamins' ? 'selected' : ''}>Витамины</option>
                                <option value="cold" ${medicine?.category === 'cold' ? 'selected' : ''}>От простуды</option>
                                <option value="children" ${medicine?.category === 'children' ? 'selected' : ''}>Детские</option>
                                <option value="medical" ${medicine?.category === 'medical' ? 'selected' : ''}>Медтехника</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Производитель</label>
                        <input type="text" name="manufacturer" value="${escapeHtml(medicine?.manufacturer || '')}">
                    </div>
                    <div class="form-group">
                        <label>Бейдж (Хит, Акция, Популярное)</label>
                        <input type="text" name="badge" value="${escapeHtml(medicine?.badge || '')}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Иконка (Font Awesome)</label>
                            <input type="text" name="icon" value="${escapeHtml(medicine?.icon || 'fa-tablets')}">
                            <small>fa-tablets, fa-pills, fa-capsules, fa-baby и т.д.</small>
                        </div>
                        <div class="form-group">
                            <label>URL фото</label>
                            <input type="text" name="image_url" id="imageUrlInput" value="${escapeHtml(medicine?.image_url || '')}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group checkbox">
                            <label><input type="checkbox" name="in_stock" ${medicine?.in_stock !== false ? 'checked' : ''}> В наличии</label>
                        </div>
                        <div class="form-group checkbox">
                            <label><input type="checkbox" name="prescription" ${medicine?.prescription ? 'checked' : ''}> Требуется рецепт</label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="cancelModal">Отмена</button>
                <button class="btn-primary" id="saveMedicine">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('#cancelModal')?.addEventListener('click', closeModal);
    
    modal.querySelector('#saveMedicine')?.addEventListener('click', async () => {
        const form = modal.querySelector('#medicineForm');
        const formData = new FormData(form);
        
        const medicineData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            manufacturer: formData.get('manufacturer') || null,
            badge: formData.get('badge') || null,
            icon: formData.get('icon') || 'fa-tablets',
            image_url: formData.get('image_url') || null,
            in_stock: formData.get('in_stock') === 'on',
            prescription: formData.get('prescription') === 'on'
        };
        
        try {
            if (isEdit) {
                await updateMedicine(medicine.id, medicineData);
                showNotification('Лекарство обновлено!', 'success');
            } else {
                await addMedicine(medicineData);
                showNotification('Лекарство добавлено!', 'success');
            }
            closeModal();
            loadAdminDashboard();
        } catch (error) {
            showNotification('Ошибка: ' + error.message, 'error');
        }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    checkAdminAccess();
});