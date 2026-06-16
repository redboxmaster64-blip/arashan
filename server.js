// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'arashan_secret_key_2024';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// ============= ЛИМИТЫ КОРЗИНЫ =============
const CART_LIMITS = {
    MAX_QUANTITY_PER_ITEM: 10,      // Максимум 10 единиц одного товара
    MAX_TOTAL_ITEMS: 50,             // Максимум 50 различных товаров в корзине
    MIN_QUANTITY: 1,                 // Минимальное количество
    MAX_ORDER_AMOUNT: 500000         // Максимальная сумма заказа (500,000 сом)
};

// ============= НАСТРОЙКА БД =============
let db;

async function initializeDatabase() {
    db = await open({
        filename: path.join(__dirname, 'arashan.db'),
        driver: sqlite3.Database
    });

    // Таблица пользователей
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            chat_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

    // Таблица лекарств
    await db.exec(`
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT,
            manufacturer TEXT,
            badge TEXT,
            icon TEXT DEFAULT 'fa-tablets',
            image_url TEXT,
            in_stock INTEGER DEFAULT 1,
            prescription INTEGER DEFAULT 0,
            form TEXT,
            age TEXT,
            deviceType TEXT,
            type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица заказов
    await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_number TEXT UNIQUE,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            delivery_address TEXT,
            total_amount REAL NOT NULL,
            items TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Таблица сессий
    await db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Создаем админа
    const adminExists = await db.get('SELECT * FROM users WHERE role = "admin"');
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run(
            `INSERT INTO users (username, email, password_hash, full_name, role) 
             VALUES (?, ?, ?, ?, ?)`,
            ['admin', 'admin@arashan.kg', hashedPassword, 'Главный администратор', 'admin']
        );
        
    }

    // Добавляем товары, если таблица пуста
    const count = await db.get('SELECT COUNT(*) as count FROM medicines');
    if (count.count === 0) {
        await addAllMedicines();
        
    }

    
    return db;
}

async function addAllMedicines() {
    const medicines = [
        { name: "Нурофен Экспресс", description: "Капсулы 200 мг, 20 шт.", price: 345, category: "painkillers", badge: "Хит", icon: "fa-tablets", manufacturer: "Reckitt Benckiser", in_stock: 1 },
        { name: "Пенталгин", description: "Таблетки 24 шт. Комбинированное средство", price: 280, category: "painkillers", badge: "Популярное", icon: "fa-pills", manufacturer: "Отисифарм", in_stock: 1 },
        { name: "Кетанов", description: "Таблетки 10 мг, 20 шт.", price: 195, category: "painkillers", badge: null, icon: "fa-capsules", manufacturer: "Ранбакси", in_stock: 1 },
        { name: "Витамин С 1000", description: "Шипучие таблетки 1000 мг, 20 шт.", price: 420, category: "vitamins", badge: "Хит", icon: "fa-capsules", manufacturer: "Эвалар", in_stock: 1, type: "single", form: "effervescent" },
        { name: "Компливит", description: "Таблетки 60 шт. Комплекс витаминов", price: 380, category: "vitamins", badge: "Хит", icon: "fa-pills", manufacturer: "Фармстандард", in_stock: 1, type: "multivitamins", form: "tablets" },
        { name: "Мирамистин", description: "Раствор 150 мл. Антисептик", price: 430, category: "cold", badge: "Хит", icon: "fa-spray-can", manufacturer: "Инфамед", in_stock: 1 },
        { name: "Нурофен для детей", description: "Суспензия 100 мл, клубника", price: 380, category: "children", subcategory: "children_medicines", badge: "Хит", icon: "fa-baby", age: "0-1", manufacturer: "Reckitt Benckiser", in_stock: 1 },
        { name: "Аквадетрим", description: "Капли витамин D3 15 мл", price: 210, category: "children", subcategory: "children_vitamins", badge: "Популярное", icon: "fa-eye-dropper", age: "0-1", manufacturer: "Медана Фарма", in_stock: 1 },
        { name: "Тонометр автоматический", description: "На плечо, память на 90 измерений", price: 3990, category: "medical", subcategory: "measuring", badge: "Хит", icon: "fa-heartbeat", deviceType: "electronic", manufacturer: "Omron", in_stock: 1 }
    ];

    for (const med of medicines) {
        await db.run(
            `INSERT INTO medicines (name, description, price, category, subcategory, badge, icon, manufacturer, in_stock, age, deviceType, type, form) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [med.name, med.description, med.price, med.category, med.subcategory, med.badge, med.icon, med.manufacturer, med.in_stock, med.age, med.deviceType, med.type, med.form]
        );
    }
}

