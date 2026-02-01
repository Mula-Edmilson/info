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

	function openSuccessPopup() {
  if (!successPopup) return;
  successPopup.classList.add("active");
  successPopup.setAttribute("aria-hidden", "false");
}

function closeSuccessPopup() {
  if (!successPopup) return;
  successPopup.classList.remove("active");
  successPopup.setAttribute("aria-hidden", "true");
}


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
	const successPopup = $("#successPopup");
	const successCloseBtn = $("#successCloseBtn");

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

	const brandDot = $(".brand-dot");


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
  const cleanCode = String(code || "").trim();
  if (!cleanCode) return window.location.href;

  // Ex: "01" -> "p01.html"
  const page = `p${cleanCode}.html`;

  // Link absoluto (funciona em qualquer host)
  return new URL(page, window.location.href).href;
}
	async function copyShareLink(code) {
  if (!code) return;

  const link = getProductShareLink(code);

  // Se existir partilha nativa (telemóveis), usa primeiro
  if (navigator.share) {
    try {
      // tenta buscar nome/descrição do produto activo
      const title = modalProduct?.name ? `${modalProduct.name} (#${modalProduct.code})` : "Produto — Mula Store";
      const text = modalProduct?.price
        ? `${modalProduct.name} — ${formatMT(modalProduct.price)}`
        : "Vê este produto na Mula Store";

      await navigator.share({
        title,
        text,
        url: link,
      });

      // opcional: feedback ao utilizador
      showToast("Partilhado com sucesso.", "success");
      return;
    } catch (err) {
      // Se o user cancelar ou falhar, cai para copiar link
    }
  }

  // Fallback: copiar link (desktop + browsers sem share)
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

        // --- CORREÇÃO DA ANIMAÇÃO AQUI ---
        // 1. Primeiro garantimos o display flex
        productModal.style.display = "flex"; 
        
        // 2. Usamos um pequeno timeout para o navegador processar o display antes da animação
        setTimeout(() => {
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
        }, 10); 
        // --------------------------------

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

        // Esconde o display após a animação de saída (400ms conforme seu CSS)
        setTimeout(() => {
            if (!productModal.classList.contains('active')) {
                productModal.style.display = "none";
            }
        }, 400);

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

function getBuyerData() {
  const name = (clientName?.value || "").trim();
  const phone = (clientPhone?.value || "").trim();
  const address = (clientAddress?.value || "").trim();
  const payment = (clientPayment?.value || "").trim();

  return { name, phone, address, payment };
}

function buyerFieldsAreValid() {
  const { name, phone, address, payment } = getBuyerData();

  if (!name || !phone || !address || !payment) return false;

  // validação mínima do telefone (podes ajustar)
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return false;

  return true;
}

function requireBuyerFieldsOrBlock() {
  if (buyerFieldsAreValid()) return true;

  // abre carrinho para o utilizador preencher
  openCartDrawer();

  showToast("Preenche todos os dados do comprador para finalizar o pedido.", "error");

  // opcional: focar no primeiro campo vazio
  const { name, phone, address, payment } = getBuyerData();
  if (!name && clientName) clientName.focus();
  else if (!phone && clientPhone) clientPhone.focus();
  else if (!address && clientAddress) clientAddress.focus();
  else if (!payment && clientPayment) clientPayment.focus();

  return false;
}

	async function checkoutSend() {
  if (cart.length === 0) {
    openCartDrawer();
    showToast("O carrinho está vazio.", "error");
    return;
  }
// 🔒 BLOQUEIO: não finaliza sem dados do comprador
  if (!requireBuyerFieldsOrBlock()) return;
  
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
  clearCart();
  closeCartDrawer();
  openSuccessPopup();
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

		// CTA "Detalhes" -> abrir página individual do produto (p01.html, p02.html...)
$$(".open-product").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const slide = btn.closest(".slide");
    if (!slide) return;

    const p = slideToProduct(slide);
    if (!p || !p.code) return;

    // abre a página individual
    const url = getProductShareLink(p.code);

    // se quiser abrir na mesma aba:
    window.location.href = url;

    // se quiser abrir em nova aba (alternativa):
    // window.open(url, "_blank");
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
				if (!requireBuyerFieldsOrBlock()) return;

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
					closeModal();
					openSuccessPopup();
				}
			});
		}

		if (modalShare) {
			modalShare.addEventListener("click", async () => {
				if (!modalProduct) return;
				await copyShareLink(modalProduct.code);
			});
		}

		if (successCloseBtn) {
  successCloseBtn.addEventListener("click", closeSuccessPopup);
}

