const API_URL = 'http://localhost:3000/api';

// Функция проверки силы пароля
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    const strength = checkPasswordStrength(password);
    
    if (password.length === 0) {
        strengthDiv.textContent = '';
    } else if (strength <= 2) {
        strengthDiv.innerHTML = '<span class="weak">🔴 Слабый пароль</span>';
    } else if (strength <= 4) {
        strengthDiv.innerHTML = '<span class="medium">🟡 Средний пароль</span>';
    } else {
        strengthDiv.innerHTML = '<span class="strong">🟢 Сильный пароль</span>';
    }
}

// Функция показа уведомлений
function showMessage(element, message, isError = true) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (isError) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    
    // Автоматически скрыть через 5 секунд
    setTimeout(() => {
        if (isError) {
            errorDiv.style.display = 'none';
        } else {
            successDiv.style.display = 'none';
        }
    }, 5000);
}

// Валидация email
function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return re.test(email);
}

// Валидация телефона (опционально)
function isValidPhone(phone) {
    if (!phone) return true;
    const re = /^[\+\d\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Обработчик формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const full_name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Валидация
    if (!username) {
        showMessage(null, 'Введите имя пользователя', true);
        return;
    }
    
    if (username.length < 3) {
        showMessage(null, 'Имя пользователя должно содержать минимум 3 символа', true);
        return;
    }
    
    if (!email) {
        showMessage(null, 'Введите email', true);
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage(null, 'Введите корректный email адрес', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(null, 'Пароли не совпадают', true);
        document.getElementById('confirmPassword').value = '';
        return;
    }
    
    if (password.length < 6) {
        showMessage(null, 'Пароль должен содержать минимум 6 символов', true);
        return;
    }
    
    if (phone && !isValidPhone(phone)) {
        showMessage(null, 'Введите корректный номер телефона', true);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                password, 
                full_name: full_name || null, 
                phone: phone || null 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(null, '✅ Регистрация успешна! Перенаправляем на главную...', false);
            
            // Сохраняем токен и данные пользователя
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Перенаправление через 2 секунды
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 2000);
        } else {
            showMessage(null, data.error || 'Ошибка регистрации. Возможно, пользователь уже существует.', true);
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage(null, '❌ Ошибка подключения к серверу. Убедитесь, что сервер запущен.', true);
    }
});

// Проверка силы пароля при вводе
document.getElementById('password').addEventListener('input', updatePasswordStrength);

// Проверка совпадения паролей в реальном времени
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirm = this.value;
    
    if (confirm && password !== confirm) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#e5ecf5';
    }
});

document.getElementById('password').addEventListener('input', function() {
    const confirm = document.getElementById('confirmPassword').value;
    if (confirm && this.value !== confirm) {
        document.getElementById('confirmPassword').style.borderColor = '#dc3545';
    } else if (confirm) {
        document.getElementById('confirmPassword').style.borderColor = '#28a745';
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
            window.location.href = 'index.html';
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    })
    .catch(() => {
        // Ошибка соединения, остаемся на странице
    });
}

// Добавляем возможность отправки формы по Enter
const inputs = document.querySelectorAll('#registerForm input');
inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('registerForm').dispatchEvent(new Event('submit'));
        }
    });
});
