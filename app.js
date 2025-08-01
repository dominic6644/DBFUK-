import React, { useState, useEffect } from 'react';

function App() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('/api/products')
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error('Error fetching products:', error));
    }, []);

    return (
        <div className="App">
            <h1>Latest Listings</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <h2>{product.title}</h2>
                        <p>{product.price}</p>
                        <div>
                            {product.image_urls.map((url, index) => (
                                <img key={index} src={url} alt={product.title} style={{ width: '200px' }} />
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
