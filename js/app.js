const API_URL = "https://api.escuelajs.co/api/v1/products";

const productsGrid = document.getElementById("productsGrid");
const trendingGrid = document.getElementById("trendingGrid");
const productCount = document.getElementById("productCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");

const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const overlay = document.getElementById("overlay");
const productModal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

const toast = document.getElementById("toast");

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");
const formSuccess = document.getElementById("formSuccess");

let allProducts = [];
let filteredProducts = [];
let selectedCategory = "all";
let selectedSort = "default";
let cart = JSON.parse(localStorage.getItem("nomadFitsCart")) || [];

/* -----------------------------
   Helpers / Mock UI Data
------------------------------ */

function getRating(product) {
  // Fake rating derived from id so the UI stays consistent
  return ((product.id % 5) + 1).toFixed(1);
}

function isSale(product) {
  return product.price > 60 || product.id % 4 === 0;
}

function getOldPrice(product) {
  return (product.price * 1.25).toFixed(2);
}

function getMaterialInfo(mappedCategory) {
  const map = {
    shirts: "Soft cotton blend, breathable weave, travel-friendly wrinkle resistance.",
    jackets: "Lightweight outer shell with durable stitching and layering comfort.",
    pants: "Flexible stretch fabric with all-day comfort and a clean modern fit.",
    shoes: "Cushioned insole, durable outsole, and lightweight city-to-travel comfort.",
    accessories: "Compact travel-friendly design with a focus on everyday practicality."
  };
  return map[mappedCategory] || "Premium travel-ready material designed for style and comfort.";
}

function getSustainabilityInfo(product) {
  if (product.id % 2 === 0) {
    return "Eco-friendly option: made with lower-impact materials and a more sustainable production focus.";
  }
  return "Built with durability and long-term wear in mind to reduce fast replacement cycles.";
}

function getFakeReviews(product) {
  return [
    {
      name: "Alex M.",
      rating: "★★★★★",
      text: `Really impressed with the fit and quality of ${product.title}. Great for travel and daily wear.`
    },
    {
      name: "Jordan T.",
      rating: "★★★★☆",
      text: "Comfortable, stylish, and easy to pair with other pieces. Shipping was smooth too."
    },
    {
      name: "Sam R.",
      rating: "★★★★★",
      text: "Looks premium and feels practical. Definitely one of my favorite pieces from the collection."
    }
  ];
}

function getMappedCategory(product) {
  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const originalCategory = (product.category?.name || "").toLowerCase();
  const text = `${title} ${desc} ${originalCategory}`;

  if (text.includes("shoe") || text.includes("sneaker") || text.includes("boot")) {
    return "shoes";
  }
  if (text.includes("bag") || text.includes("watch") || text.includes("cap") || text.includes("belt") || text.includes("accessor")) {
    return "accessories";
  }
  if (text.includes("jacket") || text.includes("coat") || text.includes("hoodie")) {
    return "jackets";
  }
  if (text.includes("pant") || text.includes("jean") || text.includes("trouser")) {
    return "pants";
  }
  if (text.includes("shirt") || text.includes("tee") || text.includes("t-shirt") || text.includes("polo")) {
    return "shirts";
  }

  // fallback mapping
  if (originalCategory.includes("shoe")) return "shoes";
  if (originalCategory.includes("clothes")) return "shirts";
  if (originalCategory.includes("misc")) return "accessories";

  return "shirts";
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    description: product.description || "No description available.",
    image: Array.isArray(product.images) && product.images.length
      ? product.images[0]
      : "https://via.placeholder.com/400x500?text=Nomad+Fits",
    category: getMappedCategory(product),
    originalCategory: product.category?.name || "Unknown",
    rating: getRating(product),
    isSale: isSale(product),
    isNew: product.id % 3 === 0,
    isBestSeller: product.id % 5 === 0
  };
}

/* -----------------------------
   Fetch API Products
------------------------------ */

async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Keep mostly fashion-friendly products
    const fashionProducts = data
      .filter(item => {
        const cat = item.category?.name?.toLowerCase() || "";
        return (
          cat.includes("clothes") ||
          cat.includes("shoes") ||
          cat.includes("misc")
        );
      })
      .slice(0, 24)
      .map(normalizeProduct);

    allProducts = fashionProducts;
    filteredProducts = [...allProducts];

    renderTrendingProducts();
    renderProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML = `<p>Failed to load products. Please try again later.</p>`;
    trendingGrid.innerHTML = `<p>Trending products unavailable right now.</p>`;
  }
}

