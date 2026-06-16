/* ===== ОБЩИЕ НАСТРОЙКИ ===== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}

body {
    background-color: #f4f7fc;
    color: #1e2b3c;
    line-height: 1.5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* ===== ШАПКА ===== */
.header {
    background-color: #ffffff;
    box-shadow: 0 2px 15px rgba(0,0,0,0.08);
    padding: 15px 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-icon {
    background-color: #2a7f62;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
}

.logo-text h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1e3a5f;
    line-height: 1.2;
}

.logo-text p {
    font-size: 12px;
    color: #2a7f62;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.header-contacts {
    display: flex;
    gap: 25px;
    flex-wrap: wrap;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.contact-item i {
    color: #2a7f62;
    font-size: 18px;
    width: 20px;
}

.contact-label {
    font-size: 12px;
    color: #6b7a8c;
}

.contact-value {
    font-weight: 600;
    color: #1e2b3c;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

/* Корзина в шапке */
.cart-link {
    position: relative;
    color: #1e2b3c;
    font-size: 24px;
    text-decoration: none;
    transition: color 0.3s;
}

.cart-link:hover {
    color: #2a7f62;
}

.cart-link.active {
    color: #2a7f62;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ff6b6b;
    color: white;
    font-size: 12px;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
}

.btn-call {
    background-color: #2a7f62;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #2a7f62;
}

.btn-call:hover {
    background-color: transparent;
    color: #2a7f62;
}

/* ===== НАВИГАЦИЯ ===== */
.navbar {
    background-color: #ffffff;
    border-bottom: 1px solid #e5ecf5;
    padding: 10px 0;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 30px;
    flex-wrap: wrap;
}

.nav-menu a {
    text-decoration: none;
    color: #1e2b3c;
    font-weight: 500;
    font-size: 15px;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.nav-menu a i {
    color: #2a7f62;
    font-size: 14px;
}

.nav-menu a:hover,
.nav-menu a.active {
    color: #2a7f62;
}

/* ===== ПОИСК ===== */
.search-section {
    background: linear-gradient(135deg, #e1f0fa 0%, #c9e2f0 100%);
    padding: 30px 0;
}

.search-container {
    display: flex;
    max-width: 700px;
    margin: 0 auto;
    background: white;
    border-radius: 60px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.search-container input {
    flex: 1;
    border: none;
    padding: 18px 25px;
    font-size: 16px;
    outline: none;
}

.search-container button {
    background-color: #2a7f62;
    border: none;
    color: white;
    padding: 0 35px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-container button:hover {
    background-color: #1e5f48;
}

.search-info {
    text-align: center;
    margin-top: 15px;
    color: #1e3a5f;
    font-size: 14px;
}

.search-info i {
    color: #2a7f62;
}

/* ===== КАТЕГОРИИ ===== */
.categories {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin: 30px 0;
}

.category-btn {
    background-color: white;
    border: 1px solid #e5ecf5;
    padding: 8px 20px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    color: #1e2b3c;
    cursor: pointer;
    transition: all 0.3s;
}

.category-btn:hover {
    background-color: #2a7f62;
    color: white;
    border-color: #2a7f62;
}

.category-btn.active {
    background-color: #2a7f62;
    color: white;
    border-color: #2a7f62;
}

/* ===== ЗАГОЛОВКИ ===== */
.section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e3a5f;
    margin: 40px 0 30px;
    position: relative;
    padding-bottom: 10px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 70px;
    height: 4px;
    background-color: #2a7f62;
    border-radius: 2px;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #1e3a5f;
    margin: 40px 0;
}

/* ===== СЕТКА ТОВАРОВ ===== */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    margin: 40px 0;
}

.product-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #edf2f9;
    position: relative;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.product-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #ff6b6b;
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 30px;
}

.product-badge.sale {
    background-color: #2a7f62;
}

.product-image {
    text-align: center;
    margin: 15px 0;
    font-size: 60px;
    color: #2a7f62;
}

.product-title {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 8px;
    color: #1e2b3c;
}

.product-description {
    font-size: 13px;
    color: #5b6f82;
    margin-bottom: 15px;
    min-height: 40px;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    border-top: 1px solid #edf2f9;
    padding-top: 15px;
}

.product-price {
    font-weight: 800;
    font-size: 22px;
    color: #1e3a5f;
}

.btn-add {
    background-color: #2a7f62;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    transition: 0.3s;
}

.btn-add:hover {
    background-color: #1e5f48;
    transform: scale(1.1);
}

/* ===== КОРЗИНА ===== */
.cart-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 30px;
    margin: 40px 0;
}

.cart-items {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.cart-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 20px;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #edf2f9;
}

.cart-item:last-child {
    border-bottom: none;
}

.cart-item-image {
    width: 60px;
    height: 60px;
    background-color: #f4f7fc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: #2a7f62;
}

.cart-item-info h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
}

.cart-item-price {
    font-weight: 700;
    color: #2a7f62;
}

.cart-item-quantity {
    display: flex;
    align-items: center;
    gap: 10px;
}

.quantity-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #e5ecf5;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

.quantity-btn:hover {
    background-color: #2a7f62;
    color: white;
    border-color: #2a7f62;
}

.quantity-value {
    font-weight: 600;
    min-width: 30px;
    text-align: center;
}

.cart-item-total {
    font-weight: 700;
    font-size: 18px;
    color: #1e3a5f;
    min-width: 100px;
    text-align: right;
}

.btn-remove {
    background: none;
    border: none;
    color: #ff6b6b;
    font-size: 18px;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.3s;
}

.btn-remove:hover {
    transform: scale(1.2);
}

.empty-cart {
    text-align: center;
    padding: 60px 20px;
}

.empty-cart i {
    font-size: 80px;
    color: #cbd5e1;
    margin-bottom: 20px;
}

.empty-cart h3 {
    font-size: 24px;
    color: #1e2b3c;
    margin-bottom: 10px;
}

.empty-cart p {
    color: #6b7a8c;
    margin-bottom: 30px;
}

.btn-primary {
    background-color: #2a7f62;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-block;
}

.btn-primary:hover {
    background-color: #1e5f48;
    transform: translateY(-2px);
}

.cart-summary {
    background: white;
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    height: fit-content;
    position: sticky;
    top: 100px;
}

.cart-summary h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #1e3a5f;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    color: #5b6f82;
}

