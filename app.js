// EDMAIS WEB PORTAL - JAVASCRIPT CONTROLLER
document.addEventListener('DOMContentLoaded', () => {
    
    // Initialise Lucide Icons
    lucide.createIcons();

    /* ==========================================
       1. CONTROLE DO BANNER SUPERIOR E HEADER
       ========================================== */
    const topPromo = document.getElementById('top-promo');
    const closeBannerBtn = document.getElementById('close-banner-btn');
    const header = document.getElementById('header');
    
    if (closeBannerBtn && topPromo) {
        closeBannerBtn.addEventListener('click', () => {
            topPromo.style.marginTop = `-${topPromo.offsetHeight}px`;
            setTimeout(() => {
                topPromo.style.display = 'none';
            }, 400);
        });
    }

    // Header sticky scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================
       2. CONTROLE DE SIDE DRAWERS E MENUS MOBILE
       ========================================== */
    const drawers = [
        { btn: 'cart-toggle', drawer: 'cart-drawer', overlay: 'cart-overlay', close: 'cart-close' },
        { btn: 'favorites-toggle', drawer: 'favorites-drawer', overlay: 'favorites-overlay', close: 'favorites-close' },
        { btn: 'mobile-menu-open', drawer: 'mobile-drawer', overlay: 'mobile-menu-overlay', close: 'mobile-menu-close' }
    ];

    drawers.forEach(item => {
        const toggleBtn = document.getElementById(item.btn);
        const drawerEl = document.getElementById(item.drawer);
        const overlayEl = document.getElementById(item.overlay);
        const closeBtn = document.getElementById(item.close);

        if (toggleBtn && drawerEl && overlayEl) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                drawerEl.classList.add('active');
                overlayEl.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock body scroll
            });
        }

        const closeFunc = () => {
            if (drawerEl && overlayEl) {
                drawerEl.classList.remove('active');
                overlayEl.classList.remove('active');
                document.body.style.overflow = ''; // Release body scroll
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeFunc);
        if (overlayEl) overlayEl.addEventListener('click', closeFunc);
    });

    // Close drawers on clicking link actions inside them
    document.querySelectorAll('.close-drawer-action').forEach(action => {
        action.addEventListener('click', () => {
            document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('active'));
            document.querySelectorAll('.drawer-overlay').forEach(o => o.classList.remove('active'));
            document.body.style.overflow = '';
        });
    });

    // Mobile Search Bar Toggle
    const searchMobileToggle = document.getElementById('search-mobile-toggle');
    const mobileSearchBar = document.getElementById('mobile-search-bar');
    const closeSearchMobile = document.getElementById('close-search-mobile');

    if (searchMobileToggle && mobileSearchBar && closeSearchMobile) {
        searchMobileToggle.addEventListener('click', () => {
            mobileSearchBar.classList.toggle('active');
        });
        closeSearchMobile.addEventListener('click', () => {
            mobileSearchBar.classList.remove('active');
        });
    }

    /* ==========================================
       3. SISTEMA DE TOAST NOTIFICATIONS
       ========================================== */
    const toastContainer = document.getElementById('toast-container');
    
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        lucide.createIcons({ attrs: { class: 'toast-icon' } });

        // Auto remove toast
        setTimeout(() => {
            toast.style.animation = 'toast-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    /* ==========================================
       4. BUSCA E AUTOCOMPLETE
       ========================================== */
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');

    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                searchSuggestions.classList.add('active');
            } else {
                searchSuggestions.classList.remove('active');
            }
        });

        // Close search suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });
    }

    /* ==========================================
       5. HERO SECTION CAROUSEL
       ========================================== */
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startAutoSlide();
        });
    });

    startAutoSlide();

    /* ==========================================
       6. CARRINHO DE COMPRAS E FAVORITOS (LOGIC)
       ========================================== */
    let cartItems = [];
    let favItems = [];

    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadge = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDrawerFooter = document.getElementById('cart-drawer-footer');

    const favItemsContainer = document.getElementById('fav-items-container');
    const favCountBadge = document.getElementById('fav-count');

    // Add to Cart Function
    function addToCart(product) {
        const existing = cartItems.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        showToast(`${product.name} adicionado ao carrinho!`);
    }

    // Remove from Cart
    function removeFromCart(id) {
        cartItems = cartItems.filter(item => item.id !== id);
        updateCartUI();
    }

    // Update Quantity
    function updateQuantity(id, change) {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartUI();
            }
        }
    }

    // Update Cart UI
    function updateCartUI() {
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        cartCountBadge.textContent = totalItems;
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shopping-bag" class="empty-icon"></i>
                    <p>Seu carrinho está vazio.</p>
                    <a href="#departments" class="btn btn-blue close-drawer-action">Explorar Moda</a>
                </div>
            `;
            cartDrawerFooter.style.display = 'none';
        } else {
            let html = '';
            let subtotal = 0;
            
            cartItems.forEach(item => {
                const totalItemPrice = item.price * item.quantity;
                subtotal += totalItemPrice;
                
                html += `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div>
                                <h4>${item.name}</h4>
                                <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="cart-item-quantity">
                                    <button class="qty-btn" onclick="adjustQty('${item.id}', -1)">-</button>
                                    <span class="qty-val">${item.quantity}</span>
                                    <button class="qty-btn" onclick="adjustQty('${item.id}', 1)">+</button>
                                </div>
                                <button class="remove-item-btn" onclick="deleteItem('${item.id}')" aria-label="Remover item">
                                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            cartItemsContainer.innerHTML = html;
            cartSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            cartDrawerFooter.style.display = 'block';
            lucide.createIcons();
        }
    }

    // Expose helpers globally for inline HTML event handlers
    window.adjustQty = (id, change) => {
        updateQuantity(id, change);
    };

    window.deleteItem = (id) => {
        removeFromCart(id);
        showToast("Item removido do carrinho.", "info");
    };

    // Checkout complete action
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            cartItems = [];
            updateCartUI();
            document.getElementById('cart-drawer').classList.remove('active');
            document.getElementById('cart-overlay').classList.remove('active');
            document.body.style.overflow = '';
            showToast("Pedido finalizado com sucesso! Obrigado por comprar na ÉDMAIS.", "success");
        });
    }

    // Add to Favorites Function
    function addToFav(product) {
        const existing = favItems.find(item => item.id === product.id);
        if (existing) {
            favItems = favItems.filter(item => item.id !== product.id);
            showToast("Item removido dos seus favoritos.", "info");
        } else {
            favItems.push(product);
            showToast("Item salvo nos seus favoritos!", "success");
        }
        updateFavUI();
    }

    // Update Favorites UI
    function updateFavUI() {
        favCountBadge.textContent = favItems.length;
        
        if (favItems.length === 0) {
            favItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="heart" class="empty-icon"></i>
                    <p>Nenhum item salvo ainda.</p>
                    <a href="#departments" class="btn btn-blue close-drawer-action">Ver Tendências</a>
                </div>
            `;
        } else {
            let html = '';
            favItems.forEach(item => {
                html += `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details" style="justify-content: center; gap: 8px;">
                            <div>
                                <h4>${item.name}</h4>
                                <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-red btn-xs" onclick="favToCart('${item.id}')">Adicionar ao Carrinho</button>
                                <button class="remove-item-btn" onclick="removeFav('${item.id}')" aria-label="Remover favorito">
                                    <i data-lucide="heart-off" style="width: 16px; height: 16px; fill: #E31E24; color: #E31E24;"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            favItemsContainer.innerHTML = html;
            lucide.createIcons();
        }
    }

    window.removeFav = (id) => {
        favItems = favItems.filter(item => item.id !== id);
        updateFavUI();
        showToast("Item removido dos seus favoritos.", "info");
    };

    window.favToCart = (id) => {
        const item = favItems.find(item => item.id === id);
        if (item) {
            addToCart(item);
            // Optional: remove from favs after adding to cart
            favItems = favItems.filter(fav => fav.id !== id);
            updateFavUI();
        }
    };

    // Bind event handlers for standard shopping actions
    document.querySelectorAll('.add-to-cart-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                img: btn.dataset.img
            };
            addToCart(product);
        });
    });

    document.querySelectorAll('.add-to-fav-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                img: btn.dataset.img
            };
            addToFav(product);
            btn.classList.toggle('active');
        });
    });

    /* ==========================================
       7. LOOKBOOK INTERATIVO (HOTSPOTS & HIGHLIGHT)
       ========================================== */
    const hotspots = document.querySelectorAll('.hotspot');
    const lookCards = document.querySelectorAll('.look-product-card');
    const buyAllLookBtn = document.getElementById('buy-all-look');

    // Hover or click on side card highlights hotspot
    lookCards.forEach(card => {
        const triggerId = card.dataset.trigger;
        const matchingHotspot = document.querySelector(`.hotspot[data-product="${triggerId}"]`);
        
        card.addEventListener('mouseenter', () => {
            if (matchingHotspot) matchingHotspot.classList.add('active');
            card.classList.add('active');
        });
        
        card.addEventListener('mouseleave', () => {
            if (matchingHotspot) matchingHotspot.classList.remove('active');
            card.classList.remove('active');
        });
    });

    hotspots.forEach(hotspot => {
        const productId = hotspot.dataset.product;
        const matchingCard = document.querySelector(`.look-product-card[data-trigger="${productId}"]`);

        hotspot.addEventListener('mouseenter', () => {
            if (matchingCard) matchingCard.classList.add('active');
        });

        hotspot.addEventListener('mouseleave', () => {
            if (matchingCard) matchingCard.classList.remove('active');
        });
    });

    // Buy entire lookbook items
    if (buyAllLookBtn) {
        buyAllLookBtn.addEventListener('click', () => {
            const items = [
                { id: 'p1', name: 'Blazer Alfaiataria Creme', price: 189.90, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80' },
                { id: 'p2', name: 'Regata Cropped Tricot', price: 59.90, img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=150&q=80' },
                { id: 'p3', name: 'Calça Wide Leg Classic', price: 139.90, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=150&q=80' }
            ];
            
            items.forEach(item => {
                const existing = cartItems.find(c => c.id === item.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cartItems.push({ ...item, quantity: 1 });
                }
            });
            
            updateCartUI();
            showToast("Visual completo adicionado ao carrinho!");
        });
    }

    /* ==========================================
       8. CONTADOR REGRESSIVO DE OFERTAS
       ========================================== */
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (hoursEl && minutesEl && secondsEl) {
        let totalSeconds = 24 * 60 * 60; // 24 hours in seconds
        
        function updateTimer() {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            
            hoursEl.textContent = String(h).padStart(2, '0');
            minutesEl.textContent = String(m).padStart(2, '0');
            secondsEl.textContent = String(s).padStart(2, '0');
            
            if (totalSeconds > 0) {
                totalSeconds--;
            } else {
                totalSeconds = 24 * 60 * 60; // reset loop for demo
            }
        }
        
        setInterval(updateTimer, 1000);
        updateTimer();
    }

    /* ==========================================
       9. LOCALIZADOR DE LOJAS (STORE DATABASE & SEARCH)
       ========================================== */
    const storesDB = {
        SP: {
            Sorocaba: [
                { name: 'ÉDMAIS - Sorocaba Centro', address: 'Rua XV de Novembro, 120 - Centro, Sorocaba - SP', phone: '(15) 3232-1020', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Sorocaba Shopping', address: 'Av. Afonso Vergueiro, 1700 - Lj 45 - Sorocaba - SP', phone: '(15) 3219-4500', hours: 'Seg a Sáb: 10:00 às 22:00 • Dom: 14:00 às 20:00' }
            ],
            'Ribeirão Preto': [
                { name: 'ÉDMAIS - Ribeirão Centro', address: 'Rua General Osório, 450 - Centro, Ribeirão Preto - SP', phone: '(16) 3610-8580', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Campinas: [
                { name: 'ÉDMAIS - Campinas Centro', address: 'Rua Francisco Glicério, 920 - Centro, Campinas - SP', phone: '(19) 3231-1515', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 15:00' }
            ],
            Adamantina: [
                { name: 'ÉDMAIS - Adamantina Centro', address: 'Av. Capitão José Antônio de Oliveira, 551 - Centro, Adamantina - SP', phone: '(18) 3522-9203', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Américo Brasiliense': [
                { name: 'ÉDMAIS - Américo Brasiliense Centro', address: 'Rua Dom Pedro II, 354 - Centro, Américo Brasiliense - SP', phone: '(16) 3392-7177', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Andradina: [
                { name: 'ÉDMAIS - Andradina Centro (Loja 1)', address: 'Rua Paes Leme, 520 - Centro, Andradina - SP', phone: '(18) 3722-3923', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' },
                { name: 'ÉDMAIS - Andradina Calçados (Loja 2)', address: 'Rua Paes Leme, 496 - Centro, Andradina - SP', phone: '(18) 3722-3923', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' },
                { name: 'ÉDMAIS - Andradina Infantil (Loja 3)', address: 'Rua Paes Leme, 554 - Centro, Andradina - SP', phone: '(18) 3723-2015', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Atibaia: [
                { name: 'ÉDMAIS - Atibaia Centro', address: 'Rua Benedito A. Bueno, 503 - Centro, Atibaia - SP', phone: '(11) 4413-2344', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' }
            ],
            Barretos: [
                { name: 'ÉDMAIS - Barretos Centro', address: 'Rua 20, 946 - Centro, Barretos - SP', phone: '(17) 3322-6337', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Bebedouro: [
                { name: 'ÉDMAIS - Bebedouro Centro', address: 'Rua Cel. João Manoel, 410 - Centro, Bebedouro - SP', phone: '(17) 3342-3401', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Bragança Paulista': [
                { name: 'ÉDMAIS - Bragança Paulista Centro', address: 'Av. Antonio P. Pimentel, 557/565 - Centro, Bragança Paulista - SP', phone: '(11) 4034-0500', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' }
            ],
            Guaratinguetá: [
                { name: 'ÉDMAIS - Guaratinguetá Centro', address: 'Rua Comendador João Galvão, 119 - Centro, Guaratinguetá - SP', phone: '(12) 3133-7350', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Hortolândia: [
                { name: 'ÉDMAIS - Hortolândia Centro', address: 'Rua Zacarias C. Camargo, 136 - Centro, Hortolândia - SP', phone: '(19) 3819-4824', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Ibitinga: [
                { name: 'ÉDMAIS - Ibitinga Centro', address: 'Rua Domingos Robert, 378 - Centro, Ibitinga - SP', phone: '(16) 3342-7682', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Igarapava: [
                { name: 'ÉDMAIS - Igarapava Centro', address: 'Rua Dr. Gabriel Vilela, 530 - Centro, Igarapava - SP', phone: '(16) 3172-3151', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Itupeva: [
                { name: 'ÉDMAIS - Itupeva Centro', address: 'Praça São Paulo, 41 - Centro, Itupeva - SP', phone: '(11) 4496-4579', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Lençóis Paulista': [
                { name: 'ÉDMAIS - Lençóis Paulista Centro', address: 'Rua Cel. Joaquim Anselmo Martins, 517 - Centro, Lençóis Paulista - SP', phone: '(14) 3264-5327', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Matão: [
                { name: 'ÉDMAIS - Matão Centro', address: 'Rua Rui Barbosa, 765 - Centro, Matão - SP', phone: '(16) 3382-4762', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Morro Agudo': [
                { name: 'ÉDMAIS - Morro Agudo Centro', address: 'Rua Inácio Franco, 1057 - Centro, Morro Agudo - SP', phone: '(16) 3382-4762', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Novo Horizonte': [
                { name: 'ÉDMAIS - Novo Horizonte Centro', address: 'Rua Trajano Machado, 620 - Centro, Novo Horizonte - SP', phone: '(16) 3542-1805', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Orlândia: [
                { name: 'ÉDMAIS - Orlândia Centro', address: 'Praça Mário Furtado, 79 - Centro, Orlândia - SP', phone: '(16) 3826-2773', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Pitangueiras: [
                { name: 'ÉDMAIS - Pitangueiras Centro', address: 'Rua Euclides Zanini Caldas, 460 - Centro, Pitangueiras - SP', phone: '(16) 3952-4552', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Santa Isabel': [
                { name: 'ÉDMAIS - Santa Isabel Centro', address: 'Avenida da República, 610 - Centro, Santa Isabel - SP', phone: '(11) 4656-8007', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'São Joaquim da Barra': [
                { name: 'ÉDMAIS - São Joaquim Centro', address: 'Praça Sete de Setembro, 60 - Centro, São Joaquim da Barra - SP', phone: '(16) 3811-5103', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Amparo: [
                { name: 'ÉDMAIS - Amparo Centro', address: 'Rua Comendador Guimarães, 75 - Centro, Amparo - SP', phone: '(19) 3807-6697', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Artur Nogueira': [
                { name: 'ÉDMAIS - Artur Nogueira Centro', address: 'Rua 7 de Setembro, 1532 - Centro, Artur Nogueira - SP', phone: '(19) 3877-3481', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Bariri: [
                { name: 'ÉDMAIS - Bariri Centro', address: 'Av. XV de Novembro, 565 - Centro, Bariri - SP', phone: '(14) 3662-5062', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Batatais: [
                { name: 'ÉDMAIS - Batatais Centro', address: 'Praça Dr. Jorge Nazar, 09 - Centro, Batatais - SP', phone: '(16) 3761-5088', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Boituva: [
                { name: 'ÉDMAIS - Boituva Centro', address: 'Rua Coronel Eugênio Motta, 460 - Centro, Boituva - SP', phone: '(15) 3263-2521', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Cabreúva: [
                { name: 'ÉDMAIS - Cabreúva Jacaré', address: 'Rua Maranhão, 886 - Bairro do Jacaré, Cabreúva - SP', phone: '(11) 4529-5341', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Cajamar: [
                { name: 'ÉDMAIS - Cajamar Polvilho', address: 'Av. Tenente Marques, 2226 - Polvilho, Cajamar - SP', phone: '(11) 4448-4003', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Cordeirópolis: [
                { name: 'ÉDMAIS - Cordeirópolis Centro', address: 'Av. Presidente Vargas, 185 - Centro, Cordeirópolis - SP', phone: '(19) 2163-0015', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Descalvado: [
                { name: 'ÉDMAIS - Descalvado Centro', address: 'Rua Bezerra Paes, 343 - Centro, Descalvado - SP', phone: '(19) 3583-6215', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Ibaté: [
                { name: 'ÉDMAIS - Ibaté Centro', address: 'Avenida São João, 1407 - Centro, Ibaté - SP', phone: '(16) 3343-7517', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Itatiba: [
                { name: 'ÉDMAIS - Itatiba Centro (Loja 1)', address: 'Rua Francisco Glicério, 4 - Centro, Itatiba - SP', phone: '(11) 4524-7101', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Itatiba Calçados (Loja 2)', address: 'Rua Rangel Pestana, 198 - Centro, Itatiba - SP', phone: '(11) 4534-3226', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' }
            ],
            Ituverava: [
                { name: 'ÉDMAIS - Ituverava Centro', address: 'Rua Dr. José Aníbal S. Oliveira, 521 - Centro, Ituverava - SP', phone: '(16) 3729-3379', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Leme: [
                { name: 'ÉDMAIS - Leme Centro', address: 'Rua Rafael de Barros, 273 - Centro, Leme - SP', phone: '(19) 3571-4854', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Lorena: [
                { name: 'ÉDMAIS - Lorena Centro', address: 'Praça Dr. Arnolfo de Azevedo, 186 - Centro, Lorena - SP', phone: '(12) 3157-3360', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Olímpia: [
                { name: 'ÉDMAIS - Olímpia Centro', address: 'Rua David de Oliveira, 776 - Centro, Olímpia - SP', phone: '(17) 3279-7357', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Pederneiras: [
                { name: 'ÉDMAIS - Pederneiras Centro', address: 'Rua Nove de Julho, S-40 - Centro, Pederneiras - SP', phone: '(14) 3435-1466', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Pindamonhangaba: [
                { name: 'ÉDMAIS - Pindamonhangaba Centro', address: 'Praça Monsenhor Marcondes, 80 - Centro, Pindamonhangaba - SP', phone: '(12) 3642-6190', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Porto Feliz': [
                { name: 'ÉDMAIS - Porto Feliz Centro', address: 'Rua Altino Arantes, 222 - Centro, Porto Feliz - SP', phone: '(15) 2107-4600', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'São Carlos': [
                { name: 'ÉDMAIS - São Carlos Centro (Loja 1)', address: 'Avenida São Carlos, 1163 - Centro, São Carlos - SP', phone: '(16) 3371-1414', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' },
                { name: 'ÉDMAIS - São Carlos Vila Prado (Loja 2)', address: 'Av. Teixeira de Barros, 1399 - Vila Prado, São Carlos - SP', phone: '(16) 3375-1420', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' },
                { name: 'ÉDMAIS - São Carlos Calçadão (Loja 3)', address: 'Calçadão General Osório, 743 - Centro, São Carlos - SP', phone: '(16) 3371-5100', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'São Pedro': [
                { name: 'ÉDMAIS - São Pedro Centro', address: 'Rua Veríssimo Prado, 64 - Santa Cruz, São Pedro - SP', phone: '(19) 3481-6300', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Sertãozinho: [
                { name: 'ÉDMAIS - Sertãozinho Centro', address: 'Rua Barão do Rio Branco, 1592 - Centro, Sertãozinho - SP', phone: '(16) 3945-6577', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Santa Gertrudes': [
                { name: 'ÉDMAIS - Santa Gertrudes Centro', address: 'Rua 1, 406 - Centro, Santa Gertrudes - SP', phone: '(19) 3545-5350', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Taquaritinga: [
                { name: 'ÉDMAIS - Taquaritinga Centro', address: 'Rua Prudente de Moraes, 740 - Centro, Taquaritinga - SP', phone: '(16) 3252-5002', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Valinhos: [
                { name: 'ÉDMAIS - Valinhos Centro', address: 'Rua Eugênio Franceschini, 12 - Centro, Valinhos - SP', phone: '(19) 3859-2486', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ]
        },
        MG: {
            'Além Paraíba': [
                { name: 'ÉDMAIS - Além Paraíba', address: 'Rua Capitão Godói, 26 - Porto Novo, Além Paraíba - MG', phone: '(32) 2010-1733', hours: 'Seg a Sex: 08:30 às 18:30 • Sáb: 08:30 às 13:00' }
            ],
            Cambuí: [
                { name: 'ÉDMAIS - Cambuí Centro (Loja 1)', address: 'Av. do Carmo, 361 - Centro, Cambuí - MG', phone: '(35) 3431-6416', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' },
                { name: 'ÉDMAIS - Cambuí Centro (Loja 2)', address: 'Av. do Carmo, 395 - Centro, Cambuí - MG', phone: '(35) 3431-6694', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Viçosa: [
                { name: 'ÉDMAIS - Viçosa Centro', address: 'Praça Do Rosário, 52 - Lj B - Centro, Viçosa - MG', phone: '(31) 3891-6010', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            Extrema: [
                { name: 'ÉDMAIS - Extrema Centro', address: 'Rua Melo Viana, 08 - Centro, Extrema - MG', phone: '(35) 3435-6302', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Governador Valadares': [
                { name: 'ÉDMAIS - Gov. Valadares Centro', address: 'Rua Israel Pinheiro, 3261 - Centro, Governador Valadares - MG', phone: '(33) 3025-0221', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Santa Rita do Sapucaí': [
                { name: 'ÉDMAIS - Santa Rita Centro', address: 'Av. Dr Delfim Moreira, 132 - Centro, Santa Rita do Sapucaí - MG', phone: '(35) 3471-7413', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Camanducaia: [
                { name: 'ÉDMAIS - Camanducaia Centro', address: 'Av. Rio Branco, 150 - Centro, Camanducaia - MG', phone: '(35) 3433-1191', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Belo Horizonte': [
                { name: 'ÉDMAIS - BH Centro', address: 'Rua Tupis, 245 - Centro, Belo Horizonte - MG', phone: '(31) 3271-9988', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Barreiro', address: 'Av. Sinfrônio Brochado, 890 - Barreiro, Belo Horizonte - MG', phone: '(31) 3384-5566', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:30' }
            ],
            Uberlândia: [
                { name: 'ÉDMAIS - Uberlândia Centro', address: 'Av. Afonso Pena, 620 - Centro, Uberlândia - MG', phone: '(34) 3235-9000', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 14:00' }
            ],
            'Juiz de Fora': [
                { name: 'ÉDMAIS - Juiz de Fora Centro', address: 'Rua Halfeld, 680 - Centro, Juiz de Fora - MG', phone: '(32) 3215-4422', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ]
        },
        RJ: {
            'Angra dos Reis': [
                { name: 'ÉDMAIS - Angra dos Reis', address: 'Rua Prefeito João Galindo, 22 - Centro, Angra dos Reis - RJ', phone: '(24) 3377-5573', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Barra do Piraí': [
                { name: 'ÉDMAIS - Barra do Piraí', address: 'Praça do Nilo Peçanha, 37 - Centro, Barra do Piraí - RJ', phone: '(24) 2442-0118', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Bom Jesus do Itabapoana': [
                { name: 'ÉDMAIS - Bom Jesus', address: 'Av. Tenente Jose Teixeira, 102 - Centro, Bom Jesus do Itabapoana - RJ', phone: '(22) 3831-2141', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Itaguaí': [
                { name: 'ÉDMAIS - Itaguaí Centro', address: 'Rua Paulo de Frontin, 61 - Centro, Itaguaí - RJ', phone: '(21) 2688-6300', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            Paracambi: [
                { name: 'ÉDMAIS - Paracambi (Loja 1)', address: 'Rua Dr. Nilo Peçanha, 430 - Centro, Paracambi - RJ', phone: '(21) 2683-2021', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:30' },
                { name: 'ÉDMAIS - Paracambi Calçados (Loja 2)', address: 'Rua Dominique Level, 104 - Centro, Paracambi - RJ', phone: '(21) 2683-2969', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:30' }
            ],
            Resende: [
                { name: 'ÉDMAIS - Resende Centro', address: 'Rua Alfredo Whately, 191 - Campos Elíseos, Resende - RJ', phone: '(24) 3354-9300', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Resende Alegria', address: 'Rua José Zolvino Coutinho, 329 - Nova Resende, Resende - RJ', phone: '(24) 3340-5825', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'Rio das Ostras': [
                { name: 'ÉDMAIS - Rio das Ostras', address: 'Rodovia Amaral Peixoto, 4887 - Centro, Rio das Ostras - RJ', phone: '(22) 3323-2421', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Paraíba do Sul': [
                { name: 'ÉDMAIS - Paraíba do Sul', address: 'Avenida Ayrton Senna, 452 - Centro, Paraíba do Sul - RJ', phone: '(24) 2050-4422', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Paty do Alferes': [
                { name: 'ÉDMAIS - Paty do Alferes', address: 'Rua Dr. Sebastião de Lacerda, 25 - Centro, Paty do Alferes - RJ', phone: '(24) 2080-1643', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            'São Pedro da Aldeia': [
                { name: 'ÉDMAIS - São Pedro da Aldeia', address: 'Rua Dr. Antonio Alves, 215 - Centro, São Pedro da Aldeia - RJ', phone: '(22) 2627-6189', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            Valença: [
                { name: 'ÉDMAIS - Valença Centro', address: 'Av. Nilo Peçanha, 353 - Centro, Valença - RJ', phone: '(24) 2452-4460', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Volta Redonda': [
                { name: 'ÉDMAIS - Volta Redonda Centro (Loja 1)', address: 'Av. Amaral Peixoto, 571 - Centro, Volta Redonda - RJ', phone: '(24) 3337-8342', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Volta Redonda Retiro (Loja 2)', address: 'Av. Antonio de Almeida, 2394 - Retiro, Volta Redonda - RJ', phone: '(24) 3346-9145', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            Araruama: [
                { name: 'ÉDMAIS - Araruama Centro', address: 'Rua Francisco Andrade, 130 - Centro, Araruama - RJ', phone: '(22) 2673-1703', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Barra Mansa': [
                { name: 'ÉDMAIS - Barra Mansa Centro (Loja 1)', address: 'Rua Joaquim Leite, 475 - Centro, Barra Mansa - RJ', phone: '(24) 3323-7817', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Barra Mansa Centro (Loja 2)', address: 'Rua Domingos Mariano, 320 - Centro, Barra Mansa - RJ', phone: '(24) 3323-0727', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Cabo Frio': [
                { name: 'ÉDMAIS - Cabo Frio Centro', address: 'Rua Érico Coelho, 124 - Centro, Cabo Frio - RJ', phone: '(22) 3031-4692', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Casimiro de Abreu': [
                { name: 'ÉDMAIS - Casimiro de Abreu', address: 'Rua Alpheu Marchon, 200 - Lj 1 a 4 - Centro, Casimiro de Abreu - RJ', phone: '(22) 2778-5804', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Itatiaia: [
                { name: 'ÉDMAIS - Itatiaia Centro', address: 'Rua Prefeito Assumpção, 466 - Centro, Itatiaia - RJ', phone: '(22) 2778-5804', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ],
            Paraty: [
                { name: 'ÉDMAIS - Paraty Chácara (Loja 1)', address: 'Av. Roberto Silveira, 692 - Chácara, Paraty - RJ', phone: '(24) 99843-8214', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' },
                { name: 'ÉDMAIS - Paraty Chácara (Loja 2)', address: 'Av. Roberto Silveira, 1109 - Chácara, Paraty - RJ', phone: '(24) 97835-7247', hours: 'Seg a Sex: 09:00 às 19:00 • Sáb: 09:00 às 14:00' }
            ],
            'Rio Bonito': [
                { name: 'ÉDMAIS - Rio Bonito Centro', address: 'Rua XV de Novembro, 242 - Lj 1/2 - Centro, Rio Bonito - RJ', phone: '(21) 2734-3832', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Santo Antônio de Pádua': [
                { name: 'ÉDMAIS - Santo Antônio de Pádua', address: 'Rua dos Leites, 115 - Centro, Santo Antônio de Pádua - RJ', phone: '(22) 3851-0755', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ],
            'Três Rios': [
                { name: 'ÉDMAIS - Três Rios Centro (Loja 1)', address: 'Rua Praça São Sebastião, 363 - Centro, Três Rios - RJ', phone: '(24) 2252-1516', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:30' },
                { name: 'ÉDMAIS - Três Rios Autonomia (Loja 2)', address: 'Praça da Autonomia, 75 - Centro, Três Rios - RJ', phone: '(24) 2252-3554', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:30' }
            ],
            Vassouras: [
                { name: 'ÉDMAIS - Vassouras Centro', address: 'Av. Expedicionário Osvaldo de Almeida Ramos, 32 - Ljs 1 a 4 - Centro, Vassouras - RJ', phone: '(24) 2471-8570', hours: 'Seg a Sex: 09:00 às 18:30 • Sáb: 09:00 às 13:00' }
            ]
        },
        PR: {
            Arapongas: [
                { name: 'ÉDMAIS - Arapongas Centro', address: 'Rua Beija-Flor, 434 - Centro, Arapongas - PR', phone: '(43) 3316-2601', hours: 'Seg a Sex: 09:00 às 18:00 • Sáb: 09:00 às 13:00' }
            ]
        },
        MS: {
            'Nova Andradina': [
                { name: 'ÉDMAIS - Nova Andradina Centro', address: 'Avenida Antônio Joaquim de Moura Andrade, 1450 - Centro, Nova Andradina - MS', phone: '(67) 3017-0302', hours: 'Seg a Sex: 08:30 às 18:00 • Sáb: 08:30 às 12:30' }
            ]
        }
    };

    const stateSelect = document.getElementById('state-select');
    const citySelect = document.getElementById('city-select');
    const storesList = document.getElementById('stores-list');
    const mapTooltip = document.getElementById('map-tooltip');

    if (stateSelect && citySelect && storesList) {
        stateSelect.addEventListener('change', () => {
            const state = stateSelect.value;
            citySelect.innerHTML = '<option value="">Selecione a Cidade</option>';
            citySelect.disabled = !state;
            
            if (state) {
                const cities = Object.keys(storesDB[state]);
                cities.forEach(city => {
                    const opt = document.createElement('option');
                    opt.value = city;
                    opt.textContent = city;
                    citySelect.appendChild(opt);
                });
            } else {
                storesList.innerHTML = `
                    <div class="no-selection-message">
                        <i data-lucide="map-pin"></i>
                        <p>Selecione o estado e a cidade para ver as lojas disponíveis.</p>
                    </div>
                `;
                lucide.createIcons();
            }
        });

        citySelect.addEventListener('change', () => {
            const state = stateSelect.value;
            const city = citySelect.value;
            
            if (state && city) {
                const stores = storesDB[state][city];
                let html = '';
                
                stores.forEach((store, index) => {
                    html += `
                        <div class="store-result-card" onclick="focusStore('${store.name}', '${store.address}')">
                            <h4>${store.name}</h4>
                            <div class="store-detail-row">
                                <i data-lucide="map-pin"></i>
                                <span>${store.address}</span>
                            </div>
                            <div class="store-detail-row">
                                <i data-lucide="phone"></i>
                                <a href="tel:${store.phone.replace(/[^0-9]/g, '')}">${store.phone}</a>
                            </div>
                            <div class="store-detail-row">
                                <i data-lucide="clock"></i>
                                <span>${store.hours}</span>
                            </div>
                        </div>
                    `;
                });
                
                storesList.innerHTML = html;
                lucide.createIcons();
                
                // Focus on the first store in the map immediately
                if (stores.length > 0) {
                    focusStore(stores[0].name, stores[0].address);
                }
            }
        });
    }

    // Map interaction helper
    window.focusStore = (name, address) => {
        if (mapTooltip) {
            mapTooltip.innerHTML = `
                <h4>${name}</h4>
                <p>${address}</p>
                <span style="font-size: 0.7rem; color: #E31E24; font-weight:600; display:block; margin-top:5px;"><i data-lucide="check" style="width:10px; height:10px; vertical-align:middle;"></i> Loja Selecionada</span>
            `;
            lucide.createIcons();
            
            // Randomly offset/jitter pins to simulate map navigation
            const pins = document.querySelectorAll('.map-pulse-pin');
            pins.forEach(pin => {
                pin.style.transform = `scale(${1.2 + Math.random() * 0.4})`;
            });
            setTimeout(() => {
                pins.forEach(pin => pin.style.transform = '');
            }, 600);
        }
    };

    /* ==========================================
       10. TIMELINE INTERATIVA (SOBRE NÓS)
       ========================================== */
    const timelineBtns = document.querySelectorAll('.timeline-nav-btn');
    const timelineContent = document.getElementById('timeline-content');
    
    const timelineData = {
        '1992': {
            title: 'A Origem da ÉDMAIS',
            desc: 'Fundada em 1992, a ÉDMAIS iniciou suas operações como uma pequena loja multimarcas de vestuário. Desde o início, o foco esteve em trazer produtos com excelente custo-benefício e um mix variado para vestir toda a família com acolhimento.'
        },
        '2005': {
            title: 'Expansão e Consolidação',
            desc: 'Ao atingir 20 lojas físicas nos estados de São Paulo e Minas Gerais, a marca consolidou sua identidade de varejo forte, estabelecendo contratos com grandes marcas nacionais fornecedoras de tecidos, calçados e jeans premium.'
        },
        '2015': {
            title: 'Modernização de Lojas',
            desc: 'Implementação de novo conceito arquitetônico com layout limpo e iluminado inspirado nas maiores magazines do país (como Renner e Zara). A rede atinge a marca histórica de 60 lojas operando com excelência e alta satisfação de clientes.'
        },
        '2026': {
            title: 'A ÉDMAIS Hoje',
            desc: 'Consolidada como uma gigante regional com mais de 90 lojas físicas em constante crescimento. Lançamento do novo portal digital de moda e estilo focado na omnicanalidade, oferecendo lookbooks integrados e facilidades de compras online.'
        }
    };

    timelineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const year = btn.dataset.year;
            
            // Toggle active buttons
            timelineBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Fade out, update content, fade in
            if (timelineContent) {
                timelineContent.classList.add('fade-out');
                setTimeout(() => {
                    timelineContent.innerHTML = `
                        <h3 class="timeline-card-title">${timelineData[year].title}</h3>
                        <p class="timeline-card-desc">${timelineData[year].desc}</p>
                    `;
                    timelineContent.classList.remove('fade-out');
                }, 300);
            }
        });
    });

    /* ==========================================
       11. INSTAGRAM FEED E MODAL (LIGHTBOX)
       ========================================== */
    const instaItems = document.querySelectorAll('.insta-item');
    const instaModal = document.getElementById('insta-modal');
    const instaModalClose = document.getElementById('insta-modal-close');
    const instaModalImg = document.getElementById('insta-modal-img');
    const modalLikeBtn = document.querySelector('.modal-like-btn');
    const likesCountEl = document.querySelector('.likes-count');

    instaItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgUrl = item.dataset.img;
            if (instaModal && instaModalImg) {
                instaModalImg.src = imgUrl;
                instaModal.classList.add('active');
                
                // Reset likes state
                if (modalLikeBtn) {
                    modalLikeBtn.classList.remove('liked');
                    modalLikeBtn.innerHTML = '<i data-lucide="heart"></i> Curtir';
                    likesCountEl.textContent = '1.240 curtidas';
                    lucide.createIcons();
                }
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (instaModalClose) {
        instaModalClose.addEventListener('click', () => {
            instaModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (instaModal) {
        instaModal.addEventListener('click', (e) => {
            if (e.target === instaModal) {
                instaModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    if (modalLikeBtn) {
        modalLikeBtn.addEventListener('click', () => {
            const isLiked = modalLikeBtn.classList.toggle('liked');
            if (isLiked) {
                modalLikeBtn.innerHTML = '<i data-lucide="heart" style="fill: #E31E24; color: #E31E24;"></i> Curtido';
                likesCountEl.textContent = '1.241 curtidas';
            } else {
                modalLikeBtn.innerHTML = '<i data-lucide="heart"></i> Curtir';
                likesCountEl.textContent = '1.240 curtidas';
            }
            lucide.createIcons();
        });
    }

    /* ==========================================
       12. NEWSLETTER FORM COM VALIDAÇÃO
       ========================================== */
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterFeedback = document.getElementById('newsletter-feedback');

    if (newsletterForm && newsletterEmail && newsletterFeedback) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = newsletterEmail.value.trim();
            
            // Simple email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailValue === '') {
                newsletterFeedback.textContent = 'Por favor, informe seu e-mail.';
                newsletterFeedback.className = 'form-feedback error';
            } else if (!emailRegex.test(emailValue)) {
                newsletterFeedback.textContent = 'E-mail inválido. Verifique se digitou corretamente.';
                newsletterFeedback.className = 'form-feedback error';
            } else {
                newsletterFeedback.textContent = 'Cadastro realizado com sucesso! Verifique seu e-mail para resgatar seu cupom de 10% OFF.';
                newsletterFeedback.className = 'form-feedback success';
                newsletterEmail.value = '';
                showToast("Bem-vindo ao Clube ÉDMAIS! Verifique sua caixa de entrada.", "success");
            }
        });
    }
});