/* -----------------------------
   Trending
------------------------------ */

function renderTrendingProducts() {
  const trending = allProducts
    .filter(product => product.isBestSeller || product.isNew)
    .slice(0, 4);

  trendingGrid.innerHTML = trending.map(product => `
    <div class="product-card">
      ${product.isSale ? `<span class="sale-badge">SALE</span>` : ""}
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" class="product-image" />
        <span class="quick-preview">Quick Preview</span>
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.title}</h3>
        </div>
        <p class="product-meta">${product.category}</p>
        <div class="product-price">
          $${product.price.toFixed(2)}
          ${product.isSale ? `<span class="old-price">$${getOldPrice(product)}</span>` : ""}
        </div>
        <div class="rating">${"★".repeat(Math.round(product.rating))} <span>(${product.rating})</span></div>
        <div class="product-actions">
          <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
          <button class="btn secondary-btn view-details-btn" data-id="${product.id}">View Details</button>
        </div>
      </div>
    </div>
  `).join("");

  attachProductButtons();
}

/* -----------------------------
   Filters + Sorting
------------------------------ */

function applyFiltersAndSort() {
  let results = [...allProducts];

  if (selectedCategory !== "all") {
    results = results.filter(product => product.category === selectedCategory);
  }

  if (selectedSort === "price-low") {
    results.sort((a, b) => a.price - b.price);
  } else if (selectedSort === "price-high") {
    results.sort((a, b) => b.price - a.price);
  } else if (selectedSort === "new-arrivals") {
    results.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  } else if (selectedSort === "bestsellers") {
    results.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  }

  filteredProducts = results;
  renderProducts();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    applyFiltersAndSort();
  });
});

sortSelect.addEventListener("change", (e) => {
  selectedSort = e.target.value;
  applyFiltersAndSort();
});

/* -----------------------------
   Render Shop Products
------------------------------ */

function renderProducts() {
  productCount.textContent = filteredProducts.length;

  if (!filteredProducts.length) {
    productsGrid.innerHTML = `<p>No products found for this category.</p>`;
    return;
  }

  productsGrid.innerHTML = filteredProducts.map(product => `
    <div class="product-card">
      ${product.isSale ? `<span class="sale-badge">SALE</span>` : ""}
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" class="product-image" />
        <span class="quick-preview">Quick Preview</span>
      </div>

      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.title}</h3>
        </div>

        <p class="product-meta">${product.category}</p>

        <div class="product-price">
          $${product.price.toFixed(2)}
          ${product.isSale ? `<span class="old-price">$${getOldPrice(product)}</span>` : ""}
        </div>

        <div class="rating">
          ${"★".repeat(Math.round(product.rating))} <span>(${product.rating})</span>
        </div>

        <div class="product-actions">
          <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
          <button class="btn secondary-btn view-details-btn" data-id="${product.id}">View Details</button>
        </div>
      </div>
    </div>
  `).join("");

  attachProductButtons();
}

function attachProductButtons() {
  const addButtons = document.querySelectorAll(".add-to-cart-btn");
  const detailButtons = document.querySelectorAll(".view-details-btn");

  addButtons.forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      addToCart(id);
    });
  });

  detailButtons.forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      openProductModal(id);
    });
  });
}

/* -----------------------------
   Product Modal
------------------------------ */

