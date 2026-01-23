/* ================================
   Mula Store — Premium JS (FIXED)
   - Hamburger menu
   - Modal horizontal scroll (2 pages)
   - Bottom bar fixed global
   - Cart + Pixel + Share link
   - CHECKOUT VIA TELEGRAM (SECURE via Apps Script)
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

	const scrollToEl = (id) => {
		const el = document.querySelector(id);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	/* ==========================
	   Config (Telegram via Apps Script)
	   IMPORTANTE:
	   - NÃO colocar TOKEN no front-end.
	   - Aqui usamos um endpoint seguro (Apps Script).
	========================== */
	const TELEGRAM_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwSULnT1ecmhlxxas5t_Ps0ggFF59R2VLigwFHqNVuXp6HPuK-D5TqJUm_G8jFhl9LiEQ/exec";
 
	// ↑ Cola aqui o URL do teu Google Apps Script publicado (Web App)
	// Exemplo:
	// const TELEGRAM_WEBHOOK_URL = "https://script.google.com/macros/s/XXXX/exec";

	const TELEGRAM_CHAT_ID = "128879739"; // o que enviaste

	/* ==========================
	   Pixel helper
	========================== */
	function track(eventName, payload = {}) {
		try {
			if (typeof window.fbq === "function") {
				window.fbq("track", eventName, payload);
			}
		} catch {}
	}
     function pulseCartCounters() {
  const pills = [cartCount, cartCountTop, cartCountBottom, cartCountMobile].filter(Boolean);

  pills.forEach((p) => {
    p.classList.remove("pulse");
    // força reflow para reiniciar animação
    void p.offsetWidth;
    p.classList.add("pulse");
  });

  setTimeout(() => pills.forEach((p) => p.classList.remove("pulse")), 300);
}

