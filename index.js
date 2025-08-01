const puppeteer = require('puppeteer');
const { Pool } = require('pg');

// Configuration for multiple websites, including pagination details and keys for filtering
const websites = [

    
{
        // Acklams Beta
        url: 'https://www.acklamsbeta.co.uk/bikes-1',
        containerSelector: '.product-list-item',
        titleSelector: '.product-list-item-title',
        priceSelector: '.product-list-item-price',
        imageSelector: '.product-list-image-wrapper img',
        hrefAttribute: '.product-list-item a ', // Ensure this targets the correct <a> tag
        baseUrl: 'https://www.acklamsbeta.co.uk',
        hasPagination: false,
    },
    {
        // AG Bikes
        url: 'https://www.agbikes.co.uk/pages/bikes',
        containerSelector: '.multicolumn-card.content-container',
        titleSelector: 'h3',
        priceSelector: '.rte strong',
        imageSelector: '.multicolumn-card__image-wrapper img',
        hrefAttribute: '.multicolumn-card__info a',
        baseUrl: 'https://www.agbikes.co.uk',
        hasPagination: false
    },
    {
        // Road and Trials Sherco
        url: 'https://roadandtrials.co.uk/collections/sherco',
        containerSelector: '.product-grid-item',
        titleSelector: '.product__grid__title',
        priceSelector: '.product__grid__price',
        imageSelector: '.product-grid-item__image',
        hrefAttribute: '.product__grid__info a',
        baseUrl: 'https://roadandtrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 1
    },
    {
        // Road and Trials Beta
        url: 'https://roadandtrials.co.uk/collections/beta',
        containerSelector: '.product-grid-item',
        titleSelector: '.product__grid__title',
        priceSelector: '.product__grid__price',
        imageSelector: '.product-grid-item__image',
        hrefAttribute: '.product__grid__info a',
        baseUrl: 'https://roadandtrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 1
    },
    {
        // Road and Trials Vertigo
        url: 'https://roadandtrials.co.uk/collections/vertigo',
        containerSelector: '.product-grid-item',
        titleSelector: '.product__grid__title',
        priceSelector: '.product__grid__price',
        imageSelector: '.product-grid-item__image',
        hrefAttribute: '.product__grid__info a',
        baseUrl: 'https://roadandtrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 1
    },
    {
        // Road and Trials TRS
        url: 'https://roadandtrials.co.uk/collections/trs-motorcycles',
        containerSelector: '.product-grid-item',
        titleSelector: '.product__grid__title',
        priceSelector: '.product__grid__price',
        imageSelector: '.product-grid-item__image',
        hrefAttribute: '.product__grid__info a',
        baseUrl: 'https://roadandtrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 1
    },
 
    {
        // Road and Trials TRS
        url: 'https://roadandtrials.co.uk/collections/approved-used-trials-bikes',
        containerSelector: '.product-grid-item',
        titleSelector: '.product__grid__title',
        priceSelector: '.product__grid__price',
        imageSelector: '.product-grid-item__image',
        hrefAttribute: '.product__grid__info a',
        baseUrl: 'https://roadandtrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 1
    },


   
    {
        // Inch Perfect Trials
        url: 'https://inchperfecttrials.co.uk/collections/all-bikes?page=1',
        containerSelector: '.grid__item',
        titleSelector: '.product-card__name',
        priceSelector: '.product-card__price',
        imageSelector: ' .grid__item img',
        hrefAttribute: '.grid__item a',
        baseUrl: 'https://inchperfecttrials.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 3
    },

    {
        // BVM Moto New Bike Sales
        url: 'https://bvm-moto.co.uk/index.php?route=product/category&path=161',
        containerSelector: '.product-grid-item',
        titleSelector: '.name',
        priceSelector: '.price',
        imageSelector: '.image img',
        hrefAttribute: '.name a',
        baseUrl: 'https://bvm-moto.co.uk/',
        hasPagination: false,
    },
    {
        // BVM Moto Used Bike Sales
        url: 'https://bvm-moto.co.uk/New%20and%20Used%20Trials%20Bikes',
        containerSelector: '.product-grid-item',
        titleSelector: '.name',
        priceSelector: '.price',
        imageSelector: '.image img',
        hrefAttribute: '.name a',
        baseUrl: 'https://bvm-moto.co.uk/',
        hasPagination: false,
    },
    {
        // SW Trials and Enduro
        url: 'https://swtrialsandenduro.co.uk/collections/new-trials-bikes?page=1',
        containerSelector: '.grid__item',
        titleSelector: '.card__heading',
        priceSelector: '.price-item--regular, .price-item--sale',
        imageSelector: '.card__media img',
        hrefAttribute: '.card__heading a',
        baseUrl: 'https://swtrialsandenduro.co.uk/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 5
    },
    {
        // Camio Moto
        url: 'https://bikes.camiomoto.co.uk/in-stock-bikes',
        containerSelector: '.card-body',
        titleSelector: '.used_vehicle_title h5',
        priceSelector: '.retailprice',
        imageSelector: '.main_image img',
        hrefAttribute: 'a.used_vehicle_title',
        baseUrl: 'https://bikes.camiomoto.co.uk/',
        hasPagination: false,
        
    },
    {
        // Craigs Motorcycles
        url: 'https://www.craigsmotorcycles.com/used-bikes',
        containerSelector: '.card-body',
        titleSelector: '.used_vehicle_title h5',
        priceSelector: '.retailprice',
        imageSelector: '.main_image img',
        hrefAttribute: 'a.used_vehicle_title',
        baseUrl: 'https://www.craigsmotorcycles.com/',
        hasPagination: false,
        
    },
    {
        // Johnlees Motorcycles
        url: 'https://www.johnleemotorcycles.co.uk/used-motorcycles/',
        containerSelector: '.asset-item-container',
        titleSelector: '.asset-item-header h3.title',
        priceSelector: '.asset-item-header h3.price',
        imageSelector: '.used-bike-image img',
        hrefAttribute: '.used-bike-image a',
        baseUrl: 'https://www.johnleemotorcycles.co.uk/',
        hasPagination: true,
        paginationParam: '/page/',
        maxPages: 20
    },
    
    
    {
        // Johnshirt Motors
        url: 'https://showroom.ebaymotorspro.co.uk/John-Shirt-Motorcycles-Ltd',
        containerSelector: '.item',
        titleSelector: '.item__title a',
        priceSelector: '.item__price',
        imageSelector: '.item__image img',
        hrefAttribute: '.item__title a',
        baseUrl: 'https://johnshirtmotorcycles.com/',
        hasPagination: true,
        paginationParam: '?page=',
        maxPages: 5
    },
   

    {
        // Marsh Power Sport
        url: 'https://marshpowersports.co.uk/product-category/trials/',
        containerSelector: '.col-12',
        titleSelector: '.featured-bike-content h3 .font-light',
        priceSelector: '.featured-bike-content h4.font-semibold',
        imageSelector: '.col-12 img ',
        hrefAttribute: '.col-12 a',
        baseUrl: 'https://marshpowersports.co.uk/',
        hasPagination: false,
    
    },
  


    
       

    
];

