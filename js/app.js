const API_URL = "https://api.escuelajs.co/api/v1/products";

/* =========================
   DOM ELEMENTS
========================= */
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
let cart = JSON.parse(localStorage.getItem("nomadFitsCart")) || [];

/* =========================
   HELPERS
========================= */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    men: "Premium cotton blend with breathable fabric and travel-ready comfort.",
    women: "Soft lightweight fabric with comfort, flexibility, and a clean modern fit.",
    shoes: "Durable upper material, cushioned sole, and lightweight support.",
    accessories: "Practical travel-friendly design with durable everyday materials."
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
   CATEGORY MAPPING
========================= */
function getMappedCategory(product) {
  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const originalCategory = (product.category?.name || "").toLowerCase();
  const text = `${title} ${desc} ${originalCategory}`;

  // SHOES
  if (
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("boot") ||
    text.includes("loafer") ||
    text.includes("heel")
  ) {
    return "shoes";
  }

  // ACCESSORIES
  if (
    text.includes("bag") ||
    text.includes("watch") ||
    text.includes("belt") ||
    text.includes("cap") ||
    text.includes("hat") ||
    text.includes("wallet") ||
    text.includes("accessor") ||
    text.includes("backpack")
  ) {
    return "accessories";
  }

  // WOMEN
  if (
    text.includes("dress") ||
    text.includes("skirt") ||
    text.includes("blouse") ||
    text.includes("women") ||
    text.includes("female") ||
    text.includes("handbag")
  ) {
    return "women";
  }

  // MEN
  if (
    text.includes("shirt") ||
    text.includes("jacket") ||
    text.includes("hoodie") ||
    text.includes("polo") ||
    text.includes("men") ||
    text.includes("male") ||
    text.includes("pant") ||
    text.includes("jean") ||
    text.includes("trouser")
  ) {
    return "men";
  }

  // FALLBACK FROM API CATEGORY
  if (originalCategory.includes("shoe")) return "shoes";
  if (originalCategory.includes("misc")) return "accessories";
  if (originalCategory.includes("clothes")) return "men";

  return "men";
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    description: product.description || "No description available.",
    image:
      Array.isArray(product.images) && product.images.length
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

/* =========================
   FETCH PRODUCTS
========================= */
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const fashionProducts = data
      .filter((item) => {
        const cat = item.category?.name?.toLowerCase() || "";
        return (
          cat.includes("clothes") ||
          cat.includes("shoes") ||
          cat.includes("misc")
        );
      })
      .slice(0, 28)
      .map(normalizeProduct);

    allProducts = fashionProducts;
    filteredProducts = [...allProducts];

    renderTrendingProducts();
    renderProducts();
  } catch (error) {
    console.error("Error fetching products:", error);

    allProducts = [
      {
        id: 1001,
        title: "Men's Travel Shirt",
        price: 45,
        description: "Breathable shirt for daily wear and travel comfort.",
        image: "https://via.placeholder.com/400x500?text=Mens+Shirt",
        category: "men",
        originalCategory: "Clothes",
        rating: "4.5",
        isSale: true,
        isNew: true,
        isBestSeller: false
      },
      {
        id: 1002,
        title: "Women's Urban Dress",
        price: 58,
        description: "A modern lightweight dress with comfort and style.",
        image: "https://via.placeholder.com/400x500?text=Womens+Dress",
        category: "women",
        originalCategory: "Clothes",
        rating: "4.7",
        isSale: false,
        isNew: true,
        isBestSeller: true
      },
      {
        id: 1003,
        title: "Leather Sneakers",
        price: 92,
        description: "Modern sneakers for everyday movement and travel.",
        image: "https://via.placeholder.com/400x500?text=Sneakers",
        category: "shoes",
        originalCategory: "Shoes",
        rating: "4.8",
        isSale: true,
        isNew: false,
        isBestSeller: true
      },
      {
        id: 1004,
        title: "Travel Backpack",
        price: 40,
        description: "Compact and stylish backpack for daily essentials.",
        image: "https://via.placeholder.com/400x500?text=Backpack",
        category: "accessories",
        originalCategory: "Accessories",
        rating: "4.4",
        isSale: false,
        isNew: false,
        isBestSeller: false
      }
    ];

    filteredProducts = [...allProducts];
    renderTrendingProducts();
    renderProducts();
    showToast("Live API unavailable. Showing demo products.");
  }
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
        ${product.isSale ? `<span class="sale-badge">SALE</span>` : ""}
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.title}" class="product-image" />
          <span class="quick-preview">Quick Preview</span>
        </div>
        <div class="product-info">
          <h3>${product.title}</h3>
          <p class="product-meta">${capitalize(product.category)}</p>
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
   FILTER + SORT
========================= */
function applyFiltersAndSort() {
  let results = [...allProducts];

  if (selectedCategory !== "all") {
    results = results.filter((product) => product.category === selectedCategory);
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

/* =========================
   RENDER PRODUCTS
========================= */
function renderProducts() {
  productCount.textContent = filteredProducts.length;

  if (!filteredProducts.length) {
    productsGrid.innerHTML = `<p>No products found for this category.</p>`;
    return;
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
      <div class="product-card">
        ${product.isSale ? `<span class="sale-badge">SALE</span>` : ""}
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.title}" class="product-image" />
          <span class="quick-preview">Quick Preview</span>
        </div>
        <div class="product-info">
          <h3>${product.title}</h3>
          <p class="product-meta">${capitalize(product.category)}</p>
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
      <img src="${product.image}" alt="${product.title}" />
    </div>

    <div class="modal-info">
      <h2>${product.title}</h2>
      <p class="modal-category">${capitalize(product.category)} • ${product.originalCategory}</p>

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
fetchProducts();