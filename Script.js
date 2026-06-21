const productsDiv = document.getElementById("products");
const cartSpan = document.getElementById("cart");

let cartCount = 0;

fetch("https://api.escuelajs.co/api/v1/products")
    .then(response => response.json())
    .then(products => {

        products.slice(0, 8).forEach(product => {

            productsDiv.innerHTML += `
                <div class="card">
                    <img src="${product.images[0]}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p>$${product.price}</p>
                    <button onclick="addToCart()">Add To Cart</button>
                </div>
            `;
        });

    })
    .catch(error => {
        productsDiv.innerHTML = "<p>Failed to load products.</p>";
        console.log(error);
    });

function addToCart() {
    cartCount++;
    cartSpan.textContent = cartCount;
}