if (successPopup) {
  successPopup.addEventListener("click", (e) => {
    if (e.target === successPopup) closeSuccessPopup();
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
if (miniOpen) {
  miniOpen.addEventListener("click", () => {
    const p = slideToProduct(getActiveSlide());
    if (!p || !p.code) return;

    // abre a página individual do produto (p01.html, p02.html, ...)
    window.location.href = getProductShareLink(p.code);
  });
}

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

		window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  // mantém visível um curto momento para não “piscar”
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 1800);
});

		// open product from hash
		openFromHash();
	}

	// Start
	document.addEventListener("DOMContentLoaded", init);
	/* ==========================
   Scroll reveal for titles/subtitles
========================== */
(function initSectionHeadReveal() {
	const heads = document.querySelectorAll(".section-head");

	if (!heads.length) return;

	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in-view");
				}
			});
		},
		{
			root: null,
			threshold: 0.25,
			rootMargin: "0px 0px -10% 0px",
		}
	);

	heads.forEach((h) => io.observe(h));
})();
})();

// Adicione esta função no seu main.js, na seção de eventos de inicialização
function setupPopupLinks() {
    // Adiciona comportamento suave para links nos popups
    const telegramLinks = document.querySelectorAll('.telegram-link');
    telegramLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita fechar o popup ao clicar no link
            
            // Track no Facebook Pixel (se existir)
            try {
                if (typeof window.fbq === 'function') {
                    window.fbq('track', 'Contact', {
                        method: 'telegram',
                        link: 't.me/Ed_Mula'
                    });
                }
            } catch {}
        });
    });
}

// Chame esta função na sua função init():
function init() {
    // ... código existente ...
    setupPopupLinks();
    // ... código existente ...
}

/* ================================
   Toast Notification System
========================== */
const Toast = {
    container: null,
    
    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    },
    
    show(options) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, warning, info, cart
            duration = 4000,
            action = null
        } = options;
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Progress bar for auto-dismiss
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';
        const progress = document.createElement('div');
        progress.className = 'toast-progress-bar';
        progress.style.animationDuration = `${duration}ms`;
        progressBar.appendChild(progress);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Fechar notificação');
        
        // Content
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'toast-title';
            titleEl.textContent = title;
            content.appendChild(titleEl);
        }
        
        if (message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'toast-message';
            messageEl.textContent = message;
            content.appendChild(messageEl);
        }
        
        // Action button
        if (action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action btn ghost mini';
            actionBtn.textContent = action.label;
            actionBtn.style.marginTop = '8px';
            actionBtn.style.fontSize = '12px';
            actionBtn.style.padding = '6px 10px';
            actionBtn.addEventListener('click', () => {
                action.handler();
                this.dismiss(toast);
            });
            content.appendChild(actionBtn);
        }
        
        // Assemble toast
        toast.appendChild(closeBtn);
        toast.appendChild(content);
        toast.appendChild(progressBar);
        
        // Add to container
        this.container.appendChild(toast);
        
        // Show with animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-dismiss
        let dismissTimeout = setTimeout(() => this.dismiss(toast), duration);
        
        // Close button event
        closeBtn.addEventListener('click', () => {
            clearTimeout(dismissTimeout);
            this.dismiss(toast);
        });
        
        // Hover pause
        toast.addEventListener('mouseenter', () => {
            clearTimeout(dismissTimeout);
            progress.style.animationPlayState = 'paused';
        });
        
        toast.addEventListener('mouseleave', () => {
            dismissTimeout = setTimeout(() => this.dismiss(toast), 1000);
            progress.style.animationPlayState = 'running';
        });
        
        return toast;
    },
    
    dismiss(toast) {
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hiding');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 500);
    },
    
    // Helper methods for common toasts
    success(message, title = 'Sucesso!') {
        return this.show({ title, message, type: 'success' });
    },
    
    error(message, title = 'Erro!') {
        return this.show({ title, message, type: 'error' });
    },
    
    info(message, title = 'Informação') {
        return this.show({ title, message, type: 'info' });
    },
    
    cart(message, title = 'Carrinho atualizado') {
        return this.show({ 
            title, 
            message, 
            type: 'cart-toast',
            action: {
                label: 'Ver carrinho',
                handler: () => openCartDrawer()
            }
        });
    }
};