// ============= НАСТРОЙКА TELEGRAM БОТА =============
let bot = null;

async function initTelegramBot() {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        return null;
    }

    try {
        bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
        
        
        // Обработка ошибок
        bot.on('polling_error', (error) => {

        });

        // Команда /start
        bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const userName = msg.from.first_name || 'Пользователь';
            

            
            const message = `
🤖 *Аптека "Арашан" - Бот уведомлений*

Привет, ${userName}! 👋

✅ *Бот успешно подключен!*

📌 *Ваш CHAT_ID:* \`${chatId}\`

🔧 *Для настройки уведомлений:*
1. Скопируйте этот CHAT_ID: \`${chatId}\`
2. Вставьте в файл \`.env\`:
   \`ADMIN_CHAT_ID=${chatId}\`
3. Перезапустите сервер

🌐 *Сайт:* http://localhost:${PORT}
👤 *Логин:* admin
🔑 *Пароль:* admin123

💡 *Проверка:* напишите /status
            `;
            
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        });

        // Команда /status
        bot.onText(/\/status/, async (msg) => {
            const chatId = msg.chat.id;
            const message = `
📊 *СТАТУС БОТА*

✅ Бот работает
🕐 Время: ${new Date().toLocaleString('ru-RU')}

📌 *Настройки:*
ADMIN_CHAT_ID: ${ADMIN_CHAT_ID ? '✅ Установлен' : '❌ Не установлен'}
Ваш CHAT_ID: \`${chatId}\`

${!ADMIN_CHAT_ID ? '\n⚠️ *Чтобы получать уведомления:*\nДобавьте в .env:\n`ADMIN_CHAT_ID=' + chatId + '`' : ''}
            `;
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        });

        // Команда /test
        bot.onText(/\/test/, async (msg) => {
            const chatId = msg.chat.id;
            const message = `
🧪 *ТЕСТОВОЕ СООБЩЕНИЕ*

✅ Бот работает корректно!
🕐 ${new Date().toLocaleString('ru-RU')}

Если вы видите это сообщение - всё настроено правильно!
            `;
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        });

        // ============ ОТПРАВКА ТЕСТОВОГО СООБЩЕНИЯ ПРИ ЗАПУСКЕ ============
        setTimeout(async () => {
            if (ADMIN_CHAT_ID) {

                try {
                    const testMessage = `
🚀 *СЕРВЕР ЗАПУЩЕН!*

✅ Аптека "Арашан" успешно запущена
🕐 Время: ${new Date().toLocaleString('ru-RU')}
🌐 Сайт: http://localhost:${PORT}

📌 *Уведомления о заказах будут приходить сюда!*

💡 *Проверка:* напишите /status
                    `;
                    await bot.sendMessage(ADMIN_CHAT_ID, testMessage, { parse_mode: 'Markdown' });

                } catch (error) {

                }
            } else {

            }
        }, 3000);
        

        return bot;
        
    } catch (error) {

        return null;
    }
}

// Отправка уведомления о новом заказе
async function sendOrderNotification(orderData) {
    if (!bot) {

        return;
    }
    
    if (!ADMIN_CHAT_ID) {

        return;
    }

    let itemsText = '';
    orderData.items.forEach((item, index) => {
        itemsText += `${index + 1}. *${item.name}* x${item.quantity} = ${item.price * item.quantity} сом\n`;
    });

    const message = `
🆕 *НОВЫЙ ЗАКАЗ!* 🛒
━━━━━━━━━━━━━━━━━━━━

*📋 Информация:*
├ 🆔 Заказ №${orderData.order_number}
├ 👤 Клиент: ${orderData.customer_name}
├ 📞 Телефон: ${orderData.customer_phone}
${orderData.customer_email ? `├ 📧 Email: ${orderData.customer_email}` : '├ 📧 Email: не указан'}
├ 🏠 Адрес: ${orderData.delivery_address || 'Самовывоз'}
└ 📅 Время: ${new Date().toLocaleString('ru-RU')}

*📦 Состав:*
${itemsText}

*💰 Итого:* ${orderData.total_amount} сом
━━━━━━━━━━━━━━━━━━━━

🌐 http://localhost:${PORT}/admin.html
    `;

    try {
        await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });

    } catch (error) {

    }
}