.summary-row.total {
    font-size: 20px;
    font-weight: 700;
    color: #1e2b3c;
    border-top: 2px solid #edf2f9;
    padding-top: 15px;
    margin-top: 15px;
}

.delivery-free {
    color: #2a7f62;
    font-weight: 600;
}

.checkout-btn {
    width: 100%;
    background-color: #2a7f62;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin: 20px 0 10px;
}

.checkout-btn:hover {
    background-color: #1e5f48;
    transform: translateY(-2px);
}

.continue-shopping {
    width: 100%;
    background: none;
    border: 1px solid #e5ecf5;
    padding: 12px;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    color: #1e2b3c;
}

.continue-shopping:hover {
    background-color: #f4f7fc;
}

/* ===== УВЕДОМЛЕНИЯ ===== */
.add-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #2a7f62;
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    z-index: 1000;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* ===== ПРЕИМУЩЕСТВА ===== */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 25px;
    margin: 60px 0;
    background: white;
    padding: 40px 20px;
    border-radius: 30px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.03);
}

.feature-item {
    text-align: center;
}

.feature-icon {
    font-size: 40px;
    color: #2a7f62;
    margin-bottom: 15px;
}

.feature-item h4 {
    font-weight: 700;
    margin-bottom: 8px;
}

.feature-item p {
    font-size: 14px;
    color: #5b6f82;
}

/* ===== ПОДВАЛ ===== */
.footer {
    background-color: #1e2b3c;
    color: #cbd5e1;
    padding: 50px 0 20px;
    margin-top: 50px;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.footer-col h4 {
    color: white;
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: 600;
}

.footer-col ul {
    list-style: none;
}

.footer-col li {
    margin-bottom: 12px;
}

.footer-col a {
    color: #cbd5e1;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
}

.footer-col a:hover {
    color: #2a7f62;
}

.footer-contacts i {
    width: 25px;
    color: #2a7f62;
}

.copyright {
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid #334155;
    font-size: 13px;
}

/* ===== АДАПТИВНОСТЬ (УЛУЧШЕННАЯ) ===== */

/* Планшеты (768px - 1024px) */
@media (max-width: 1024px) {
    .container {
        padding: 0 30px;
    }
    
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
    }
    
    .cart-container {
        gap: 20px;
    }
}