// Initialize toast system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
});

/* ================================
   Advanced Analytics System
========================== */
const Analytics = {
    SESSION_KEY: 'mula_session_id',
    USER_KEY: 'mula_user_id',
    
    init() {
        this.setupSession();
        this.setupUserTracking();
        this.trackPageView();
        this.setupEventListeners();
    },
    
    setupSession() {
        // Generate session ID if not exists
        let sessionId = localStorage.getItem(this.SESSION_KEY);
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.SESSION_KEY, sessionId);
        }
        this.sessionId = sessionId;
        
        // Track session start
        this.logEvent('session', 'start', {
            session_id: sessionId,
            referrer: document.referrer || 'direct',
            landing_page: window.location.pathname
        });
    },
    
    setupUserTracking() {
        // Generate anonymous user ID if not exists
        let userId = localStorage.getItem(this.USER_KEY);
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.USER_KEY, userId);
        }
        this.userId = userId;
    },
    
    trackPageView() {
        const pageData = {
            page_title: document.title,
            page_url: window.location.href,
            page_path: window.location.pathname,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString()
        };
        
        this.logEvent('page', 'view', pageData);
        
        // Also track time on page
        this.pageLoadTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.pageLoadTime;
            this.logEvent('page', 'unload', {
                time_on_page: timeOnPage,
                page_url: window.location.href
            });
        });
    },
    
    setupEventListeners() {
        // Track clicks on important CTAs
        const ctaSelectors = [
            '#heroCTA', '#finalCTA', '.add-cart', '.modal-buy-now',
            '#cartCheckout', '.open-product', '#scrollToCollection'
        ];
        
        ctaSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.addEventListener('click', (e) => {
                    const label = el.textContent.trim() || selector;
                    this.trackCTA(label, window.location.pathname);
                });
            });
        });
        
        // Track form interactions
        const formFields = ['#clientName', '#clientPhone', '#clientAddress', '#clientPayment'];
        formFields.forEach(selector => {
            const field = document.querySelector(selector);
            if (field) {
                field.addEventListener('focus', () => {
                    this.trackFormInteraction(selector.replace('#', ''), 'focus');
                });
                
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        this.trackFormInteraction(selector.replace('#', ''), 'completed');
                    }
                });
            }
        });
        
        // Track product views in slider
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productCode = slide.dataset.code;
                        const productName = slide.dataset.name;
                        this.trackProductView(productCode, productName, index + 1);
                        observer.unobserve(slide); // Track only once per session
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(slide);
        });
    },
    
    // Event tracking methods
    logEvent(category, action, data = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            category,
            action,
            data: {
                ...data,
                user_id: this.userId,
                session_id: this.sessionId,
                url: window.location.href,
                user_agent: navigator.userAgent,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language
            }
        };
        
        // Save to localStorage (circular buffer)
        this.saveEvent(event);
        
        // Send to external analytics if configured
        this.sendToExternalAnalytics(event);
        
        // Facebook Pixel
        this.sendToFacebookPixel(category, action, data);
        
        console.log('[Analytics]', category, action, data);
    },
    
    saveEvent(event) {
        try {
            const events = JSON.parse(localStorage.getItem('mula_analytics_events') || '[]');
            events.push(event);
            
            // Keep only last 1000 events
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            
            localStorage.setItem('mula_analytics_events', JSON.stringify(events));
        } catch (e) {
            console.error('[Analytics] Error saving event:', e);
        }
    },
    
    sendToExternalAnalytics(event) {
        // Example: Send to your backend or Google Analytics
        // if (window.gtag) {
        //     gtag('event', event.action, {
        //         event_category: event.category,
        //         event_label: JSON.stringify(event.data),
        //         value: 1
        //     });
        // }
    },
    
    sendToFacebookPixel(category, action, data) {
        try {
            if (typeof window.fbq === 'function') {
                // Map custom events to Facebook Pixel standard events
                const fbEventMap = {
                    'product_view': 'ViewContent',
                    'add_to_cart': 'AddToCart',
                    'initiate_checkout': 'InitiateCheckout',
                    'purchase': 'Purchase',
                    'lead': 'Lead'
                };
                
                const fbEvent = fbEventMap[action] || action;
                
                fbq('track', fbEvent, {
                    content_category: category,
                    content_name: data.product_name || data.content_name,
                    content_ids: data.product_code ? [data.product_code] : [],
                    content_type: 'product',
                    value: data.value || 0,
                    currency: data.currency || 'MZN',
                    ...data
                });
            }
        } catch (e) {
            console.error('[Analytics] Facebook Pixel error:', e);
        }
    },
    
    // Helper methods for common events
    trackCTA(label, location) {
        this.logEvent('engagement', 'cta_click', {
            cta_label: label,
            location,
            timestamp: Date.now()
        });
    },
    
    trackProductView(code, name, position) {
        this.logEvent('product', 'view', {
            product_code: code,
            product_name: name,
            position,
            currency: 'MZN'
        });
    },
    
    trackAddToCart(product, quantity = 1) {
        this.logEvent('ecommerce', 'add_to_cart', {
            product_code: product.code,
            product_name: product.name,
            quantity,
            price: product.price,
            value: product.price * quantity,
            currency: 'MZN'
        });
    },
    
    trackCheckout(cart, step = 'initiate') {
        const items = cart.map(item => ({
            id: item.code,
            name: item.name,
            quantity: item.qty,
            price: item.price
        }));
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        this.logEvent('ecommerce', 'checkout', {
            step,
            items,
            item_count: items.length,
            total_value: total,
            currency: 'MZN'
        });
    },
    
    trackPurchase(orderData) {
        this.logEvent('ecommerce', 'purchase', {
            transaction_id: 'order_' + Date.now(),
            value: orderData.total,
            tax: 0,
            shipping: 0,
            currency: 'MZN',
            items: orderData.items,
            payment_method: orderData.payment_method
        });
    },
    
    trackFormInteraction(field, action) {
        this.logEvent('form', action, {
            field,
            form_type: 'checkout'
        });
    },
    
    trackError(error, context) {
        this.logEvent('error', 'occurred', {
            error_message: error.message || error,
            error_stack: error.stack,
            context,
            url: window.location.href
        });
    },
    
    // Export data for analysis
    exportData(format = 'json') {
        try {
            const events = JSON.parse(localStorage.getItem('mula_analytics_events') || '[]');
            
            if (format === 'csv') {
                let csv = 'Timestamp,Category,Action,Data\n';
                events.forEach(event => {
                    csv += `"${event.timestamp}","${event.category}","${event.action}","${JSON.stringify(event.data).replace(/"/g, '""')}"\n`;
                });
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mula_analytics_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                
                return `Exported ${events.length} events as CSV`;
            }
            
            return events;
        } catch (e) {
            this.trackError(e, 'export_data');
            return null;
        }
    },
    
    // Get analytics dashboard data
    getDashboardData() {
        const events = JSON.parse(localStorage.getItem('mula_analytics_events') || '[]');
        
        // Filter events from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentEvents = events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
        
        return {
            total_sessions: this.getUniqueSessions(),
            total_users: this.getUniqueUsers(),
            total_events: events.length,
            recent_events: recentEvents.length,
            
            popular_products: this.getPopularProducts(events),
            conversion_rate: this.getConversionRate(events),
            
            events_by_category: this.groupByCategory(events),
            events_by_hour: this.groupByHour(events),
            
            cta_clicks: events.filter(e => e.action === 'cta_click').length,
            add_to_cart: events.filter(e => e.action === 'add_to_cart').length,
            checkouts: events.filter(e => e.action === 'checkout').length
        };
    },
    
    // Helper methods for data analysis
    getUniqueSessions() {
        const events = JSON.parse(localStorage.getItem('mula_analytics_events') || '[]');
        const sessions = new Set(events.map(e => e.data.session_id));
        return sessions.size;
    },
    
    getUniqueUsers() {
        const events = JSON.parse(localStorage.getItem('mula_analytics_events') || '[]');
        const users = new Set(events.map(e => e.data.user_id));
        return users.size;
    },
    
    getPopularProducts(events) {
        const productViews = events
            .filter(e => e.action === 'view' && e.category === 'product')
            .reduce((acc, e) => {
                const code = e.data.product_code;
                acc[code] = (acc[code] || 0) + 1;
                return acc;
            }, {});
        
        return Object.entries(productViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([code, views]) => ({ code, views }));
    },
    
    getConversionRate(events) {
        const views = events.filter(e => e.action === 'view' && e.category === 'product').length;
        const purchases = events.filter(e => e.action === 'purchase').length;
        
        return views > 0 ? ((purchases / views) * 100).toFixed(2) + '%' : '0%';
    },
    
    groupByCategory(events) {
        return events.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1;
            return acc;
        }, {});
    },
    
    groupByHour(events) {
        const hours = Array(24).fill(0);
        events.forEach(e => {
            const hour = new Date(e.timestamp).getHours();
            hours[hour]++;
        });
        return hours;
    }
};

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
    
    // Add analytics methods to window for debugging
    window.MulaAnalytics = Analytics;
});

