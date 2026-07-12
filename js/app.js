/* =========================
   DOM ELEMENTS
========================= */
const productsGrid = document.getElementById("productsGrid");
const trendingGrid = document.getElementById("trendingGrid");
const productCount = document.getElementById("productCount");

const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

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

/* =========================
   STATE
========================= */
let allProducts = [];
let filteredProducts = [];
let selectedCategory = "all";
let selectedSort = "default";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("nomadFitsCart")) || [];

/* =========================
   CATEGORY LABELS
   (friendly display names for each product category)
========================= */
const CATEGORY_LABELS = {
  tshirts: "T-Shirts",
  hoodies: "Hoodies",
  jackets: "Jackets",
  jeans: "Jeans",
  dresses: "Dresses",
  accessories: "Accessories",
  shoes: "Shoes"
};

const FALLBACK_IMAGE = "https://via.placeholder.com/500x600?text=Nomad+Fits";

/* =========================
   HELPERS
========================= */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || capitalize(category);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function getRating(product) {
  return ((product.id % 5) + 1).toFixed(1);
}

function isSale(product) {
  return product.price > 60 || product.id % 4 === 0;
}

function getOldPrice(product) {
  return (product.price * 1.25).toFixed(2);
}

function getSustainabilityInfo(product) {
  if (product.id % 2 === 0) {
    return "Made with lower-impact materials and designed for longer wear.";
  }
  return "Designed for durability, repeat wear, and everyday comfort.";
}

function getMaterialInfo(category) {
  const materials = {
    tshirts: "100% breathable combed cotton, pre-shrunk for a lasting everyday fit.",
    hoodies: "Brushed cotton-fleece blend that stays soft, warm, and travel-ready.",
    jackets: "Weather-resistant shell with a comfortable inner lining for all-season wear.",
    jeans: "Premium stretch denim built for movement, durability, and a clean silhouette.",
    dresses: "Soft lightweight fabric with comfort, flexibility, and a clean modern drape.",
    accessories: "Practical, travel-friendly design crafted from durable everyday materials.",
    shoes: "Durable upper material, cushioned sole, and lightweight all-day support."
  };

  return materials[category] || "Comfortable, stylish, and built for daily wear.";
}

function getFakeReviews(product) {
  return [
    {
      name: "Alex M.",
      rating: "★★★★★",
      text: `${product.title} feels stylish, comfortable, and easy to wear every day.`
    },
    {
      name: "Jordan T.",
      rating: "★★★★☆",
      text: "The quality is solid and the fit feels great. Good value for the price."
    },
    {
      name: "Sam R.",
      rating: "★★★★★",
      text: "One of my favorite items from the collection. Looks clean and feels premium."
    }
  ];
}

