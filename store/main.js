/* ================================
   Mula Store — Premium JS (UPGRADE)
   - Link único por produto (#p=03)
   - Modal abre automaticamente pelo link
   - Checkout com formulário no carrinho
   - Eventos Meta Pixel (ViewContent, AddToCart, InitiateCheckout)
================================ */

(function () {
	"use strict";

	/* ==========================
	   Helpers
	========================== */
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	const normalizeText = (str) =>
		(str || "")
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");

	const formatMT = (value) => {
		const n = Number(value || 0);
		return `${n.toFixed(2).replace(".", ",")} MT`;
	};

	const parsePrice = (strOrNum) => {
		if (typeof strOrNum === "number") return strOrNum;
		const s = String(strOrNum || "")
			.replace(/[^\d.,]/g, "")
			.replace(",", ".");
		const n = Number(s);
		return Number.isFinite(n) ? n : 0;
	};

	const pad2 = (n) => String(n).padStart(2, "0");

	const lockScroll = (lock) => {
		document.body.style.overflow = lock ? "hidden" : "";
	};

	/* ==========================
	   Config
	========================== */
	// Troca pelo teu número real (sem +, sem espaços)
	const WHATSAPP_NUMBER = "258846342251";

	/* ==========================
	   Pixel (Meta) - Events helper
	   NOTA: Para funcionar de verdade, precisas inserir o Pixel no <head>.
	   Este código já dispara os eventos caso o fbq exista.
	========================== */
	function track(eventName, payload = {}) {
		try {
			if (typeof window.fbq === "function") {
				window.fbq("track", eventName, payload);
			}
		} catch {}
	}

	/* ==========================
	   Elements
	========================== */
	const slides = $$(".slide");
	const prevBtn = $(".nav-prev");
	const nextBtn = $(".nav-next");

	const indicator = $("#slideIndicator");
	const resultsCount = $("#resultsCount");

	const searchInput = $("#searchInput");
	const clearSearch = $("#clearSearch");
	const emptyMsg = $("#searchEmptyMsg");

	const quickFilters = $("#quickFilters");
	const clearChipsBtn = $("#clearChips");

	const openContact = $("#openContact");
	const openInfo = $("#openInfo");
	const openCart = $("#openCart");
	const openCartBottom = $("#openCartBottom");

	const openInfoTop = $("#openInfoTop");
	const openCartTop = $("#openCartTop");
	const scrollToCollection = $("#scrollToCollection");

	const heroCTA = $("#heroCTA");
	const heroExplore = $("#heroExplore");
	const finalCTA = $("#finalCTA");
	const finalScroll = $("#finalScroll");
	const footerCTA = $("#footerCTA");

	const contactPopup = $("#contactPopup");
	const infoPopup = $("#infoPopup");

	const productModal = $("#productModal");
	const closeProductModal = $("#closeProductModal");

	const modalImage = $("#modalImage");
	const modalCode = $("#modalCode");
	const modalBrand = $("#modalBrand");
	const modalTitle = $("#modalTitle");
	const modalPrice = $("#modalPrice");
	const modalQuality = $("#modalQuality");
	const modalColor = $("#modalColor");
	const modalNeck = $("#modalNeck");
	const modalDelivery = $("#modalDelivery");

	const sizeRow = $("#sizeRow");
	const qtyMinus = $("#qtyMinus");
	const qtyPlus = $("#qtyPlus");
	const qtyValue = $("#qtyValue");
	const modalAddToCart = $("#modalAddToCart");
	const modalBuyNow = $("#modalBuyNow");

	const cartOverlay = $("#cartOverlay");
	const closeCart = $("#closeCart");
	const cartList = $("#cartList");
	const cartEmpty = $("#cartEmpty");
	const cartTotal = $("#cartTotal");
	const cartCheckout = $("#cartCheckout");
	const cartClear = $("#cartClear");

	const cartCount = $("#cartCount");
	const cartCountTop = $("#cartCountTop");
	const cartCountBottom = $("#cartCountBottom");
	const modalShare = $("#modalShare");
const shareToast = $("#shareToast");

	// Checkout form fields (NOVO)
	const clientName = $("#clientName");
	const clientPhone = $("#clientPhone");
	const clientAddress = $("#clientAddress");
	const clientPayment = $("#clientPayment");

	// Hero Mini card
	const heroPreview = $("#heroPreview");
	const miniCollectionName = $("#miniCollectionName");
	const miniPrice = $("#miniPrice");
	const miniOpen = $("#miniOpen");
	const miniBuy = $("#miniBuy");

	const yearEl = $("#year");

	/* ==========================
	   State
	========================== */
	let currentIndex = 0;
	let activeChips = new Set();

	// Modal state
	let modalProduct = null;
	let selectedSize = "M";
	let selectedQty = 1;

	// Cart state (persistente)
	let cart = [];

	/* ==========================
	   Storage
	========================== */
	const CART_KEY = "mula_cart_v2";

	function loadCart() {
		try {
			const raw = localStorage.getItem(CART_KEY);
			cart = raw ? JSON.parse(raw) : [];
			if (!Array.isArray(cart)) cart = [];
		} catch {
			cart = [];
		}
	}

	function saveCart() {
		try {
			localStorage.setItem(CART_KEY, JSON.stringify(cart));
		} catch {}
	}

	/* ==========================
	   Slider (Accordion)
	========================== */
	function setActiveSlide(index) {
		const visible = getVisibleSlides();
		if (visible.length === 0) return;

		slides.forEach((s) => s.classList.remove("active"));

		const target = slides[index];
		if (target) {
			target.classList.add("active");
			currentIndex = index;
		}

		updateIndicator();
		syncHeroWithActive();
	}

	function getVisibleSlides() {
		return slides.filter((s) => s.style.display !== "none");
	}

	function getActiveSlide() {
		return $(".slide.active") || slides[0] || null;
	}

	function nextSlide() {
		const visible = getVisibleSlides();
		if (visible.length === 0) return;

		const active = getActiveSlide();
		const idxVisible = visible.indexOf(active);
		const nextVisible = visible[(idxVisible + 1) % visible.length];

		const newIndex = slides.indexOf(nextVisible);
		setActiveSlide(newIndex);
	}

	function prevSlide() {
		const visible = getVisibleSlides();
		if (visible.length === 0) return;

		const active = getActiveSlide();
		const idxVisible = visible.indexOf(active);
		const prevVisible = visible[(idxVisible - 1 + visible.length) % visible.length];

		const newIndex = slides.indexOf(prevVisible);
		setActiveSlide(newIndex);
	}

	function updateIndicator() {
		if (!indicator) return;

		const visible = getVisibleSlides();
		const total = visible.length || slides.length;

		let current = 1;
		const active = getActiveSlide();
		if (active && visible.length) {
			const idx = visible.indexOf(active);
			current = idx >= 0 ? idx + 1 : 1;
		}

		indicator.textContent = `${pad2(current)}/${pad2(total)}`;
	}

	/* ==========================
	   Product Data
	========================== */
	function slideToProduct(slide) {
		if (!slide) return null;

		return {
			code: slide.getAttribute("data-code") || "",
			brand: slide.getAttribute("data-brand") || "",
			name: slide.getAttribute("data-name") || "",
			color: slide.getAttribute("data-color") || "",
			size: slide.getAttribute("data-size") || "M, L, XL",
			price: parsePrice(slide.getAttribute("data-price")),
			image: slide.getAttribute("data-image") || "",
			quality: slide.getAttribute("data-quality") || "",
			neck: slide.getAttribute("data-neck") || "",
			stock: slide.getAttribute("data-stock") || "",
			delivery: slide.getAttribute("data-delivery") || "",
		};
	}

	function findSlideByCode(code) {
		const c = String(code || "").trim();
		if (!c) return null;
		return slides.find((s) => String(s.getAttribute("data-code")).trim() === c) || null;
	}

	/* ==========================
	   Shareable Link (#p=03)
	========================== */
	function setHashProduct(code) {
		if (!code) return;
		// mantém o padrão #p=03
		window.location.hash = `p=${encodeURIComponent(code)}`;
	}

	function getHashProductCode() {
		const h = (window.location.hash || "").replace("#", "").trim();
		if (!h) return null;

		// espera p=03
		const parts = h.split("&");
		for (const p of parts) {
			const [k, v] = p.split("=");
			if (k === "p" && v) return decodeURIComponent(v);
		}
		return null;
	}

	function openFromHash() {
		const code = getHashProductCode();
		if (!code) return;

		const slide = findSlideByCode(code);
		if (!slide) return;

		// activa slide e abre modal
		setActiveSlide(slides.indexOf(slide));
		openModal(slideToProduct(slide));
	}

	/* ==========================
	   Hero Sync
	========================== */
	function syncHeroWithActive() {
		const active = getActiveSlide();
		if (!active) return;

		const p = slideToProduct(active);
		if (!p) return;

		if (heroPreview) heroPreview.style.backgroundImage = `url('${p.image}')`;
		if (miniCollectionName) miniCollectionName.textContent = p.name || "Colecção";
		if (miniPrice) miniPrice.textContent = formatMT(p.price);
	}

	/* ==========================
	   Modal (Produto)
	========================== */
	function openModal(product) {
		if (!productModal || !product) return;

		modalProduct = product;
		selectedSize = "M";
		selectedQty = 1;

		// UI fill
		if (modalImage) modalImage.style.backgroundImage = `url('${product.image}')`;
		if (modalCode) modalCode.textContent = `#${product.code}`;
		if (modalBrand) modalBrand.textContent = product.brand;
		if (modalTitle) modalTitle.textContent = product.name;
		if (modalPrice) modalPrice.textContent = formatMT(product.price);

		if (modalQuality) modalQuality.textContent = product.quality || "—";
		if (modalColor) modalColor.textContent = product.color || "—";
		if (modalNeck) modalNeck.textContent = product.neck || "—";
		if (modalDelivery) modalDelivery.textContent = product.delivery || "—";

		// sizes from product
		const sizes = (product.size || "M, L, XL")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		if (sizeRow) {
			sizeRow.innerHTML = "";
			sizes.forEach((s, i) => {
				const btn = document.createElement("button");
				btn.className = "size-btn" + (i === 0 ? " active" : "");
				btn.setAttribute("data-size", s);
				btn.textContent = s;
				btn.addEventListener("click", () => {
					$$(".size-btn", sizeRow).forEach((b) => b.classList.remove("active"));
					btn.classList.add("active");
					selectedSize = s;
				});
				sizeRow.appendChild(btn);
			});
			selectedSize = sizes[0] || "M";
		}

		if (qtyValue) qtyValue.textContent = String(selectedQty);

		productModal.classList.add("active");
		productModal.setAttribute("aria-hidden", "false");
		lockScroll(true);

		// Atualiza hash para partilha
		setHashProduct(product.code);

		// Pixel: ViewContent
		track("ViewContent", {
			content_name: product.name,
			content_ids: [product.code],
			content_type: "product",
			value: product.price,
			currency: "MZN",
		});
	}

	function closeModal() {
		if (!productModal) return;
		productModal.classList.remove("active");
		productModal.setAttribute("aria-hidden", "true");
		lockScroll(false);

		// Limpa hash (fica mais clean)
		// Mantém o histórico limpo sem dar reload
		if (window.location.hash.startsWith("#p=")) {
			history.replaceState(null, "", window.location.pathname + window.location.search);
		}
	}

	function getProductShareLink(code){
	const base = window.location.origin + window.location.pathname;
	return `${base}#p=${encodeURIComponent(code)}`;
}

async function copyShareLink(code){
	if(!code) return;

	const link = getProductShareLink(code);

	try{
		await navigator.clipboard.writeText(link);
		showShareToast();
	}catch(err){
		// fallback (para browsers antigos)
		const temp = document.createElement("input");
		temp.value = link;
		document.body.appendChild(temp);
		temp.select();
		document.execCommand("copy");
		document.body.removeChild(temp);
		showShareToast();
	}
}

function showShareToast(){
	if(!shareToast) return;
	shareToast.classList.add("show");
	setTimeout(() => {
		shareToast.classList.remove("show");
	}, 1600);
}


	/* ==========================
	   Cart
	========================== */
	function cartKeyForItem(product, size) {
		return `${product.code}__${size}`;
	}

	function addToCart(product, size, qty) {
		if (!product) return;
		const q = Math.max(1, Number(qty || 1));

		const key = cartKeyForItem(product, size);
		const found = cart.find((i) => i.key === key);

		if (found) {
			found.qty += q;
		} else {
			cart.push({
				key,
				code: product.code,
				brand: product.brand,
				name: product.name,
				size,
				price: product.price,
				image: product.image,
				qty: q,
			});
		}

		saveCart();
		renderCart();
		updateCartCount();

		// Pixel: AddToCart
		track("AddToCart", {
			content_name: product.name,
			content_ids: [product.code],
			content_type: "product",
			value: product.price * q,
			currency: "MZN",
		});
	}

	function removeCartItem(key) {
		cart = cart.filter((i) => i.key !== key);
		saveCart();
		renderCart();
		updateCartCount();
	}

	function changeQty(key, delta) {
		const item = cart.find((i) => i.key === key);
		if (!item) return;

		item.qty = Math.max(1, item.qty + delta);
		saveCart();
		renderCart();
		updateCartCount();
	}

	function clearCart() {
		cart = [];
		saveCart();
		renderCart();
		updateCartCount();
	}

	function cartTotalValue() {
		return cart.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty)), 0);
	}

	function updateCartCount() {
		const count = cart.reduce((sum, i) => sum + Number(i.qty), 0);
		if (cartCount) cartCount.textContent = String(count);
		if (cartCountTop) cartCountTop.textContent = String(count);
		if (cartCountBottom) cartCountBottom.textContent = String(count);
	}

	function renderCart() {
		if (!cartList || !cartEmpty || !cartTotal) return;

		cartList.innerHTML = "";

		if (cart.length === 0) {
			cartEmpty.style.display = "block";
			cartTotal.textContent = formatMT(0);
			return;
		}

		cartEmpty.style.display = "none";

		cart.forEach((item) => {
			const row = document.createElement("div");
			row.className = "cart-item";

			const thumb = document.createElement("div");
			thumb.className = "cart-thumb";
			thumb.style.backgroundImage = `url('${item.image}')`;

			const info = document.createElement("div");
			info.className = "cart-info";

			const title = document.createElement("div");
			title.className = "cart-title";
			title.textContent = item.name;

			const sub = document.createElement("div");
			sub.className = "cart-sub";
			sub.innerHTML = `<span>#${item.code}</span><span>Tam: ${item.size}</span><span>Qtd: ${item.qty}</span>`;

			const bottom = document.createElement("div");
			bottom.className = "cart-row";

			const price = document.createElement("div");
			price.className = "cart-price";
			price.textContent = formatMT(item.price * item.qty);

			const actions = document.createElement("div");
			actions.className = "cart-actions";

			const minus = document.createElement("button");
			minus.className = "cart-mini-btn";
			minus.textContent = "−";
			minus.addEventListener("click", () => changeQty(item.key, -1));

			const plus = document.createElement("button");
			plus.className = "cart-mini-btn";
			plus.textContent = "+";
			plus.addEventListener("click", () => changeQty(item.key, +1));

			const del = document.createElement("button");
			del.className = "cart-mini-btn";
			del.textContent = "Remover";
			del.addEventListener("click", () => removeCartItem(item.key));

			actions.appendChild(minus);
			actions.appendChild(plus);
			actions.appendChild(del);

			bottom.appendChild(price);
			bottom.appendChild(actions);

			info.appendChild(title);
			info.appendChild(sub);
			info.appendChild(bottom);

			row.appendChild(thumb);
			row.appendChild(info);

			cartList.appendChild(row);
		});

		cartTotal.textContent = formatMT(cartTotalValue());
	}

	function openCartDrawer() {
		if (!cartOverlay) return;
		cartOverlay.classList.add("active");
		cartOverlay.setAttribute("aria-hidden", "false");
		lockScroll(true);
	}

	function closeCartDrawer() {
		if (!cartOverlay) return;
		cartOverlay.classList.remove("active");
		cartOverlay.setAttribute("aria-hidden", "true");
		lockScroll(false);
	}

	function buildCheckoutMessage() {
		const total = cartTotalValue();

		const name = (clientName?.value || "").trim();
		const phone = (clientPhone?.value || "").trim();
		const address = (clientAddress?.value || "").trim();
		const payment = (clientPayment?.value || "").trim();

		let message = `Olá! Quero fazer um pedido na Mula Store.%0A%0A`;

		// Dados cliente
		message += `DADOS DO CLIENTE:%0A`;
		message += `• Nome: ${name || "—"}%0A`;
		message += `• Telefone: ${phone || "—"}%0A`;
		message += `• Local: ${address || "—"}%0A`;
		message += `• Pagamento: ${payment || "—"}%0A%0A`;

		// Itens
		message += `ITENS:%0A`;
		cart.forEach((i, idx) => {
			message += `${idx + 1}) ${i.name} (#${i.code})%0A`;
			message += `   Tamanho: ${i.size}%0A`;
			message += `   Quantidade: ${i.qty}%0A`;
			message += `   Subtotal: ${formatMT(i.price * i.qty)}%0A%0A`;
		});

		message += `TOTAL: ${formatMT(total)}%0A%0A`;
		message += `Por favor, confirme disponibilidade e tempo de entrega. Obrigado!`;

		return message;
	}

	function checkoutWhatsApp() {
		if (cart.length === 0) {
			openCartDrawer();
			return;
		}

		// Pixel: InitiateCheckout
		track("InitiateCheckout", {
			num_items: cart.reduce((sum, i) => sum + Number(i.qty), 0),
			value: cartTotalValue(),
			currency: "MZN",
		});

		const message = buildCheckoutMessage();
		const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
		window.open(url, "_blank");
	}

	/* ==========================
	   Popups (Info / Contacto)
	========================== */
	function openPopup(el) {
		if (!el) return;
		el.classList.add("active");
		el.setAttribute("aria-hidden", "false");
		lockScroll(true);
	}

	function closePopup(el) {
		if (!el) return;
		el.classList.remove("active");
		el.setAttribute("aria-hidden", "true");
		lockScroll(false);
	}

	/* ==========================
	   Filters + Search
	========================== */
	function getSlideText(slide) {
		const brand = normalizeText(slide.getAttribute("data-brand"));
		const name = normalizeText(slide.getAttribute("data-name"));
		const color = normalizeText(slide.getAttribute("data-color"));
		const size = normalizeText(slide.getAttribute("data-size"));
		const price = normalizeText(slide.getAttribute("data-price"));
		return `${brand} ${name} ${color} ${size} ${price}`.trim();
	}

	function matchesChips(text) {
		if (activeChips.size === 0) return true;
		for (const chip of activeChips) {
			if (!text.includes(chip)) return false;
		}
		return true;
	}

	function filterSlides() {
		const q = normalizeText(searchInput ? searchInput.value : "");
		let visibleCount = 0;

		slides.forEach((slide) => {
			const text = getSlideText(slide);
			const matchSearch = q.length === 0 ? true : text.includes(q);
			const matchChips = matchesChips(text);
			const match = matchSearch && matchChips;

			slide.style.display = match ? "" : "none";
			if (match) visibleCount++;
		});

		if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
		if (resultsCount) resultsCount.textContent = `Resultados: ${visibleCount}`;
		if (clearSearch) clearSearch.style.display = q.length > 0 ? "block" : "none";

		const active = getActiveSlide();
		if (active && active.style.display === "none") {
			const firstVisible = getVisibleSlides()[0];
			if (firstVisible) setActiveSlide(slides.indexOf(firstVisible));
		}

		updateIndicator();
		syncHeroWithActive();
	}

	/* ==========================
	   FAQ Toggle
	========================== */
	function setupFAQ() {
		$$(".faq-item").forEach((item) => {
			const q = $(".faq-q", item);
			const a = $(".faq-a", item);
			if (!q || !a) return;

			q.addEventListener("click", () => {
				const isOpen = a.style.display === "block";
				$$(".faq-a").forEach((x) => (x.style.display = "none"));
				a.style.display = isOpen ? "none" : "block";
			});
		});
	}

	/* ==========================
	   Scroll Reveal
	========================== */
	function setupReveal() {
		const items = $$(".reveal");
		if (!items.length) return;

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) e.target.classList.add("show");
				});
			},
			{ threshold: 0.12 }
		);

		items.forEach((el) => io.observe(el));
	}

	/* ==========================
	   Smooth Scroll
	========================== */
	function scrollToEl(selector) {
		const el = $(selector);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	/* ==========================
	   Init
	========================== */
	function init() {
		// Year
		if (yearEl) yearEl.textContent = String(new Date().getFullYear());
		if(modalShare){
	modalShare.addEventListener("click", () => {
		if(!modalProduct) return;
		copyShareLink(modalProduct.code);
	});
}


		// Load cart
		loadCart();
		renderCart();
		updateCartCount();

		// Slider events
		slides.forEach((slide, idx) => {
			slide.addEventListener("click", () => setActiveSlide(idx));

			// open product modal
			const openBtn = $(".open-product", slide);
			if (openBtn) {
				openBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					openModal(slideToProduct(slide));
				});
			}

			// buy whatsapp direct (1 item)
			const waBtn = $(".buy-whatsapp", slide);
			if (waBtn) {
				waBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					const p = slideToProduct(slide);

					track("InitiateCheckout", {
						num_items: 1,
						value: p.price,
						currency: "MZN",
					});

					const msg = `Olá! Quero pedir a camiseta (#${p.code}) - ${p.name}. Preço: ${formatMT(p.price)}.`;
					const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
					window.open(url, "_blank");
				});
			}

			// add cart (default M)
			const addBtn = $(".add-cart", slide);
			if (addBtn) {
				addBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					const p = slideToProduct(slide);
					addToCart(p, "M", 1);
					openCartDrawer();
				});
			}
		});

		if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevSlide(); });
		if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextSlide(); });

		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") prevSlide();
			if (e.key === "ArrowRight") nextSlide();

			if (e.key === "Escape") {
				closePopup(contactPopup);
				closePopup(infoPopup);
				closeModal();
				closeCartDrawer();
			}
		});

		// ✅ Partilhar produto (no slide)