// Отправка уведомления о сообщении
async function sendMessageNotification(feedbackData) {
    if (!bot || !ADMIN_CHAT_ID) return;

    const message = `
💬 *НОВОЕ СООБЩЕНИЕ!*
━━━━━━━━━━━━━━━━━━━━

*Отправитель:* ${feedbackData.name}
*Телефон:* ${feedbackData.phone}
${feedbackData.email ? `*Email:* ${feedbackData.email}` : ''}

*Текст:*
${feedbackData.message}

━━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleString('ru-RU')}
    `;

    try {
        await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });

    } catch (error) {

    }
}

// ============= НАСТРОЙКА MULTER =============
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Только изображения!'));
        }
    }
});

if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// ============= MIDDLEWARE =============
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
}

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AR-${year}${month}${day}-${random}`;
}

// ============= API =============
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone } = req.body;
        const existing = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            `INSERT INTO users (username, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, phone]
        );
        const token = jwt.sign({ id: result.lastID, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: result.lastID, username, email, full_name, phone, role: 'user' } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        const user = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [usernameOrEmail, usernameOrEmail]);
        if (!user) return res.status(401).json({ error: 'Неверные данные' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Неверные данные' });
        if (!user.is_active) return res.status(403).json({ error: 'Аккаунт заблокирован' });
        await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, phone: user.phone, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await db.get('SELECT id, username, email, full_name, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    const { full_name, phone, email } = req.body;
    await db.run('UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?', [full_name, phone, email, req.user.id]);
    res.json({ success: true });
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Неверный текущий пароль' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ success: true });
});

app.get('/api/auth/orders', authenticateToken, async (req, res) => {
    const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    for (const order of orders) order.items = JSON.parse(order.items);
    res.json(orders);
});

app.get('/api/medicines', async (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM medicines';
    let params = [];
    if (category && category !== 'all') {
        query += ' WHERE category = ?';
        params.push(category);
    }
    query += ' ORDER BY name';
    const medicines = await db.all(query, params);
    res.json(medicines);
});

app.get('/api/medicines/:id', async (req, res) => {
    const medicine = await db.get('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
    medicine ? res.json(medicine) : res.status(404).json({ error: 'Не найдено' });
});

app.get('/api/medicines/filter', async (req, res) => {
    try {
        const { category, subcategory, age, form, deviceType, type } = req.query;
        let query = 'SELECT * FROM medicines WHERE 1=1';
        let params = [];
        if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
        if (subcategory && subcategory !== 'all') { query += ' AND subcategory = ?'; params.push(subcategory); }
        if (age && age !== 'all') { query += ' AND age = ?'; params.push(age); }
        if (form && form !== 'all') { query += ' AND form = ?'; params.push(form); }
        if (deviceType && deviceType !== 'all') { query += ' AND deviceType = ?'; params.push(deviceType); }
        if (type && type !== 'all') { query += ' AND type = ?'; params.push(type); }
        query += ' ORDER BY name';
        const medicines = await db.all(query, params);
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/medicines', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, price, category, manufacturer, badge, icon, image_url, in_stock, prescription } = req.body;
    const result = await db.run(
        `INSERT INTO medicines (name, description, price, category, manufacturer, badge, icon, image_url, in_stock, prescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description, price, category, manufacturer, badge, icon, image_url, in_stock ? 1 : 0, prescription ? 1 : 0]
    );
    const newMedicine = await db.get('SELECT * FROM medicines WHERE id = ?', [result.lastID]);
    res.json(newMedicine);
});

app.put('/api/medicines/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, price, category, manufacturer, badge, icon, image_url, in_stock, prescription } = req.body;
    await db.run(
        `UPDATE medicines SET name=?, description=?, price=?, category=?, manufacturer=?, badge=?, icon=?, image_url=?, in_stock=?, prescription=? WHERE id=?`,
        [name, description, price, category, manufacturer, badge, icon, image_url, in_stock ? 1 : 0, prescription ? 1 : 0, req.params.id]
    );
    const updated = await db.get('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
    res.json(updated);
});

app.delete('/api/medicines/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.run('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

// ============= API ДЛЯ ПРОВЕРКИ ЛИМИТОВ КОРЗИНЫ =============
app.post('/api/cart/check', async (req, res) => {
    try {
        const { items, newItem, action } = req.body;
        
        // Проверка на пустую корзину
        if (!items) {
            return res.json({ 
                valid: true, 
                limits: CART_LIMITS,
                message: 'Корзина пуста' 
            });
        }
        
        let currentItems = [...items];
        let warnings = [];
        let isValid = true;
        
        // Если добавляем новый товар
        if (action === 'add' && newItem) {
            const existingItemIndex = currentItems.findIndex(i => i.id === newItem.id);
            
            if (existingItemIndex !== -1) {
                // Товар уже есть - проверяем лимит количества
                const currentQuantity = currentItems[existingItemIndex].quantity;
                const newQuantity = currentQuantity + (newItem.quantity || 1);
                
                if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
                    isValid = false;
                    warnings.push(`Нельзя добавить больше ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} единиц товара "${newItem.name}"`);
                }
            } else {
                // Новый товар - проверяем лимит различных товаров
                if (currentItems.length >= CART_LIMITS.MAX_TOTAL_ITEMS) {
                    isValid = false;
                    warnings.push(`Нельзя добавить больше ${CART_LIMITS.MAX_TOTAL_ITEMS} различных товаров в корзину`);
                }
            }
        }
        
        // Проверка общей суммы
        const totalAmount = currentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (totalAmount > CART_LIMITS.MAX_ORDER_AMOUNT) {
            isValid = false;
            warnings.push(`Сумма заказа не может превышать ${CART_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()} сом`);
        }
        
        // Проверка каждого товара на наличие в БД и актуальную цену
        for (const item of currentItems) {
            const dbItem = await db.get('SELECT id, name, price, in_stock FROM medicines WHERE id = ?', [item.id]);
            if (!dbItem) {
                isValid = false;
                warnings.push(`Товар "${item.name}" больше не существует в каталоге`);
            } else if (!dbItem.in_stock) {
                isValid = false;
                warnings.push(`Товар "${dbItem.name}" закончился на складе`);
            } else if (dbItem.price !== item.price) {
                warnings.push(`Цена на товар "${dbItem.name}" изменилась. Было: ${item.price}, Стало: ${dbItem.price}`);
            }
        }
        
        res.json({
            valid: isValid,
            limits: CART_LIMITS,
            warnings: warnings,
            message: isValid ? 'OK' : warnings.join('. ')
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, delivery_address, total_amount, items } = req.body;
        
        // ============= ПРОВЕРКА ЛИМИТОВ ПЕРЕД СОЗДАНИЕМ ЗАКАЗА =============
        
        // 1. Проверка количества товаров в корзине
        if (items.length > CART_LIMITS.MAX_TOTAL_ITEMS) {
            return res.status(400).json({ 
                error: `Нельзя оформить заказ с более чем ${CART_LIMITS.MAX_TOTAL_ITEMS} различными товарами` 
            });
        }
        
        // 2. Проверка количества каждого товара
        for (const item of items) {
            if (item.quantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
                return res.status(400).json({ 
                    error: `Нельзя заказать более ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} единиц товара "${item.name}"` 
                });
            }
            if (item.quantity < CART_LIMITS.MIN_QUANTITY) {
                return res.status(400).json({ 
                    error: `Количество товара "${item.name}" должно быть не менее ${CART_LIMITS.MIN_QUANTITY}` 
                });
            }
        }
        
        // 3. Проверка общей суммы заказа
        if (total_amount > CART_LIMITS.MAX_ORDER_AMOUNT) {
            return res.status(400).json({ 
                error: `Сумма заказа не может превышать ${CART_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()} сом` 
            });
        }
        
        if (total_amount <= 0) {
            return res.status(400).json({ error: 'Сумма заказа должна быть больше 0' });
        }
        
        // 4. Проверка наличия товаров и актуальных цен
        let validatedItems = [];
        for (const item of items) {
            const dbItem = await db.get('SELECT id, name, price, in_stock FROM medicines WHERE id = ?', [item.id]);
            
            if (!dbItem) {
                return res.status(400).json({ error: `Товар "${item.name}" не найден в каталоге` });
            }
            
            if (!dbItem.in_stock) {
                return res.status(400).json({ error: `Товар "${dbItem.name}" закончился на складе` });
            }
            
            validatedItems.push({
                id: dbItem.id,
                name: dbItem.name,
                price: dbItem.price,
                quantity: item.quantity
            });
        }
        
        // Пересчитываем сумму по актуальным ценам
        const actualTotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Если цена изменилась, предупреждаем
        if (Math.abs(actualTotal - total_amount) > 0.01) {
            return res.status(400).json({ 
                error: `Цены на некоторые товары изменились. Новая сумма: ${actualTotal} сом`,
                actualTotal: actualTotal
            });
        }
        
        const orderNumber = generateOrderNumber();
        const items_json = JSON.stringify(validatedItems);
        
        const result = await db.run(
            `INSERT INTO orders (user_id, order_number, customer_name, customer_phone, customer_email, delivery_address, total_amount, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, orderNumber, customer_name, customer_phone, customer_email, delivery_address, actualTotal, items_json]
        );
        
        await sendOrderNotification({ 
            order_number: orderNumber, 
            customer_name, 
            customer_phone, 
            customer_email, 
            delivery_address, 
            total_amount: actualTotal, 
            items: validatedItems 
        });
        
        res.json({ success: true, orderId: result.lastID, orderNumber });
        
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
    const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of orders) order.items = JSON.parse(order.items);
    res.json(orders);
});