function flashButtonAdded(btn) {
  if (!btn) return;
  btn.classList.add("added");
  setTimeout(() => btn.classList.remove("added"), 280);
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

	// Bottom bar buttons
	const openContact = $("#openContact");
	const openInfo = $("#openInfo");
	const openCartBottom = $("#openCartBottom");

	// Header buttons
	const openInfoTop = $("#openInfoTop");
	const openCartTop = $("#openCartTop");
	const scrollToCollection = $("#scrollToCollection");

	// Hero buttons
	const heroCTA = $("#heroCTA");
	const heroExplore = $("#heroExplore");
	const finalCTA = $("#finalCTA");
	const finalScroll = $("#finalScroll");
	const footerCTA = $("#footerCTA");

	// Popups
	const contactPopup = $("#contactPopup");
	const infoPopup = $("#infoPopup");

	// Product modal
	const productModal = $("#productModal");
	const closeProductModal = $("#closeProductModal");

	const modalPages = $("#modalPages");
	const modalDots = $("#modalDots");

	const modalImage = $("#modalImage");
	const modalCode = $("#modalCode");
	const modalBrand = $("#modalBrand");
	const modalTitle = $("#modalTitle");
	const modalPrice = $("#modalPrice");
	const modalQuality = $("#modalQuality");
	const modalColor = $("#modalColor");
	const modalNeck = $("#modalNeck");
	const modalDelivery = $("#modalDelivery");
	const modalMeta = $("#modalMeta");
	const modalDetailsToggle = $("#modalDetailsToggle");

	const sizeRow = $("#sizeRow");
	const qtyMinus = $("#qtyMinus");
	const qtyPlus = $("#qtyPlus");
	const qtyValue = $("#qtyValue");
	const modalAddToCart = $("#modalAddToCart");
	const modalBuyNow = $("#modalBuyNow");

	const modalShare = $("#modalShare");
	const shareToast = $("#shareToast");

	// Cart drawer
	const cartOverlay = $("#cartOverlay");
	const closeCart = $("#closeCart");
	const cartList = $("#cartList");
	const cartEmpty = $("#cartEmpty");
	const cartTotal = $("#cartTotal");
	const cartCheckout = $("#cartCheckout");
	const cartClear = $("#cartClear");

	// Cart counters
	const cartCount = $("#cartCount");
	const cartCountTop = $("#cartCountTop");
	const cartCountBottom = $("#cartCountBottom");
	const cartCountMobile = $("#cartCountMobile");

	// Checkout fields
	const clientName = $("#clientName");
	const clientPhone = $("#clientPhone");
	const clientAddress = $("#clientAddress");
	const clientPayment = $("#clientPayment");

	// Hero mini
	const heroPreview = $("#heroPreview");
	const miniCollectionName = $("#miniCollectionName");
	const miniPrice = $("#miniPrice");
	const miniOpen = $("#miniOpen");
	const miniBuy = $("#miniBuy");

	const yearEl = $("#year");

	// Hamburger menu
	const hamburgerBtn = $("#hamburgerBtn");
	const mobileMenu = $("#mobileMenu");
	const closeMobileMenu = $("#closeMobileMenu");
	const openInfoMobile = $("#openInfoMobile");
	const openCartMobile = $("#openCartMobile");
	const goCollectionMobile = $("#goCollectionMobile");

	/* ==========================
	   State
	========================== */
	let currentIndex = 0;
	let activeChips = new Set();

	let modalProduct = null;
	let selectedSize = "M";
	let selectedQty = 1;

	let cart = [];

	/* ==========================
	   Storage
	========================== */
	const CART_KEY = "mula_cart_v3";

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
	   Slider
	========================== */
	function getVisibleSlides() {
		return slides.filter((s) => s.style.display !== "none");
	}

	function getActiveSlide() {
		return $(".slide.active") || slides[0] || null;
	}

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
	   Product data
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
	   Share link (#p=03)
	========================== */
	function setHashProduct(code) {
		if (!code) return;
		window.location.hash = `p=${encodeURIComponent(code)}`;
	}

	function getHashProductCode() {
		const h = (window.location.hash || "").replace("#", "").trim();
		if (!h) return null;

		const parts = h.split("&");
		for (const p of parts) {
			const [k, v] = p.split("=");
			if (k === "p" && v) return decodeURIComponent(v);
		}
		return null;
	}

	function getProductShareLink(code) {
		const base = window.location.origin + window.location.pathname;
		return `${base}#p=${encodeURIComponent(code)}`;
	}

	async function copyShareLink(code) {
		if (!code) return;

		const link = getProductShareLink(code);

		try {
			await navigator.clipboard.writeText(link);
			showShareToast();
		} catch {
			const temp = document.createElement("input");
			temp.value = link;
			document.body.appendChild(temp);
			temp.select();
			document.execCommand("copy");
			document.body.removeChild(temp);
			showShareToast();
		}
	}

	function showShareToast() {
		if (!shareToast) return;
		shareToast.classList.add("show");
		setTimeout(() => shareToast.classList.remove("show"), 1600);
	}

	function openFromHash() {
		const code = getHashProductCode();
		if (!code) return;

		const slide = findSlideByCode(code);
		if (!slide) return;

		setActiveSlide(slides.indexOf(slide));
		openModal(slideToProduct(slide));
	}

	/* ==========================
	   Hero sync
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
	   Modal horizontal dots
	========================== */
	function updateModalDots() {
		if (!modalPages || !modalDots) return;
		const dots = $$(".dot", modalDots);
		if (!dots.length) return;

		const pageIndex = Math.round(modalPages.scrollLeft / modalPages.clientWidth);
		dots.forEach((d) => d.classList.remove("active"));
		if (dots[pageIndex]) dots[pageIndex].classList.add("active");
	}

	function goModalPage(index) {
		if (!modalPages) return;
		const x = index * modalPages.clientWidth;
		modalPages.scrollTo({ left: x, behavior: "smooth" });
	}

	/* ==========================
	   Modal open/close
	========================== */
	function openModal(product) {
		if (!productModal || !product) return;

		modalProduct = product;
		selectedSize = "M";
		selectedQty = 1;

		if (modalImage) modalImage.style.backgroundImage = `url('${product.image}')`;
		if (modalCode) modalCode.textContent = `#${product.code}`;
		if (modalBrand) modalBrand.textContent = product.brand;
		if (modalTitle) modalTitle.textContent = product.name;
		if (modalPrice) modalPrice.textContent = formatMT(product.price);

		if (modalQuality) modalQuality.textContent = product.quality || "—";
		if (modalColor) modalColor.textContent = product.color || "—";
		if (modalNeck) modalNeck.textContent = product.neck || "—";
		if (modalDelivery) modalDelivery.textContent = product.delivery || "—";

		// sizes
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

		// Mobile: começar com detalhes escondidos
		productModal.classList.remove("details-expanded");
		productModal.classList.add("details-collapsed");
		if (modalDetailsToggle) modalDetailsToggle.textContent = "Detalhes";

		// modal always opens on page 0
		if (modalPages) modalPages.scrollLeft = 0;
		updateModalDots();

		setHashProduct(product.code);

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

		if (window.location.hash.startsWith("#p=")) {
			history.replaceState(null, "", window.location.pathname + window.location.search);
		}
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
		pulseCartCounters();

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
		if (cartCountMobile) cartCountMobile.textContent = String(count);
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

		let message = `🛒 NOVO PEDIDO — Mula Store\n\n`;

		message += `DADOS DO CLIENTE:\n`;
		message += `• Nome: ${name || "—"}\n`;
		message += `• Telefone: ${phone || "—"}\n`;
		message += `• Local: ${address || "—"}\n`;
		message += `• Pagamento: ${payment || "—"}\n\n`;

		message += `ITENS:\n`;
		cart.forEach((i, idx) => {
			message += `${idx + 1}) ${i.name} (#${i.code})\n`;
			message += `   Tamanho: ${i.size}\n`;
			message += `   Quantidade: ${i.qty}\n`;
			message += `   Subtotal: ${formatMT(i.price * i.qty)}\n\n`;
		});

		message += `TOTAL: ${formatMT(total)}\n\n`;
		message += `📌 Por favor, confirmar disponibilidade e tempo de entrega.`;

		return message;
	}

	async function sendOrderToTelegram(message) {
		// Se não tiver URL, avisamos no console para não "parecer que não funciona"
		if (!TELEGRAM_WEBHOOK_URL || TELEGRAM_WEBHOOK_URL.trim().length < 10) {
			console.error(
				"[Mula Store] TELEGRAM_WEBHOOK_URL está vazio. Cola o URL do Google Apps Script no main.js."
			);
			alert("Erro ao enviar pedido. Tenta novamente em instantes.");
			return { ok: false };
		}

		try {
			const res = await fetch(TELEGRAM_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    message,
    source: "mula-store",
    ts: Date.now(),
  }),
});

			const data = await res.json().catch(() => ({}));

			if (!res.ok || data?.ok === false) {
				console.error("[Mula Store] Erro Telegram:", data);
				return { ok: false, data };
			}

			return { ok: true, data };
		} catch (err) {
			console.error("[Mula Store] Falha de rede:", err);
			return { ok: false, err };
		}
	}