/* Мобильные устройства (до 768px) */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }
    
    /* Шапка */
    .header-content {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }
    
    .logo-area {
        justify-content: center;
    }
    
    .header-contacts {
        justify-content: center;
        gap: 20px;
    }
    
    .contact-item {
        font-size: 12px;
    }
    
    .contact-item i {
        font-size: 16px;
    }
    
    .header-actions {
        justify-content: center;
        width: 100%;
    }
    
    /* Навигация */
    .nav-menu {
        justify-content: center;
        gap: 12px;
    }
    
    .nav-menu a {
        font-size: 13px;
    }
    
    /* Поиск */
    .search-container {
        flex-direction: column;
        border-radius: 30px;
    }
    
    .search-container input {
        padding: 15px 20px;
        text-align: center;
    }
    
    .search-container button {
        padding: 12px;
        justify-content: center;
    }
    
    /* Заголовки */
    .section-title {
        font-size: 24px;
        text-align: center;
        margin: 30px 0 20px;
    }
    
    .section-title::after {
        left: 50%;
        transform: translateX(-50%);
    }
    
    .page-title {
        font-size: 28px;
        text-align: center;
        margin: 30px 0;
    }
    
    /* Категории */
    .categories {
        justify-content: center;
        gap: 8px;
    }
    
    .category-btn {
        padding: 6px 15px;
        font-size: 12px;
    }
    
    /* Сетка товаров */
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 15px;
        margin: 30px 0;
    }
    
    .product-card {
        padding: 15px;
    }
    
    .product-image {
        font-size: 50px;
    }
    
    .product-title {
        font-size: 16px;
    }
    
    .product-price {
        font-size: 18px;
    }
    
    .btn-add {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }
    
    /* Корзина */
    .cart-container {
        grid-template-columns: 1fr;
        gap: 20px;
        margin: 30px 0;
    }
    
    .cart-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 12px;
        padding: 15px;
    }
    
    .cart-item-image {
        margin: 0 auto;
    }
    
    .cart-item-quantity {
        justify-content: center;
    }
    
    .cart-item-total {
        text-align: center;
        justify-content: center;
    }
    
    .cart-summary {
        position: static;
        margin-top: 0;
    }
    
    /* Преимущества */
    .features {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        padding: 30px 15px;
        margin: 40px 0;
    }
    
    .feature-icon {
        font-size: 32px;
    }
    
    .feature-item h4 {
        font-size: 14px;
    }
    
    .feature-item p {
        font-size: 12px;
    }
    
    /* Футер */
    .footer {
        padding: 40px 0 20px;
        margin-top: 40px;
    }
    
    .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 30px;
    }
    
    .footer-contacts ul li {
        justify-content: center;
    }
    
    .footer-col h4 {
        margin-bottom: 15px;
    }
}