app.put('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    const { status } = req.body;
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
});

app.post('/api/feedback', async (req, res) => {
    const { name, phone, email, message } = req.body;
    await sendMessageNotification({ name, phone, email, message });
    res.json({ success: true });
});

app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
    const totalMedicines = await db.get('SELECT COUNT(*) as count FROM medicines');
    const inStock = await db.get('SELECT COUNT(*) as count FROM medicines WHERE in_stock = 1');
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
    const newOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'new'");
    res.json({ medicines: totalMedicines.count, inStock: inStock.count, users: totalUsers.count, orders: totalOrders.count, newOrders: newOrders.count });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    const users = await db.all('SELECT id, username, email, full_name, phone, role, is_active, created_at FROM users');
    res.json(users);
});

app.put('/api/admin/users/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    const user = await db.get('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
    const newStatus = user.is_active ? 0 : 1;
    await db.run('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, is_active: newStatus });
});

// Эндпоинт для получения информации о лимитах (для клиентской части)
app.get('/api/cart/limits', (req, res) => {
    res.json({
        limits: CART_LIMITS,
        message: 'Лимиты корзины'
    });
});

// ============= ЗАПУСК =============
async function startServer() {
    try {
        await initializeDatabase();
        await initTelegramBot();
        
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🚀 АПТЕКА "АРАШАН" ЗАПУЩЕНА!                            ║
╠══════════════════════════════════════════════════════════════╣
║  📍 Сайт:          http://localhost:${PORT}                    ║
║  🔐 Админ-панель:  http://localhost:${PORT}/admin.html         ║
║  👤 Логин:         admin                                     ║
║  🔑 Пароль:        admin123                                  ║
╠══════════════════════════════════════════════════════════════╣
║  📦 ЛИМИТЫ КОРЗИНЫ:                                          ║
║  ├ 📌 Макс. единиц товара: ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} шт.        ║
║  ├ 📌 Макс. видов товаров: ${CART_LIMITS.MAX_TOTAL_ITEMS}              ║
║  ├ 📌 Мин. количество: ${CART_LIMITS.MIN_QUANTITY}                     ║
║  └ 📌 Макс. сумма заказа: ${CART_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()} сом     ║
╠══════════════════════════════════════════════════════════════╣
║  🤖 Telegram бот:  ${TELEGRAM_BOT_TOKEN ? '✅ АКТИВЕН' : '❌ НЕ НАСТРОЕН'}                           ║
║  📨 Тест.сообщение: ${ADMIN_CHAT_ID && TELEGRAM_BOT_TOKEN ? '✅ ОТПРАВЛЕНО' : '❌ НЕ ОТПРАВЛЕНО'}                    ║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
     
    }
}

startServer();