const productsDiv = document.getElementById("products");
const cartSpan = document.getElementById("cart");
const searchInput = document.getElementById("searchInput");
const productCount = document.getElementById("productCount");
const subscribeBtn = document.getElementById("subscribeBtn");
const topBtn = document.getElementById("topBtn");

let cartCount = 0;
let allProducts = [];

// Welcome Message
window.addEventListener("load", () => {
    setTimeout(() => {
        alert("Welcome to Nomad Fits!");
    }, 1000);
});

// Fetch Products
fetch("https://api.escuelajs.co/api/v1/products")
    .then(response => response.json())
    .then(products => {
        allProducts = products.slice(0, 12);
        displayProducts(allProducts);
    });

// Display Products
function displayProducts(products) {

    productsDiv.innerHTML = "";

    productCount.textContent =
        `Showing ${products.length} Products`;

    products.forEach(product => {

        productsDiv.innerHTML += `
            <div class="card">
                <img src="${product.images[0]}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart()">
                    Add To Cart
                </button>
            </div>
        `;
    });
}

// Cart Counter
function addToCart() {
    cartCount++;
    cartSpan.textContent = cartCount;
}

// Search Products
searchInput.addEventListener("input", () => {

    const searchText =
        searchInput.value.toLowerCase();

    const filteredProducts =
        allProducts.filter(product =>
            product.title
                .toLowerCase()
                .includes(searchText)
        );

    displayProducts(filteredProducts);
});

// Smooth Scroll
document.querySelectorAll("nav a")
    .forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            document
                .querySelector(link.getAttribute("href"))
                .scrollIntoView({
                    behavior: "smooth"
                });

        });

    });

// Newsletter
subscribeBtn.addEventListener("click", () => {

    const email =
        document.getElementById("emailInput").value;

    if (email === "") {
        alert("Please enter your email.");
        return;
    }

    alert("Thank you for subscribing!");
});

// Back To Top Button
window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});