/* =========================
   PRODUCT CATALOG
   Curated clothing-focused catalog (weighted toward
   T-Shirts, Hoodies, Jackets, Jeans, Dresses & Accessories,
   with only a couple of Shoes items).
========================= */
const RAW_PRODUCTS = [
  // T-SHIRTS
  { id: 1, title: "Men's Classic Crew Tee", price: 28, category: "tshirts", desc: "A breathable everyday tee cut from soft combed cotton for all-day comfort.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80" },
  { id: 2, title: "Women's Relaxed Fit Tee", price: 26, category: "tshirts", desc: "A relaxed-fit tee with a soft drape, perfect for layering or wearing solo.", image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=700&q=80" },
  { id: 3, title: "Men's Graphic Tee", price: 32, category: "tshirts", desc: "Bold everyday graphic tee made from mid-weight cotton jersey.", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80" },
  { id: 4, title: "Women's Ribbed Tank Tee", price: 24, category: "tshirts", desc: "A ribbed tank tee that layers easily and moves with you.", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80" },

  // HOODIES
  { id: 5, title: "Men's Essential Hoodie", price: 52, category: "hoodies", desc: "A brushed fleece hoodie built for cool mornings and travel days.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80" },
  { id: 6, title: "Women's Oversized Hoodie", price: 55, category: "hoodies", desc: "An oversized hoodie with a soft fleece lining and relaxed silhouette.", image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=700&q=80" },
  { id: 7, title: "Men's Zip-Up Hoodie", price: 58, category: "hoodies", desc: "A versatile zip-up hoodie that layers cleanly under any jacket.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80" },
  { id: 8, title: "Women's Cropped Hoodie", price: 48, category: "hoodies", desc: "A cropped hoodie with a soft, cozy fit for casual city days.", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80" },

  // JACKETS
  { id: 9, title: "Men's Denim Jacket", price: 78, category: "jackets", desc: "A classic denim jacket with a timeless fit and durable stitching.", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80" },
  { id: 10, title: "Women's Trench Coat", price: 96, category: "jackets", desc: "A tailored trench coat that layers beautifully over any outfit.", image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=700&q=80" },
  { id: 11, title: "Men's Bomber Jacket", price: 84, category: "jackets", desc: "A lightweight bomber jacket built for travel and everyday layering.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80" },
  { id: 12, title: "Women's Puffer Jacket", price: 88, category: "jackets", desc: "A quilted puffer jacket that keeps you warm without weighing you down.", image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=700&q=80" },

  // JEANS
  { id: 13, title: "Men's Slim Fit Jeans", price: 62, category: "jeans", desc: "Stretch denim jeans with a modern slim fit and clean finish.", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80" },
  { id: 14, title: "Women's High-Waist Jeans", price: 64, category: "jeans", desc: "High-waist jeans with a flattering fit and comfortable stretch.", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80" },
  { id: 15, title: "Men's Straight Leg Jeans", price: 60, category: "jeans", desc: "A straight leg cut in durable denim for everyday versatility.", image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=700&q=80" },
  { id: 16, title: "Women's Skinny Jeans", price: 58, category: "jeans", desc: "Skinny jeans with just the right stretch for all-day movement.", image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=700&q=80" },

  // DRESSES
  { id: 17, title: "Women's Midi Wrap Dress", price: 68, category: "dresses", desc: "A flattering wrap dress in lightweight fabric for warm-weather travel.", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80" },
  { id: 18, title: "Women's Summer Floral Dress", price: 54, category: "dresses", desc: "A breezy floral dress made for sunny days and city strolls.", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=80" },
  { id: 19, title: "Women's Evening Dress", price: 89, category: "dresses", desc: "An elegant evening dress with a refined, modern silhouette.", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80" },
  { id: 20, title: "Women's Casual Shirt Dress", price: 49, category: "dresses", desc: "A relaxed shirt dress that transitions easily from day to night.", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80" },

  // ACCESSORIES
  { id: 21, title: "Leather Travel Backpack", price: 72, category: "accessories", desc: "A durable leather-accented backpack sized for daily travel essentials.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80" },
  { id: 22, title: "Classic Aviator Sunglasses", price: 34, category: "accessories", desc: "Timeless aviator sunglasses with UV-protective lenses.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=700&q=80" },
  { id: 23, title: "Minimalist Wrist Watch", price: 65, category: "accessories", desc: "A clean, minimalist watch designed to pair with any outfit.", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80" },
  { id: 24, title: "Woven Leather Belt", price: 29, category: "accessories", desc: "A woven leather belt built for durability and everyday style.", image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=700&q=80" },

  // SHOES (kept minimal — clothing is the focus)
  { id: 25, title: "Men's Canvas Sneakers", price: 68, category: "shoes", desc: "Lightweight canvas sneakers built for everyday movement.", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80" },
  { id: 26, title: "Women's Minimalist Trainers", price: 74, category: "shoes", desc: "Clean, minimalist trainers with a cushioned, all-day comfortable sole.", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80" }
];

/* =========================
   BUILD CATALOG
   Adds computed fields (rating, sale, new, bestseller) to
   each raw product so the rest of the app works exactly
   as it did with the original API-driven data.
========================= */
function buildProduct(raw) {
  const base = {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    description: raw.desc,
    image: raw.image,
    category: raw.category,
    originalCategory: categoryLabel(raw.category)
  };

  return {
    ...base,
    rating: getRating(base),
    isSale: isSale(base),
    isNew: base.id % 3 === 0,
    isBestSeller: base.id % 5 === 0
  };
}

/* =========================
   LOAD PRODUCTS
========================= */
function loadProducts() {
  allProducts = RAW_PRODUCTS.map(buildProduct);
  filteredProducts = [...allProducts];

  renderTrendingProducts();
  renderProducts();
}

/* =========================
   RENDER TRENDING
========================= */
function renderTrendingProducts() {
  const trending = allProducts
    .filter((product) => product.isBestSeller || product.isNew)
    .slice(0, 4);

  trendingGrid.innerHTML = trending
    .map(
      (product) => `
      <div class="product-card">
        <div class="card-badges">
          ${product.isSale ? `<span class="badge sale-badge">SALE</span>` : ""}
          ${product.isNew ? `<span class="badge new-badge">NEW</span>` : ""}
        </div>
        <div class="product-image-wrap">
          <img
            src="${product.image}"
            alt="${product.title}"
            class="product-image"
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
          />
          <span class="quick-preview">Quick Preview</span>
        </div>
        <div class="product-info">
          <p class="product-meta">${categoryLabel(product.category)}</p>
          <h3>${product.title}</h3>
          <div class="product-price">
            $${product.price.toFixed(2)}
            ${product.isSale ? `<span class="old-price">$${getOldPrice(product)}</span>` : ""}
          </div>
          <div class="rating">
            ${"★".repeat(Math.round(product.rating))}
            <span>(${product.rating})</span>
          </div>
          <div class="product-actions">
            <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">
              Add to Cart
            </button>
            <button class="btn secondary-btn view-details-btn" data-id="${product.id}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  attachProductButtons();
}

/* =========================
   FILTER + SORT + SEARCH
========================= */
function applyFiltersAndSort() {
  let results = [...allProducts];

  if (selectedCategory !== "all") {
    results = results.filter((product) => product.category === selectedCategory);
  }

  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    results = results.filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    applyFiltersAndSort();
  });
});

sortSelect.addEventListener("change", (e) => {
  selectedSort = e.target.value;
  applyFiltersAndSort();
});

/* Live search: filters products as the user types, with a
   short debounce so it doesn't re-render on every keystroke. */
let searchDebounce;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchTerm = e.target.value;
    applyFiltersAndSort();
  }, 200);
});

/* =========================
   RENDER PRODUCTS
========================= */
function renderProducts() {
  productCount.textContent = filteredProducts.length;

  if (!filteredProducts.length) {
    productsGrid.innerHTML = `<p class="empty-state">No products found. Try a different filter or search term.</p>`;
    return;
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
      <div class="product-card">
        <div class="card-badges">
          ${product.isSale ? `<span class="badge sale-badge">SALE</span>` : ""}
          ${product.isNew ? `<span class="badge new-badge">NEW</span>` : ""}
        </div>
        <div class="product-image-wrap">
          <img
            src="${product.image}"
            alt="${product.title}"
            class="product-image"
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
          />
          <span class="quick-preview">Quick Preview</span>
        </div>
        <div class="product-info">
          <p class="product-meta">${categoryLabel(product.category)}</p>
          <h3>${product.title}</h3>
          <div class="product-price">
            $${product.price.toFixed(2)}
            ${product.isSale ? `<span class="old-price">$${getOldPrice(product)}</span>` : ""}
          </div>
          <div class="rating">
            ${"★".repeat(Math.round(product.rating))}
            <span>(${product.rating})</span>
          </div>
          <div class="product-actions">
            <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">
              Add to Cart
            </button>
            <button class="btn secondary-btn view-details-btn" data-id="${product.id}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  attachProductButtons();
}

function attachProductButtons() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });

  document.querySelectorAll(".view-details-btn").forEach((button) => {
    button.addEventListener("click", () =>
      openProductModal(Number(button.dataset.id))
    );
  });
}

/* =========================
   PRODUCT MODAL
========================= */
function openProductModal(productId) {
  const product = allProducts.find((item) => item.id === productId);
  if (!product) return;

  const reviews = getFakeReviews(product);

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <img
        src="${product.image}"
        alt="${product.title}"
        onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
      />
    </div>

    <div class="modal-info">
      <h2>${product.title}</h2>
      <p class="modal-category">${categoryLabel(product.category)}</p>

      <div class="rating">
        ${"★".repeat(Math.round(product.rating))}
        <span>(${product.rating})</span>
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
        <h4>Size Selection</h4>
        <div class="size-options">
          <button class="size-btn active">S</button>
          <button class="size-btn">M</button>
          <button class="size-btn">L</button>
          <button class="size-btn">XL</button>
        </div>
      </div>

      <div class="modal-block">
        <h4>Customer Reviews</h4>
        ${reviews
          .map(
            (review) => `
            <div class="review-card">
              <strong>${review.name}</strong>
              <span>${review.rating}</span>
              <p>${review.text}</p>
            </div>
          `
          )
          .join("")}
      </div>

      <button class="btn primary-btn" id="modalAddToCartBtn">Add to Cart</button>
      <p class="confirmation-text" id="modalConfirmText"></p>
    </div>
  `;

  productModal.classList.remove("hidden");
  overlay.classList.remove("hidden");

  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("modalAddToCartBtn").addEventListener("click", () => {
    addToCart(product.id);
    document.getElementById("modalConfirmText").textContent =
      "Added to cart successfully!";
  });
}

function closeAllPanels() {
  cartSidebar.classList.remove("open");
  productModal.classList.add("hidden");
  overlay.classList.add("hidden");
}

/* =========================
   CART
========================= */
function saveCart() {
  localStorage.setItem("nomadFitsCart", JSON.stringify(cart));
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = allProducts.find((item) => item.id === productId);
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
  const item = cart.find((item) => item.id === productId);
  if (!item) return;
  item.quantity += 1;
  saveCart();
  renderCart();
}

function decreaseQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `<p>Your cart is empty.</p>`;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <img
            src="${item.image}"
            alt="${item.title}"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
          />
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
      `
      )
      .join("");
  }

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  document.querySelectorAll(".increase-btn").forEach((button) => {
    button.addEventListener("click", () =>
      increaseQuantity(Number(button.dataset.id))
    );
  });

  document.querySelectorAll(".decrease-btn").forEach((button) => {
    button.addEventListener("click", () =>
      decreaseQuantity(Number(button.dataset.id))
    );
  });

  document.querySelectorAll(".remove-btn-cart").forEach((button) => {
    button.addEventListener("click", () =>
      removeFromCart(Number(button.dataset.id))
    );
  });
}

/* =========================
   UI EVENTS
========================= */
cartBtn.addEventListener("click", () => {
  cartSidebar.classList.add("open");
  overlay.classList.remove("hidden");
});

closeCartBtn.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
  if (productModal.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
});

closeModalBtn.addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);

checkoutBtn.addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  showToast("Checkout demo complete. Thank you for shopping with Nomad Fits!");
  cart = [];
  saveCart();
  renderCart();
  closeAllPanels();
});

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});

/* =========================
   CONTACT FORM VALIDATION
========================= */
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

/* =========================
   INIT
========================= */
renderCart();
loadProducts();