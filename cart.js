// cart.js - Shared cart logic for all pages

// Utility: Format currency
function formatCurrency(value) {
    return 'GH₵ ' + value.toFixed(2);
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart icon count
function updateCartIcon() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-icon .cart-count').forEach(el => el.textContent = count);
}

// Add product to cart
function addToCart(product) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.name === product.name);
    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({...product, qty: 1});
    }
    saveCart(cart);
    updateCartIcon();
}

// Remove product from cart
function removeFromCart(name) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== name);
    saveCart(cart);
    updateCartIcon();
}

// Update quantity
function updateCartQty(name, qty) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.name === name);
    if (idx > -1) {
        cart[idx].qty = qty;
        if (cart[idx].qty < 1) cart[idx].qty = 1;
    }
    saveCart(cart);
    updateCartIcon();
}

// Attach to Add to Cart buttons (for product pages)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.add-to-cart, .btn-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = btn.closest('.card, .product-card');
            if (!card) return;
            const name = card.querySelector('.card-title, .product-title, .cart-name')?.textContent?.trim() || 'Product';
            const priceText = card.querySelector('.price, .mb-2, .product-price')?.textContent?.replace(/[^\d.]/g, '') || '0';
            const price = parseFloat(priceText);
            const img = card.querySelector('img')?.getAttribute('src') || '';
            addToCart({name, price, img});
        });
    });
    updateCartIcon();
});

// For cart.html: render cart table from localStorage
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const tbody = document.querySelector('.cart-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const cart = getCart();
        cart.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'cart-row';
            tr.innerHTML = `
                <td><img src="${item.img}" alt="${item.name}" style="width: 60px; border-radius: 8px;"></td>
                <td class="cart-name">${item.name}</td>
                <td class="cart-price" data-value="${item.price}">${formatCurrency(item.price)}</td>
                <td>
                    <div class="input-group input-group-sm" style="max-width: 110px;">
                        <button class="btn btn-outline-secondary qty-minus" type="button"><i class="fas fa-minus"></i></button>
                        <input type="text" class="form-control text-center cart-qty" value="${item.qty}">
                        <button class="btn btn-outline-secondary qty-plus" type="button"><i class="fas fa-plus"></i></button>
                    </div>
                </td>
                <td class="cart-subtotal">${formatCurrency(item.price * item.qty)}</td>
                <td><button class="btn btn-outline-danger btn-sm cart-delete"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
        // Setup cart row events
        function updateCartTotals() {
            let subtotal = 0;
            document.querySelectorAll('.cart-row').forEach(row => {
                const price = parseFloat(row.querySelector('.cart-price').dataset.value);
                const qty = parseInt(row.querySelector('.cart-qty').value);
                subtotal += price * qty;
                row.querySelector('.cart-subtotal').textContent = formatCurrency(price * qty);
            });
            document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
            const shipping = subtotal > 0 ? 20 : 0;
            const taxes = subtotal > 0 ? 10 : 0;
            document.getElementById('cart-shipping').textContent = formatCurrency(shipping);
            document.getElementById('cart-taxes').textContent = formatCurrency(taxes);
            document.getElementById('cart-total').textContent = formatCurrency(subtotal + shipping + taxes);
        }
        function setupQtyButtons() {
            document.querySelectorAll('.cart-row').forEach(row => {
                row.querySelector('.qty-minus').onclick = function() {
                    let qtyInput = row.querySelector('.cart-qty');
                    let qty = parseInt(qtyInput.value);
                    if (qty > 1) {
                        qtyInput.value = qty - 1;
                        updateCartQty(row.querySelector('.cart-name').textContent.trim(), qty - 1);
                        updateCartTotals();
                    }
                };
                row.querySelector('.qty-plus').onclick = function() {
                    let qtyInput = row.querySelector('.cart-qty');
                    qtyInput.value = parseInt(qtyInput.value) + 1;
                    updateCartQty(row.querySelector('.cart-name').textContent.trim(), parseInt(qtyInput.value));
                    updateCartTotals();
                };
            });
        }
        function setupDeleteButtons() {
            document.querySelectorAll('.cart-row .cart-delete').forEach(btn => {
                btn.onclick = function() {
                    const name = btn.closest('tr').querySelector('.cart-name').textContent.trim();
                    removeFromCart(name);
                    btn.closest('tr').remove();
                    updateCartTotals();
                };
            });
        }
        setupQtyButtons();
        setupDeleteButtons();
        updateCartTotals();
        updateCartIcon();
    });
} 