/* Маленькие мобильные устройства (до 480px) */
@media (max-width: 480px) {
    .container {
        padding: 0 12px;
    }
    
    /* Шапка */
    .logo-icon {
        width: 40px;
        height: 40px;
        font-size: 22px;
    }
    
    .logo-text h1 {
        font-size: 20px;
    }
    
    .logo-text p {
        font-size: 10px;
    }
    
    .header-contacts {
        flex-direction: column;
        gap: 8px;
    }
    
    .contact-item {
        justify-content: center;
    }
    
    .btn-call {
        padding: 8px 16px;
        font-size: 12px;
    }
    
    .cart-link {
        font-size: 20px;
    }
    
    /* Навигация */
    .nav-menu {
        gap: 8px;
    }
    
    .nav-menu a {
        font-size: 11px;
    }
    
    .nav-menu a i {
        font-size: 11px;
    }
    
    /* Поиск */
    .search-container input {
        padding: 12px 15px;
        font-size: 14px;
    }
    
    .search-container button {
        padding: 10px;
        font-size: 14px;
    }
    
    .search-info {
        font-size: 12px;
    }
    
    /* Заголовки */
    .section-title {
        font-size: 20px;
    }
    
    .page-title {
        font-size: 24px;
    }
    
    .category-banner h1 {
        font-size: 24px !important;
    }
    
    .category-banner p {
        font-size: 14px !important;
    }
    
    /* Категории */
    .category-btn {
        padding: 5px 12px;
        font-size: 11px;
    }
    
    /* Сетка товаров */
    .products-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .product-card {
        max-width: 320px;
        margin: 0 auto;
        width: 100%;
    }
    
    /* Фильтры */
    .filter-section {
        padding: 15px;
    }
    
    .filter-title {
        font-size: 16px;
    }
    
    .filter-btn {
        padding: 6px 14px;
        font-size: 12px;
    }
    
    .sort-section {
        flex-direction: column;
        align-items: stretch;
    }
    
    .sort-select {
        width: 100%;
    }
    
    /* Корзина */
    .cart-items {
        padding: 15px;
    }
    
    .cart-item-info h3 {
        font-size: 14px;
    }
    
    .quantity-btn {
        width: 28px;
        height: 28px;
    }
    
    /* Преимущества */
    .features {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    /* Модальное окно */
    .modal-content {
        width: 95%;
        margin: 10px;
    }
    
    .modal-header h3 {
        font-size: 18px;
    }
    
    .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    /* Таблицы админки */
    .admin-table th,
    .admin-table td {
        padding: 8px 10px;
        font-size: 12px;
    }
    
    .admin-table {
        font-size: 12px;
    }
    
    .btn-sm {
        padding: 4px 8px;
    }
    
    /* Профиль */
    .profile-container {
        margin: 20px auto;
    }
    
    .profile-card {
        padding: 20px;
    }
    
    .profile-header {
        flex-direction: column;
        text-align: center;
    }
    
    .tabs {
        justify-content: center;
    }
    
    .tab {
        padding: 8px 16px;
        font-size: 12px;
    }
    
    /* Страница о нас */
    .about-grid {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
    
    .stat-number {
        font-size: 22px;
    }
    
    .team-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .advantages-grid {
        grid-template-columns: 1fr;
    }
    
    /* Контакты */
    .contact-info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .contact-card {
        padding: 20px;
    }
    
    .social-links {
        gap: 15px;
    }
    
    .social-link {
        width: 50px;
        height: 50px;
        font-size: 20px;
    }
    
    /* Уведомления */
    .add-notification {
        left: 20px;
        right: 20px;
        bottom: 20px;
        text-align: center;
        font-size: 13px;
    }
}

/* Планшеты в портретной ориентации (между 481px и 768px) */
@media (min-width: 481px) and (max-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .features {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .team-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .advantages-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .contact-info-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Большие экраны (от 1400px) */
@media (min-width: 1400px) {
    .container {
        max-width: 1300px;
    }
    
    .products-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Альбомная ориентация на мобильных */
@media (max-width: 768px) and (orientation: landscape) {
    .header-content {
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* ===== АДМИН-ПАНЕЛЬ ===== */
.admin-panel {
    background: white;
    border-radius: 20px;
    padding: 30px;
    margin: 40px 0;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.admin-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: linear-gradient(135deg, #2a7f62 0%, #1e5f48 100%);
    color: white;
    padding: 25px;
    border-radius: 16px;
    text-align: center;
}

.stat-card i {
    font-size: 40px;
    margin-bottom: 10px;
}

.stat-number {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    opacity: 0.9;
}

.admin-table-container {
    overflow-x: auto;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
}

.admin-table th,
.admin-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #edf2f9;
}

.admin-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #1e2b3c;
}

.admin-table tr:hover {
    background-color: #f8f9fa;
}

.stock-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.stock-badge.in-stock {
    background-color: #d4edda;
    color: #155724;
}

.stock-badge.out-stock {
    background-color: #f8d7da;
    color: #721c24;
}

.btn-sm {
    padding: 5px 10px;
    margin: 0 3px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-sm i {
    font-size: 14px;
}

.edit-btn {
    background-color: #ffc107;
    color: #856404;
}

.edit-btn:hover {
    background-color: #e0a800;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
}

/* ===== МОДАЛЬНОЕ ОКНО ===== */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s;
}

.modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #edf2f9;
}

.modal-header h3 {
    margin: 0;
    color: #1e3a5f;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    transition: color 0.3s;
}

.modal-close:hover {
    color: #ff6b6b;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #edf2f9;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* ===== ФОРМЫ ===== */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #1e2b3c;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e5ecf5;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #2a7f62;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.checkbox {
    display: flex;
    align-items: center;
}

.checkbox label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-bottom: 0;
}

.checkbox input {
    width: auto;
}

/* ===== АНИМАЦИИ ===== */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* ===== ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ===== */
.product-manufacturer {
    font-size: 12px;
    color: #6b7a8c;
    margin-bottom: 10px;
}

.in-stock {
    font-size: 12px;
    color: #2a7f62;
    font-weight: 600;
    display: inline-block;
    margin-top: 5px;
}

.out-of-stock-badge {
    font-size: 12px;
    color: #ff6b6b;
    font-weight: 600;
    display: inline-block;
    margin-top: 5px;
}

.product-card.out-of-stock {
    opacity: 0.7;
}

.product-card.out-of-stock .btn-add {
    opacity: 0.5;
    cursor: not-allowed;
}

.prescription-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ffc107;
    color: #856404;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 20px;
    z-index: 10;
}

.no-products {
    text-align: center;
    padding: 60px 20px;
    grid-column: 1/-1;
}

.no-products i {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 20px;
}

.no-products h3 {
    font-size: 24px;
    color: #1e2b3c;
    margin-bottom: 10px;
}

.no-products p {
    color: #6b7a8c;
}

.add-notification.error {
    background-color: #dc3545;
}

.add-notification.success {
    background-color: #2a7f62;
}

/* Скелетон загрузки */
.skeleton-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.skeleton-image {
    width: 100%;
    height: 150px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 15px;
}

.skeleton-title {
    height: 20px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-bottom: 10px;
    width: 80%;
}

.skeleton-text {
    height: 40px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-bottom: 15px;
}

.skeleton-price {
    height: 30px;
    background: #f0f0f0;
    border-radius: 4px;
    width: 60%;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}