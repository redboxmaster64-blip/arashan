const API_URL = 'http://localhost:3000/api';

// Обработчик формы входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
    
    // Простая валидация
    if (!usernameOrEmail || !password) {
        errorDiv.textContent = 'Пожалуйста, заполните все поля';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password, rememberMe })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем токен и данные пользователя
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Если не запоминать, можно установить sessionStorage
            if (!rememberMe) {
                // Токен будет храниться только в sessionStorage при перезагрузке страницы
                // Но для простоты оставляем в localStorage, так как это демо

            }
            
            // Перенаправляем в зависимости от роли
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            errorDiv.textContent = data.error || 'Ошибка входа. Проверьте логин и пароль.';
            errorDiv.style.display = 'block';
            document.getElementById('password').value = ''; // Очищаем поле пароля
        }
    } catch (error) {
        console.error('Ошибка:', error);
        errorDiv.textContent = 'Ошибка подключения к серверу. Убедитесь, что сервер запущен (npm start).';
        errorDiv.style.display = 'block';
    }
});

// Проверяем, есть ли уже активная сессия
const token = localStorage.getItem('token');
if (token) {
    // Проверяем валидность токена
    fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (response.ok) {
            // Токен валиден, перенаправляем на главную
            window.location.href = 'index.html';
        } else {
            // Токен невалиден, очищаем
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    })
    .catch(() => {
        // Ошибка соединения, остаемся на странице

    });
}

// Добавляем возможность входа по Enter
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

document.getElementById('usernameOrEmail').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

// Для демонстрации - заполнение тестовыми данными (только для разработки)
// Удалите в production
const demoAdmin = () => {
    const usernameInput = document.getElementById('usernameOrEmail');
    const passwordInput = document.getElementById('password');
    if (usernameInput && usernameInput.value === '') {
        usernameInput.value = 'admin';
        passwordInput.value = 'admin123';
    }
};
// Раскомментируйте для автоматической подстановки демо-данных
// demoAdmin();