const shareBtn = slide.querySelector(".share-product");
if(shareBtn){
	shareBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		const p = slideToProduct(slide);
		copyShareLink(p.code);
	});
}

		// Search
		if (searchInput) searchInput.addEventListener("input", filterSlides);
		if (clearSearch && searchInput) {
			clearSearch.addEventListener("click", () => {
				searchInput.value = "";
				filterSlides();
				searchInput.focus();
			});
		}

		// Chips
		if (quickFilters) {
			$$(".filter-chip", quickFilters).forEach((btn) => {
				if (btn.id === "clearChips") return;
				btn.addEventListener("click", () => {
					const val = normalizeText(btn.getAttribute("data-filter"));
					if (activeChips.has(val)) {
						activeChips.delete(val);
						btn.classList.remove("active");
					} else {
						activeChips.add(val);
						btn.classList.add("active");
					}
					filterSlides();
				});
			});
		}

		if (clearChipsBtn) {
			clearChipsBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				activeChips.clear();
				$$(".filter-chip").forEach((b) => b.classList.remove("active"));
				filterSlides();
			});
		}

		// Popups
		if (openContact) openContact.addEventListener("click", () => openPopup(contactPopup));
		if (openInfo) openInfo.addEventListener("click", () => openPopup(infoPopup));
		if (openInfoTop) openInfoTop.addEventListener("click", () => openPopup(infoPopup));

		[contactPopup, infoPopup].forEach((popup) => {
			if (!popup) return;
			popup.addEventListener("click", () => closePopup(popup));
			const card = $(".popup-card", popup);
			if (card) card.addEventListener("click", (e) => e.stopPropagation());
			const closeBtn = $(".popup-close", popup);
			if (closeBtn) closeBtn.addEventListener("click", () => closePopup(popup));
		});

		// Modal events
		if (closeProductModal) closeProductModal.addEventListener("click", closeModal);
		if (productModal) {
			productModal.addEventListener("click", closeModal);
			const card = $(".modal-card", productModal);
			if (card) card.addEventListener("click", (e) => e.stopPropagation());
		}

		if (qtyMinus) {
			qtyMinus.addEventListener("click", () => {
				selectedQty = Math.max(1, selectedQty - 1);
				if (qtyValue) qtyValue.textContent = String(selectedQty);
			});
		}

		if (qtyPlus) {
			qtyPlus.addEventListener("click", () => {
				selectedQty = Math.min(99, selectedQty + 1);
				if (qtyValue) qtyValue.textContent = String(selectedQty);
			});
		}

		if (modalAddToCart) {
			modalAddToCart.addEventListener("click", () => {
				if (!modalProduct) return;
				addToCart(modalProduct, selectedSize, selectedQty);
				closeModal();
				openCartDrawer();
			});
		}

		if (modalBuyNow) {
			modalBuyNow.addEventListener("click", () => {
				if (!modalProduct) return;

				track("InitiateCheckout", {
					num_items: selectedQty,
					value: modalProduct.price * selectedQty,
					currency: "MZN",
				});

				const msg =
					`Olá! Quero comprar agora:%0A%0A` +
					`Produto: ${modalProduct.name} (#${modalProduct.code})%0A` +
					`Tamanho: ${selectedSize}%0A` +
					`Quantidade: ${selectedQty}%0A` +
					`Preço: ${formatMT(modalProduct.price)}%0A` +
					`Total: ${formatMT(modalProduct.price * selectedQty)}%0A%0A` +
					`Por favor, confirme disponibilidade. Obrigado!`;

				const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
				window.open(url, "_blank");
			});
		}

		// Cart drawer events
		if (openCart) openCart.addEventListener("click", openCartDrawer);
		if (openCartBottom) openCartBottom.addEventListener("click", openCartDrawer);
		if (openCartTop) openCartTop.addEventListener("click", openCartDrawer);

		if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
		if (cartOverlay) {
			cartOverlay.addEventListener("click", closeCartDrawer);
			const drawer = $(".drawer", cartOverlay);
			if (drawer) drawer.addEventListener("click", (e) => e.stopPropagation());
		}

		if (cartCheckout) cartCheckout.addEventListener("click", checkoutWhatsApp);
		if (cartClear) cartClear.addEventListener("click", clearCart);

		// Hero CTAs
		if (scrollToCollection) scrollToCollection.addEventListener("click", () => scrollToEl("#coleccao"));
		if (heroCTA) heroCTA.addEventListener("click", () => scrollToEl("#coleccao"));
		if (heroExplore) heroExplore.addEventListener("click", () => scrollToEl("#coleccao"));

		if (finalCTA) finalCTA.addEventListener("click", () => {
			openCartDrawer();
			if (cart.length === 0) scrollToEl("#coleccao");
		});

		if (finalScroll) finalScroll.addEventListener("click", () => scrollToEl("#coleccao"));
		if (footerCTA) footerCTA.addEventListener("click", () => {
			openCartDrawer();
			if (cart.length === 0) scrollToEl("#coleccao");
		});

		// Hero mini actions
		if (miniOpen) {
			miniOpen.addEventListener("click", () => {
				const active = getActiveSlide();
				if (!active) return;
				openModal(slideToProduct(active));
			});
		}

		if (miniBuy) {
			miniBuy.addEventListener("click", () => {
				const active = getActiveSlide();
				if (!active) return;
				addToCart(slideToProduct(active), "M", 1);
				openCartDrawer();
			});
		}

		// FAQ
		setupFAQ();

		// Reveal
		setupReveal();

		// First sync
		setActiveSlide(slides.findIndex((s) => s.classList.contains("active")) || 0);
		filterSlides();
		syncHeroWithActive();

		// Abrir produto se vier via link (#p=03)
		openFromHash();

		// Se mudar hash manualmente
		window.addEventListener("hashchange", () => {
			openFromHash();
		});
	}

	document.addEventListener("DOMContentLoaded", init);
})();
