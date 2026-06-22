const productContainer =
document.getElementById("product-container");

const API_URL =
"https://api.escuelajs.co/api/v1/products";

async function loadProducts() {

    try {

        const response = await fetch(API_URL);

        const products = await response.json();

        displayProducts(products.slice(0, 8));

    } catch(error) {

        console.log("Error:", error);

    }
}

function displayProducts(products) {

    productContainer.innerHTML = "";

    products.forEach(product => {

        productContainer.innerHTML += `
        <div class="card">
            <img src="${product.images[0]}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button>Add to Cart</button>
        </div>
        `;
    });
}

loadProducts();