// Keywords to filter products (only include products with a title that includes one of these keywords)
const keys = ['EVO', 'TXT', 'NITRO', 'GOLD', 'ONE R','ONE RR', 'ON-E', 'ST', 'ST-F',
 'vertigo','VERTIGO', 'FACTOR-e' , 'ESCAPE R' , 'montessa' , '4RT' , 'SC-F', 'SCT' , '300RRs'];

// PostgreSQL connection pool setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'wolfgang123',
    port: 5432,
});

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 600;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 600);
        });
    });
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });

        for (const site of websites) {
            let currentPage = 1;
            let continueScraping = true;

            const maxPages = site.hasPagination ? site.maxPages : 1;

            while (continueScraping && currentPage <= maxPages) {
                let pageUrl = site.url;
                if (site.hasPagination) {
                    pageUrl = site.url + site.paginationParam + currentPage;
                }

                const page = await browser.newPage();
                console.log(`Scraping URL: ${pageUrl}`);
                await page.goto(pageUrl, { waitUntil: 'networkidle2' });

                try {
                    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
                } catch (err) {
                    console.error('Error navigating to page:', err);
                    continue; // Skip to the next page or retry
                }

                 // Scroll to the bottom of the page to load all images
                 await autoScroll(page);

                try {
                    await page.waitForSelector(site.containerSelector, { timeout: 10000 });
                } catch (err) {
                    console.log(`No product grid found on page ${currentPage} for ${site.url}`);
                    await page.close();
                    break;
                }

                const productsHandles = await page.$$(site.containerSelector);
                if (productsHandles.length === 0) {
                    console.log(`No products found on page ${currentPage} for ${site.url}`);
                    await page.close();
                    break;
                }

                for (const productHandle of productsHandles) {
                    try {
                        let productLink = await page.evaluate((element, attr) => {
                            const anchor = element.querySelector(attr);
                            console.log('Anchor element:', anchor); // Debugging: Log the anchor element
                            if (anchor) {
                                const href = anchor.getAttribute('href');
                                console.log('Raw href:', href); // Debugging: Log the raw href attribute
                                return href;
                            }
                            return null;
                        }, productHandle, site.hrefAttribute);

                        console.log('Extracted product link:', productLink); // Debugging: Log the extracted product link

                        if (productLink && !productLink.startsWith('http') && site.baseUrl) {
                            productLink = site.baseUrl + productLink;
                        }

                        const title = await page.evaluate((el, sel) =>
                            el.querySelector(sel)?.innerText.trim() || 'No title found',
                            productHandle, site.titleSelector
                        );

                        if (keys.length > 0) {
                            const titleLower = title.toLowerCase();
                            const matchesKey = keys.some(key => titleLower.includes(key.toLowerCase()));
                            if (!matchesKey) continue;
                        }

                        const price = await page.evaluate((el, sel) =>
                            el.querySelector(sel)?.innerText.trim() || 'No price found',
                            productHandle, site.priceSelector
                        );

                        const imageUrls = await page.evaluate((el, sel, baseUrl) => {
                            const imgs = el.querySelectorAll(sel);
                            return Array.from(imgs)
                                .map(img => {
                                    let src = img.getAttribute('src') || img.getAttribute('data-src') ||
                                              img.getAttribute('data-original') || img.getAttribute('data-image');
                        
                                    if (src) {
                                        src = src.trim();
                        
                                        // Function to check if a URL is relative
                                        const isRelativeUrl = (url) => {
                                            return !url.startsWith('http') && !url.startsWith('//');
                                        };
                        
                                        // Normalize the base URL
                                        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
                        
                                        // Check if the src is a relative URL and prepend the base URL
                                        if (isRelativeUrl(src)) {
                                            src = `${normalizedBaseUrl}${src.startsWith('/') ? src.substring(1) : src}`;
                                        } else {
                                            // Remove duplicate base URLs if present
                                            const baseUrlRegex = new RegExp(`(${normalizedBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}){2,}`, 'g');
                                            src = src.replace(baseUrlRegex, normalizedBaseUrl);
                                        }
                                    }
                        
                                    function cleanAndEncodeURL(url) {
                                        if (!url) return null;
                        
                                        // Remove duplicate slashes and ensure proper URL format
                                        url = url.replace(/([^:]\/)\/+/g, '$1');
                        
                                        // Ensure the URL starts with http or https
                                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                            url = 'https://' + url;
                                        }
                        
                                        return encodeURI(url);
                                    }
                        
                                    return cleanAndEncodeURL(src);
                                })
                                .filter(src => src);
                        }, productHandle, site.imageSelector, site.baseUrl);
                        
                        
                        
                        const getBikeType = (title) => {
                            const brandMap = {
                                'Gasgas': ['Gasgas', 'Gas-gas', 'Gas Gas'],
                                'Beta': ['Beta', 'Beta Evo'],
                                'Sherco': ['Sherco'],
                                'TRS': ['TRS', 'TRRS'],
                                'Montesa': ['Montesa'],
                                'Scorpa': ['Scorpa'],
                                'Vertigo': ['Vertigo', 'VERTIGO','Nitro','NITRO','RS']
                                // Add more as needed
                            };
                        
                            const lowerTitle = title.toLowerCase();
                        
                            for (const [standardBrand, variants] of Object.entries(brandMap)) {
                                for (const variant of variants) {
                                    if (lowerTitle.includes(variant.toLowerCase())) {
                                        return standardBrand;
                                    }
                                }
                            }
                        
                            return null; // or 'Unknown'
                        };
                        
                        
                        const bikeType = getBikeType(title);

                        const values = [
                            title,
                            price,
                            (imageUrls && imageUrls.length > 0) ? imageUrls : [],
                            productLink,
                            bikeType
                        ];
                        
                        

                        const query = `
                            INSERT INTO product (title, price, image_urls, product_link, bike_type)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT (product_link) DO NOTHING
                            RETURNING id;
                        `;

                        const result = await pool.query(query, values);

                        if (result.rows.length) {
                            console.log(`Inserted product with ID: ${result.rows[0].id}`);
                        } else {
                            console.log(`Product already exists: ${productLink}`);
                        }

                    } catch (error) {
                        console.error('Error extracting product details:', error);
                    }
                }

                await page.close();
                currentPage++;
                if (currentPage > maxPages) {
                    continueScraping = false;
                }
            }
        }
    } catch (err) {
        console.error('Error launching Puppeteer or connecting to PostgreSQL:', err);
    } finally {
        if (browser) {
            await browser.close();
        }
        await pool.end();
    }
})();
