document.addEventListener('DOMContentLoaded', () => {
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    const bikeTypeSelect = document.getElementById('bike-type');
    const filterButton = document.getElementById('filter-button');
    const resetButton = document.getElementById('reset-button');
    const productContainer = document.getElementById('product-container');

    if (!priceSlider || !priceValue || !bikeTypeSelect || !filterButton || !productContainer) {
        console.error('One or more elements not found in the DOM.');
        return;
    }

    // Update price display on slider change
    priceSlider.addEventListener('input', () => {
        priceValue.textContent = `£${priceSlider.value}`;
    });

    // Filter products when button is clicked
    filterButton.addEventListener('click', () => {
        filterProducts();
    });

    // Reset button event listener
    resetButton.addEventListener('click', () => {
        // Reset slider and dropdown
        priceSlider.value = 10000;
        priceValue.textContent = `£${priceSlider.value}`;
        bikeTypeSelect.selectedIndex = 0;

        // Reload all products
        fetchProducts();
    });

    // Fetch all products (no filter)
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/products');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }

    // Filter products based on selected price and bike type
    async function filterProducts() {
        const maxPrice = parseFloat(priceSlider.value);
        const selectedBikeType = bikeTypeSelect.value;
        const selectedBikeTypes = selectedBikeType ? [selectedBikeType] : [];

        console.log('Filtering with:', { maxPrice, selectedBikeTypes });

        try {
            const response = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maxPrice, bikeTypes: selectedBikeTypes })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', response.status, errorText);
                throw new Error('Network response was not ok');
            }

            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching filtered products:', error);
            productContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }

    // Display products in the container
    function displayProducts(products) {
        productContainer.innerHTML = '';

        if (!products.length) {
            productContainer.innerHTML = '<p>No products found within that price range.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const productLink = product.product_link || '#';
            const imageUrl = (product.image_urls && product.image_urls.length > 0)
                ? product.image_urls[0].replace(/^https?:\/\/\/\//, 'https://') // fix malformed image URL
                : '';

            productCard.innerHTML = `
                <a href="${productLink}" target="_blank" class="product-link">
                    <img src="${imageUrl}" alt="Product Image">
                    <h2>${product.title}</h2>
                    <p>Price: ${product.price}</p>
                </a>
            `;

            productContainer.appendChild(productCard);
        });
    }

    // Initial fetch for all products when the page loads
    fetchProducts();
});