function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.classList.remove("success", "error");
  toast.classList.add(type === "error" ? "error" : "success");
  toast.textContent = message;

  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setButtonLoading(btn, isLoading, loadingText = "A enviar...") {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.oldText = btn.textContent;
    btn.textContent = loadingText;
    btn.classList.add("is-loading");
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.oldText || btn.textContent;
    btn.classList.remove("is-loading");
    btn.disabled = false;
  }
}

	async function checkoutSend() {
  if (cart.length === 0) {
    openCartDrawer();
    showToast("O carrinho está vazio.", "error");
    return;
  }

  track("InitiateCheckout", {
    num_items: cart.reduce((sum, i) => sum + Number(i.qty), 0),
    value: cartTotalValue(),
    currency: "MZN",
  });

  const message = buildCheckoutMessage();

  // Loading premium
  setButtonLoading(cartCheckout, true, "A enviar pedido...");

  const result = await sendOrderToTelegram(message);

  setButtonLoading(cartCheckout, false);

  if (result.ok) {
    showToast("Pedido enviado com sucesso. Vamos confirmar contigo em breve.", "success");
    clearCart();
    closeCartDrawer();
  } else {
    showToast("Não foi possível enviar agora. Tenta novamente.", "error");
  }
}


	/* ==========================
	   Popups
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
	   FAQ toggle
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
	   Hamburger menu
	========================== */
	function openMobileMenu() {
		if (!mobileMenu || !hamburgerBtn) return;
		mobileMenu.classList.add("active");
		mobileMenu.setAttribute("aria-hidden", "false");
		hamburgerBtn.classList.add("active");
		hamburgerBtn.setAttribute("aria-expanded", "true");
		lockScroll(true);
	}

	function closeMobileMenuFn() {
		if (!mobileMenu || !hamburgerBtn) return;
		mobileMenu.classList.remove("active");
		mobileMenu.setAttribute("aria-hidden", "true");
		hamburgerBtn.classList.remove("active");
		hamburgerBtn.setAttribute("aria-expanded", "false");
		lockScroll(false);
	}

	/* ==========================
	   Init + Events
	========================== */
	function init() {
		loadCart();
		renderCart();
		updateCartCount();
		updateIndicator();
		syncHeroWithActive();
		setupFAQ();

		// year
		if (yearEl) yearEl.textContent = String(new Date().getFullYear());

		// slider click open details
		slides.forEach((slide) => {
			slide.addEventListener("click", () => {
				if (slide.style.display === "none") return;
				setActiveSlide(slides.indexOf(slide));
			});
		});

		// arrows
		if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextSlide(); });
		if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevSlide(); });

		// open product modal
		$$(".open-product").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const slide = btn.closest(".slide");
				openModal(slideToProduct(slide));
			});
		});

		// add cart
		$$(".add-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const slide = btn.closest(".slide");
    const p = slideToProduct(slide);
    addToCart(p, "M", 1);
    flashButtonAdded(btn);
    openCartDrawer();
  });
});

		// popups
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

		// modal close
		if (closeProductModal) closeProductModal.addEventListener("click", closeModal);
		if (productModal) {
			productModal.addEventListener("click", closeModal);
			const card = $(".modal-card", productModal);
			if (card) card.addEventListener("click", (e) => e.stopPropagation());
		}

		// Botão "Detalhes" (apenas no modal)
		if (modalDetailsToggle) {
			modalDetailsToggle.addEventListener("click", () => {
				if (!productModal) return;

				const isCollapsed = productModal.classList.contains("details-collapsed");

				if (isCollapsed) {
					productModal.classList.remove("details-collapsed");
					productModal.classList.add("details-expanded");
					modalDetailsToggle.textContent = "Ocultar detalhes";
				} else {
					productModal.classList.remove("details-expanded");
					productModal.classList.add("details-collapsed");
					modalDetailsToggle.textContent = "Detalhes";
				}
			});
		}

		// modal pages dots update
		if (modalPages) {
			modalPages.addEventListener("scroll", () => updateModalDots(), { passive: true });
		}
		if (modalDots) {
			const dots = $$(".dot", modalDots);
			dots.forEach((d, idx) => d.addEventListener("click", () => goModalPage(idx)));
		}

		// qty
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

		// modal add/buy/share
		if (modalAddToCart) {
  modalAddToCart.addEventListener("click", () => {
    if (!modalProduct) return;
    addToCart(modalProduct, selectedSize, selectedQty);
    flashButtonAdded(modalAddToCart);
    closeModal();
    openCartDrawer();
  });
}

		// BUY NOW (Telegram)
		if (modalBuyNow) {
			modalBuyNow.addEventListener("click", async () => {
				if (!modalProduct) return;

				track("InitiateCheckout", {
					num_items: selectedQty,
					value: modalProduct.price * selectedQty,
					currency: "MZN",
				});

				const msg =
					`⚡ COMPRA RÁPIDA — Mula Store\n\n` +
					`Produto: ${modalProduct.name} (#${modalProduct.code})\n` +
					`Tamanho: ${selectedSize}\n` +
					`Quantidade: ${selectedQty}\n` +
					`Preço: ${formatMT(modalProduct.price)}\n` +
					`Total: ${formatMT(modalProduct.price * selectedQty)}\n\n` +
					`📌 Por favor, confirme disponibilidade.`;

				const result = await sendOrderToTelegram(msg);

				if (result.ok) {
					alert("Pedido enviado com sucesso. Vamos confirmar contigo em breve.");
					closeModal();
				} else {
					alert("Não foi possível enviar o pedido agora. Tenta novamente.");
				}
			});
		}

		if (modalShare) {
			modalShare.addEventListener("click", async () => {
				if (!modalProduct) return;
				await copyShareLink(modalProduct.code);
			});
		}

		// cart open
		const openCart = $("#openCart");
		if (openCart) openCart.addEventListener("click", openCartDrawer);
		if (openCartBottom) openCartBottom.addEventListener("click", openCartDrawer);
		if (openCartTop) openCartTop.addEventListener("click", openCartDrawer);

		if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
		if (cartOverlay) {
			cartOverlay.addEventListener("click", closeCartDrawer);
			const drawer = $(".drawer", cartOverlay);
			if (drawer) drawer.addEventListener("click", (e) => e.stopPropagation());
		}

		// Checkout (Telegram)
		if (cartCheckout) cartCheckout.addEventListener("click", checkoutSend);
		if (cartClear) cartClear.addEventListener("click", clearCart);

		// hero CTAs
		if (scrollToCollection) scrollToCollection.addEventListener("click", () => scrollToEl("#coleccao"));
		if (heroCTA) heroCTA.addEventListener("click", () => scrollToEl("#coleccao"));
		if (heroExplore) heroExplore.addEventListener("click", () => scrollToEl("#coleccao"));
		if (finalScroll) finalScroll.addEventListener("click", () => scrollToEl("#coleccao"));

		if (finalCTA) finalCTA.addEventListener("click", openCartDrawer);
		if (footerCTA) footerCTA.addEventListener("click", openCartDrawer);

		// hero mini
		if (miniOpen) miniOpen.addEventListener("click", () => openModal(slideToProduct(getActiveSlide())));
		if (miniBuy) miniBuy.addEventListener("click", () => {
			const p = slideToProduct(getActiveSlide());
			addToCart(p, "M", 1);
			openCartDrawer();
		});

		// search
		if (searchInput) searchInput.addEventListener("input", filterSlides);
		if (clearSearch) clearSearch.addEventListener("click", () => {
			searchInput.value = "";
			filterSlides();
			searchInput.focus();
		});

		// chips
		if (quickFilters) {
			$$(".filter-chip", quickFilters).forEach((chip) => {
				if (chip.id === "clearChips") return;
				chip.addEventListener("click", () => {
					const key = normalizeText(chip.getAttribute("data-filter") || "");
					if (!key) return;

					if (activeChips.has(key)) {
						activeChips.delete(key);
						chip.classList.remove("active");
					} else {
						activeChips.add(key);
						chip.classList.add("active");
					}
					filterSlides();
				});
			});
		}

		if (clearChipsBtn) {
			clearChipsBtn.addEventListener("click", () => {
				activeChips.clear();
				$$(".filter-chip", quickFilters).forEach((c) => c.classList.remove("active"));
				filterSlides();
			});
		}

		// hamburger events
		if (hamburgerBtn)
			hamburgerBtn.addEventListener("click", () => {
				const isOpen = mobileMenu?.classList.contains("active");
				if (isOpen) closeMobileMenuFn();
				else openMobileMenu();
			});

		if (closeMobileMenu) closeMobileMenu.addEventListener("click", closeMobileMenuFn);

		if (mobileMenu) {
			mobileMenu.addEventListener("click", closeMobileMenuFn);
			const inner = $(".mobile-menu-inner", mobileMenu);
			if (inner) inner.addEventListener("click", (e) => e.stopPropagation());
		}

		// mobile menu actions
		if (openInfoMobile)
			openInfoMobile.addEventListener("click", () => {
				closeMobileMenuFn();
				openPopup(infoPopup);
			});

		if (openCartMobile)
			openCartMobile.addEventListener("click", () => {
				closeMobileMenuFn();
				openCartDrawer();
			});

		if (goCollectionMobile)
			goCollectionMobile.addEventListener("click", () => {
				closeMobileMenuFn();
				scrollToEl("#coleccao");
			});

		// mobile links close menu
		$$(".mobile-link").forEach((a) => {
			a.addEventListener("click", () => closeMobileMenuFn());
		});

		// ESC key close
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				closeModal();
				closeCartDrawer();
				closeMobileMenuFn();
				closePopup(contactPopup);
				closePopup(infoPopup);
			}
		});

		// open product from hash
		openFromHash();
	}

	// Start
	document.addEventListener("DOMContentLoaded", init);
})();