function openProductModal(productId) {
  const product = allProducts.find(item => item.id === productId);
  if (!product) return;

  const reviews = getFakeReviews(product);

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <img src="${product.image}" alt="${product.title}" />
    </div>

    <div class="modal-info">
      <h2>${product.title}</h2>
      <p class="modal-category">${product.category} • ${product.originalCategory}</p>

      <div class="rating">
        ${"★".repeat(Math.round(product.rating))} <span>(${product.rating})</span>
      </div>

      <div class="product-price">
        $${product.price.toFixed(2)}
        ${product.isSale ? `<span class="old-price">$${getOldPrice(product)}</span>` : ""}
      </div>

      <p class="modal-desc">${product.description}</p>

      <div class="modal-block">
        <h4>Material & Sustainability</h4>
        <p>${getMaterialInfo(product.category)}</p>
        <p>${getSustainabilityInfo(product)}</p>
      </div>

      <div class="modal-block">
        <h4>Size Selector & Fit Guide</h4>
        <p>Select a size that matches your regular fit. Slim silhouettes may feel slightly fitted.</p>
        <div class="size-options">
          <button class="size-btn active">S</button>
          <button class="size-btn">M</button>
          <button class="size-btn">L</button>
          <button class="size-btn">XL</button>
        </div>
      </div>

      <div class="modal-block">
        <h4>Customer Reviews</h4>
        ${reviews.map(review => `
          <div class="review-card">
            <strong>${review.name}</strong>
            <span>${review.rating}</span>
            <p>${review.text}</p>
          </div>
        `).join("")}
      </div>

      <button class="btn primary-btn" id="modalAddToCartBtn">Add to Cart</button>
      <p class="confirmation-text" id="modalConfirmText"></p>
    </div>
  `;

  productModal.classList.remove("hidden");
  overlay.classList.remove("hidden");

  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
  const modalConfirmText = document.getElementById("modalConfirmText");

  modalAddToCartBtn.addEventListener("click", () => {
    addToCart(product.id);
    modalConfirmText.textContent = "Added to cart successfully!";
  });
}

function closeModal() {
  productModal.classList.add("hidden");
}

/* -----------------------------
   Cart
------------------------------ */

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = allProducts.find(item => item.id === productId);
    if (!product) return;

    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast("Added to cart successfully!");
}

function increaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  item.quantity += 1;
  saveCart();
  renderCart();
}

function decreaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity -= 1;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("nomadFitsCart", JSON.stringify(cart));
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `<p>Your cart is empty.</p>`;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" />
        <div>
          <h4>${item.title}</h4>
          <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
          <div class="cart-item-actions">
            <button class="qty-btn increase-btn" data-id="${item.id}">+</button>
            <button class="qty-btn decrease-btn" data-id="${item.id}">-</button>
            <button class="remove-btn remove-btn-cart" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = totalPrice.toFixed(2);

  attachCartButtons();
}

function attachCartButtons() {
  document.querySelectorAll(".increase-btn").forEach(button => {
    button.addEventListener("click", () => {
      increaseQuantity(Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".decrease-btn").forEach(button => {
    button.addEventListener("click", () => {
      decreaseQuantity(Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".remove-btn-cart").forEach(button => {
    button.addEventListener("click", () => {
      removeFromCart(Number(button.dataset.id));
    });
  });
}

/* -----------------------------
   Cart / Modal / Overlay UI
------------------------------ */

function openCart() {
  cartSidebar.classList.add("open");
  overlay.classList.remove("hidden");
}

function closeCart() {
  cartSidebar.classList.remove("open");
  if (!productModal.classList.contains("hidden")) return;
  overlay.classList.add("hidden");
}

function closeAllPanels() {
  cartSidebar.classList.remove("open");
  productModal.classList.add("hidden");
  overlay.classList.add("hidden");
}

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
closeModalBtn.addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);

/* -----------------------------
   Toast
------------------------------ */

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* -----------------------------
   Mobile Nav
------------------------------ */

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

/* -----------------------------
   Contact Form Validation
------------------------------ */

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;

  nameError.textContent = "";
  emailError.textContent = "";
  messageError.textContent = "";
  formSuccess.textContent = "";

  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const messageValue = messageInput.value.trim();

  if (nameValue.length < 2) {
    nameError.textContent = "Please enter your name.";
    isValid = false;
  }

  if (!emailValue.includes("@") || !emailValue.includes(".")) {
    emailError.textContent = "Please enter a valid email.";
    isValid = false;
  }

  if (messageValue.length < 10) {
    messageError.textContent = "Message should be at least 10 characters.";
    isValid = false;
  }

  if (isValid) {
    formSuccess.textContent = "Your message has been sent successfully!";
    contactForm.reset();
  }
});

/* -----------------------------
   Init
------------------------------ */

renderCart();
fetchProducts();
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode")
      ? "dark"
      : "light"
  );
});