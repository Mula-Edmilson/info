'use strict';

// Element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// Sidebar variables and functionality
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
sidebarBtn.addEventListener("click", function() { elementToggleFunc(sidebar); });

// Custom select variables and functionality for portfolio
const select = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-select-value]');
const filterBtn = document.querySelectorAll('[data-filter-btn]');

if (select) {
  select.addEventListener('click', function () { elementToggleFunc(this); });
}

for(let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener('click', function() {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// Filter functionality for portfolio
const filterItems = document.querySelectorAll('[data-filter-item]');

const filterFunc = function (selectedValue) {
  for(let i = 0; i < filterItems.length; i++) {
    if(selectedValue === "todos") {
      filterItems[i].classList.add('active');
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add('active');
    } else {
      filterItems[i].classList.remove('active');
    }
  }
}

// Filter button functionality for larger screens
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener('click', function() {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove('active');
    this.classList.add('active');
    lastClickedBtn = this;
  })
}

// Contact form variables and functionality
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

for(let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener('input', function () {
    if(form.checkValidity()) {
      formBtn.removeAttribute('disabled');
    } else { 
      formBtn.setAttribute('disabled', '');
    }
  })
}

// Page navigation variables and functionality
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

for(let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener('click', function() {
    for(let j = 0; j < pages.length; j++) {
      if(this.innerHTML.toLowerCase() === pages[j].dataset.page) {
        pages[j].classList.add('active');
        navigationLinks[j].classList.add('active');
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove('active');
        navigationLinks[j].classList.remove('active');
      }
    }
  });
}