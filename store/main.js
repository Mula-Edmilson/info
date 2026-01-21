class AccordionSlider {
	constructor() {
		this.slides = document.querySelectorAll(".slide");
		this.prevBtn = document.querySelector(".nav-prev");
		this.nextBtn = document.querySelector(".nav-next");
		this.currentIndex = -1;

		this.init();
	}

	init() {
		this.slides.forEach((slide, index) => {
			slide.addEventListener("click", () => this.setActiveSlide(index));
		});

		this.prevBtn.addEventListener("click", () => this.previousSlide());
		this.nextBtn.addEventListener("click", () => this.nextSlide());

		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") this.previousSlide();
			if (e.key === "ArrowRight") this.nextSlide();
		});
	}

	setActiveSlide(index) {
		if (this.currentIndex === index) {
			this.slides.forEach((slide) => slide.classList.remove("active"));
			this.currentIndex = -1;
		} else {
			this.slides.forEach((slide) => slide.classList.remove("active"));
			this.slides[index].classList.add("active");
			this.currentIndex = index;
		}
	}

	nextSlide() {
		const nextIndex =
			this.currentIndex === -1 ? 0 : (this.currentIndex + 1) % this.slides.length;
		this.setActiveSlide(nextIndex);
	}

	previousSlide() {
		const prevIndex =
			this.currentIndex === -1
				? this.slides.length - 1
				: (this.currentIndex - 1 + this.slides.length) % this.slides.length;
		this.setActiveSlide(prevIndex);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const slider = new AccordionSlider();

	// ==========================
	// ✅ POPUPS
	// ==========================
	const contactPopup = document.getElementById("contactPopup");
	const infoPopup = document.getElementById("infoPopup");

	const openContact = document.getElementById("openContact");
	const openInfo = document.getElementById("openInfo");

	function openPopup(popupEl){
		if(!popupEl) return;
		popupEl.classList.add("active");
	}

	function closePopup(popupEl){
		if(!popupEl) return;
		popupEl.classList.remove("active");
	}

	openContact.addEventListener("click", (e) => {
		e.stopPropagation();
		openPopup(contactPopup);
	});

	openInfo.addEventListener("click", (e) => {
		e.stopPropagation();
		openPopup(infoPopup);
	});

	[contactPopup, infoPopup].forEach((popup) => {
		if(!popup) return;

		popup.addEventListener("click", () => closePopup(popup));

		const card = popup.querySelector(".popup-card");
		if(card){
			card.addEventListener("click", (e) => e.stopPropagation());
		}

		const closeBtn = popup.querySelector(".popup-close");
		if(closeBtn){
			closeBtn.addEventListener("click", () => closePopup(popup));
		}
	});

	document.addEventListener("keydown", (e) => {
		if(e.key === "Escape"){
			closePopup(contactPopup);
			closePopup(infoPopup);
		}
	});

	// ==========================
	// ✅ Indicador de Slide Activo (NOVO)
	// ==========================
	const indicator = document.getElementById("slideIndicator");
	const slides = document.querySelectorAll(".slide");

	function updateIndicator(){
		if(!indicator) return;

		const total = slides.length;
		let current = 0;

		slides.forEach((s, i) => {
			if(s.classList.contains("active")) current = i + 1;
		});

		// se nenhum estiver activo, assume o primeiro
		if(current === 0) current = 1;

		const pad = (n) => String(n).padStart(2, "0");
		indicator.textContent = `${pad(current)}/${pad(total)}`;
	}

	// actualiza ao clicar nos slides
	slides.forEach((s) => {
		s.addEventListener("click", () => {
			setTimeout(updateIndicator, 50);
		});
	});

	// actualiza ao navegar com setas
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			setTimeout(updateIndicator, 80);
		}
	});

	// actualiza ao clicar nos botões prev/next
	const prevBtn = document.querySelector(".nav-prev");
	const nextBtn = document.querySelector(".nav-next");

	if(prevBtn) prevBtn.addEventListener("click", () => setTimeout(updateIndicator, 80));
	if(nextBtn) nextBtn.addEventListener("click", () => setTimeout(updateIndicator, 80));

	updateIndicator();

// ==========================
// ✅ Pesquisa rápida (MELHORADA)
// ==========================
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const emptyMsg = document.getElementById("searchEmptyMsg");

function normalizeText(str){
	return (str || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function filterSlides(query){
	const q = normalizeText(query);
	let visibleCount = 0;

	slides.forEach((slide) => {
		const brand = normalizeText(slide.getAttribute("data-brand"));
		const name = normalizeText(slide.getAttribute("data-name"));
		const color = normalizeText(slide.getAttribute("data-color"));
		const size = normalizeText(slide.getAttribute("data-size"));

		const full = `${brand} ${name} ${color} ${size}`.trim();
		const match = full.includes(q);

		slide.style.display = match ? "" : "none";
		if(match) visibleCount++;
	});

	// Mostrar mensagem se não houver resultados
	if(emptyMsg){
		emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
	}

	// Mostrar botão limpar apenas quando tiver texto
	if(clearSearch){
		clearSearch.style.display = q.length > 0 ? "block" : "none";
	}
}

if(searchInput){
	searchInput.addEventListener("input", (e) => {
		filterSlides(e.target.value);
	});
}

if(clearSearch && searchInput){
	clearSearch.addEventListener("click", () => {
		searchInput.value = "";
		filterSlides("");
		searchInput.focus();
	});
}

// Inicial
filterSlides("");

	// ==========================
	// ✅ Botão Comprar / WhatsApp (NOVO)
	// ==========================
	const whatsappNumber = "258846342251"; // <- troca para o teu número (sem +)

	document.querySelectorAll(".buy-whatsapp").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();

			const title = btn.getAttribute("data-title") || "Produto";
			const price = btn.getAttribute("data-price") || "";
			const code = btn.getAttribute("data-code") || "";

			const message = `Olá! Quero comprar/pedir a camiseta (${code}) - ${title}. Preço: ${price}.`;
			const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

			window.open(url, "_blank");
		});
	});
});