/* ================================
   Parallax Effects System
========================== */
const Parallax = {
    heroCard: null,
    isMobile: window.innerWidth <= 768,
    
    init() {
        if (this.isMobile) return; // Disable on mobile
        
        this.heroCard = document.querySelector('.hero-card');
        if (!this.heroCard) return;
        
        // Add data attribute for CSS
        this.heroCard.setAttribute('data-tilt', 'true');
        
        // Create inner wrapper if it doesn't exist
        if (!this.heroCard.querySelector('.hero-card-inner')) {
            const inner = document.createElement('div');
            inner.className = 'hero-card-inner';
            inner.innerHTML = this.heroCard.innerHTML;
            this.heroCard.innerHTML = '';
            this.heroCard.appendChild(inner);
        }
        
        this.setupMouseMove();
        this.setupScrollParallax();
    },
    
    setupMouseMove() {
        this.heroCard.addEventListener('mousemove', (e) => {
            if (this.isMobile) return;
            
            const rect = this.heroCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 3; // Max 3 degrees
            const rotateX = ((centerY - y) / centerY) * 3; // Max 3 degrees
            
            this.heroCard.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
            `;
            
            // Parallax for preview image
            const preview = this.heroCard.querySelector('.hero-card-preview');
            if (preview) {
                const moveX = ((x - centerX) / centerX) * 10;
                const moveY = ((y - centerY) / centerY) * 10;
                preview.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
            }
            
            // Subtle parallax for text elements
            const titleAccent = document.querySelector('.hero-title-accent');
            if (titleAccent) {
                titleAccent.style.transform = `translateX(${rotateY * 2}px)`;
            }
        });
        
        this.heroCard.addEventListener('mouseleave', () => {
            if (this.isMobile) return;
            
            this.heroCard.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                translateZ(0)
            `;
            
            const preview = this.heroCard.querySelector('.hero-card-preview');
            if (preview) {
                preview.style.transform = 'translateX(0) translateY(0)';
            }
            
            const titleAccent = document.querySelector('.hero-title-accent');
            if (titleAccent) {
                titleAccent.style.transform = 'translateX(0)';
            }
        });
    },
    
    setupScrollParallax() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (this.isMobile) return;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateScrollParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial update
        this.updateScrollParallax();
    },
    
    updateScrollParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Hero section parallax
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${rate * 0.2}px)`;
        }
        
        // Hero card scroll effect
        if (this.heroCard) {
            const cardRate = scrolled * -0.3;
            this.heroCard.style.transform = `translateY(${cardRate}px)`;
        }
        
        // Trust items staggered parallax
        const trustItems = document.querySelectorAll('.trust-item');
        trustItems.forEach((item, index) => {
            const itemRate = scrolled * -0.1 * (index + 1);
            item.style.transform = `translateY(${itemRate}px)`;
        });
        
        // Section titles parallax
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            const titleRect = title.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (titleRect.top < viewportHeight && titleRect.bottom > 0) {
                const distanceFromCenter = (titleRect.top + titleRect.height / 2) - (viewportHeight / 2);
                const titleRate = distanceFromCenter * 0.1;
                title.style.transform = `translateY(${titleRate}px)`;
            }
        });
    },
    
    // 3D card tilt for product slides
    initCardTilts() {
        if (this.isMobile) return;
        
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.addEventListener('mousemove', (e) => {
                const rect = slide.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 2;
                const rotateX = ((centerY - y) / centerY) * 2;
                
                slide.style.transform = `
                    perspective(800px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale(1.02)
                `;
                
                // Parallax for content
                const content = slide.querySelector('.slide-content');
                if (content) {
                    const moveX = ((x - centerX) / centerX) * 15;
                    const moveY = ((y - centerY) / centerY) * 15;
                    content.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });
            
            slide.addEventListener('mouseleave', () => {
                slide.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
                
                const content = slide.querySelector('.slide-content');
                if (content) {
                    content.style.transform = 'translate(0, 0)';
                }
            });
        });
    }
};

// Initialize parallax on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Parallax.init();
    
    // Initialize card tilts after a delay
    setTimeout(() => {
        Parallax.initCardTilts();
    }, 1000);
});

// Re-initialize on resize
window.addEventListener('resize', () => {
    Parallax.isMobile = window.innerWidth <= 768;
});

/* ================================
   Scroll Animations System
========================== */
const ScrollAnimations = {
    observer: null,
    progressBar: null,
    
    init() {
        this.createProgressBar();
        this.setupIntersectionObserver();
        this.setupScrollProgress();
        this.setupSmoothScrolling();
        this.animateHeroElements();
    },
    
    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'scroll-progress';
        document.body.appendChild(this.progressBar);
    },
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        // Observe all reveal elements
        document.querySelectorAll('.reveal').forEach(el => {
            this.observer.observe(el);
        });
        
        // Observe staggered containers
        document.querySelectorAll('.reveal-stagger').forEach(el => {
            this.observer.observe(el);
        });
        
        // Observe other animation types
        document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .scroll-fade-in').forEach(el => {
            this.observer.observe(el);
        });
    },
    
    animateElement(element) {
        element.classList.add('animate-in');
        
        // If it's a staggered container, animate children
        if (element.classList.contains('reveal-stagger')) {
            const children = element.children;
            Array.from(children).forEach((child, index) => {
                child.style.transitionDelay = `${0.1 * index}s`;
            });
        }
        
        // Special animations for specific elements
        if (element.classList.contains('trust-item')) {
            this.animateTrustItem(element);
        }
        
        if (element.classList.contains('review-card')) {
            this.animateReviewCard(element);
        }
        
        if (element.classList.contains('feature-card')) {
            this.animateFeatureCard(element);
        }
    },
    
    setupScrollProgress() {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            if (this.progressBar) {
                this.progressBar.style.transform = `scaleX(${scrolled / 100})`;
            }
            
            // Trigger scroll-based animations
            this.triggerScrollAnimations();
        });
    },
    
    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            });
        });
        
        // Add smooth scroll behavior to buttons
        const scrollButtons = [
            '#scrollToCollection',
            '#heroExplore',
            '#finalScroll',
            '#goCollectionMobile'
        ];
        
        scrollButtons.forEach(selector => {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector('#coleccao');
                    if (target) this.scrollToElement(target);
                });
            }
        });
    },
    
    scrollToElement(element, offset = 80) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },
    
    triggerScrollAnimations() {
        // Animate elements based on scroll position
        const scrollPosition = window.pageYOffset + window.innerHeight;
        
        document.querySelectorAll('.scroll-fade-in').forEach(el => {
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            
            if (scrollPosition > elementPosition + 100) {
                el.classList.add('visible');
            }
        });
    },
    
    animateHeroElements() {
        // Animate hero elements on load
        setTimeout(() => {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroCta = document.querySelector('.hero-cta');
            const heroTrust = document.querySelector('.hero-trust');
            
            if (heroTitle) heroTitle.classList.add('animate-in');
            if (heroSubtitle) setTimeout(() => heroSubtitle.classList.add('animate-in'), 300);
            if (heroCta) setTimeout(() => heroCta.classList.add('animate-in'), 600);
            if (heroTrust) setTimeout(() => heroTrust.classList.add('animate-in'), 900);
        }, 500);
    },
    
    animateTrustItem(item) {
        // Add floating animation with delay
        const index = Array.from(item.parentNode.children).indexOf(item);
        item.style.animationDelay = `${index * 0.3}s`;
    },
    
    animateReviewCard(card) {
        // Add subtle scale animation
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }, 100);
    },
    
    animateFeatureCard(card) {
        // Add icon animation
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            icon.style.transform = 'scale(0) rotate(-180deg)';
            
            setTimeout(() => {
                icon.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                icon.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        }
    },
    
    // Dynamic counter animation
    animateCounter(element, targetValue, duration = 2000) {
        let startValue = 0;
        const increment = targetValue / (duration / 16); // 60fps
        
        const updateCounter = () => {
            startValue += increment;
            if (startValue < targetValue) {
                element.textContent = Math.floor(startValue).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetValue.toLocaleString();
            }
        };
        
        element.classList.add('animating');
        updateCounter();
        
        setTimeout(() => {
            element.classList.remove('animating');
        }, duration);
    },
    
    // Initialize counters if they exist
    initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-counter'));
            if (!isNaN(target)) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateCounter(counter, target);
                            observer.unobserve(counter);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(counter);
            }
        });
    },
    
    // Add wave divider to sections
    addWaveDividers() {
        const sections = document.querySelectorAll('.section-dark, .section:nth-of-type(even)');
        sections.forEach(section => {
            const divider = document.createElement('div');
            divider.className = 'wave-divider';
            section.parentNode.insertBefore(divider, section);
        });
    },
    
    // Re-initialize on resize
    handleResize() {
        // Recalculate animations if needed
        this.observer.disconnect();
        this.setupIntersectionObserver();
    }
};

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    ScrollAnimations.init();
    ScrollAnimations.initCounters();
    ScrollAnimations.addWaveDividers();
    
    // Reinitialize on resize
    window.addEventListener('resize', () => {
        ScrollAnimations.handleResize();
    });
});

// Export for debugging
window.ScrollAnimations = ScrollAnimations;