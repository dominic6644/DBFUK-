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
        // SW Trials and Enduro
        url: 'https://swtrialsandenduro.co.uk/collections/new-enduro-bikes',
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
        url: 'https://marshpowersports.co.uk/product-category/enduro/',
        containerSelector: '.col-12',
        titleSelector: '.featured-bike-content h3 .font-light',
        priceSelector: '.featured-bike-content h4.font-semibold',
        imageSelector: '.col-12 img ',
        hrefAttribute: '.col-12 a',
        baseUrl: 'https://marshpowersports.co.uk/',
        hasPagination: true,
        paginationParam: '/page/',
        maxPages: 5
    
    },

      {
        // Southcoast Power Sport
        url: 'https://southcoastpowersports.co.uk/cat/enduro/',
        containerSelector: '.goods-item',
        titleSelector: '.goods-model',
        priceSelector: '.goods-price',
        imageSelector: ' .goods-picture ',
        hrefAttribute: 'a',
        baseUrl: 'https://southcoastpowersports.co.uk/',
        hasPagination: false,
        
    
    },

      {
        // ironcitymotorcycles
        url: 'https://www.ironcitymotorcycles.co.uk/bikes-in-stock?page=12',
        containerSelector: '.card-body',
        titleSelector: '.vehicleinfo h5',
        priceSelector: '.retailprice',
        imageSelector: ' .main_image img ',
        hrefAttribute: '.vehicleinfo a',
        baseUrl: 'https://www.ironcitymotorcycles.co.uk/',
        hasPagination: false,
        
    
    },

     {
        // drysdale motorcycles
        url: 'https://www.drysdalemotorcycles.co.uk/used-motorcycles/',
        containerSelector: '.view-container',
        titleSelector: '.title',
        priceSelector: '.price',
        imageSelector: ' .used-bike-image img ',
        hrefAttribute: '.used-bike-image a',
        baseUrl: 'https://www.drysdalemotorcycles.co.uk/',
        hasPagination: true,
        paginationParam: '/page/',
        maxPages: 3
        
    
    },

     {
        // CF Motorcycles
        url: 'https://www.cfracing.co.uk/used-motorcycles-denbighshire/',
        containerSelector: '.view-container',
        titleSelector: '.title',
        priceSelector: '.price',
        imageSelector: ' .used-bike-image img ',
        hrefAttribute: '.used-bike-image a',
        baseUrl: 'https://www.cfracing.co.uk/',
        hasPagination: false,
        
        
    
    },

    {
        // Judd racing
        url: 'https://motorcycles.juddracing.com/bikes-in-stock/bike-in-stock?page=9',
        containerSelector: '.card-body',
        titleSelector: '.vehicleinfo h5',
        priceSelector: '.retailprice',
        imageSelector: ' .main_image img ',
        hrefAttribute: '.card-body a',
        baseUrl: 'https://motorcycles.juddracing.com/',
        hasPagination: false,
       
        
    
    },

  {
        // gear4motorcycles
        url: 'https://gear4motorcycles.co.uk/used-bikes/',
        containerSelector: '.view-container ',
        titleSelector: '.title',
        priceSelector: '.price',
        imageSelector: ' .used-bike-image img ',
        hrefAttribute: '.used-bike-image a',
        baseUrl: 'https://gear4motorcycles.co.uk/',
        hasPagination: false,
       
        
    
    },

    {
        // swansea ktm
        url: 'https://www.swansea-ktm.com/new/models/5767/Enduro/models.aspx',
        containerSelector: '.new-model-group-container ',
        titleSelector: '.new-model-group-text h3',
        priceSelector: '.new-model-group-text p',
        imageSelector: '.new-model-group-container img ',
        hrefAttribute: '.new-model-group-container a',
        baseUrl: 'https://www.swansea-ktm.com/',
        hasPagination: false,
       
        
    
    },
   
       
   

    {
        // htm motorcycles

        url: 'https://www.htmmotorcycles.com/used-bikes/',
        containerSelector: '.view-container',
        titleSelector: '.title',
        priceSelector: '.price',
        imageSelector: '.used-bike-image img ',
        hrefAttribute: '.used-bike-image a',
        baseUrl: 'https://www.htmmotorcycles.com/',
        hasPagination: true,
        paginationParam: '/page/',
        maxPages: 3
       
        
    
    },

   
   
     {
        // absoloute motorcross

        
    url: 'https://absolutemotocross.co.uk/motocross-bikes.html',
    containerSelector: '.item', // Targets the product container
    titleSelector: '.product-item-name a', // Targets the anchor tag within the product name
    priceSelector: '.price', // Targets the price span
    imageSelector: '.product-image-photo', // Targets the product image
    hrefAttribute: '.product-item-link', // Targets the anchor tag for the product link
    baseUrl: 'https://absolutemotocross.co.uk/',
    hasPagination: true,
    paginationParam: '?p=',
    maxPages: 5
},

    
    
     {
        // gh motorcycles

        
    url: 'https://ghmotorcycles.co.uk/used-bikes/',
    containerSelector: '.product-small', // Targets the product container
    titleSelector: '.name a', // Targets the anchor tag within the product name
    priceSelector: '.woocommerce-Price-amount ', // Targets the price span
    imageSelector: '.image-cover img', // Targets the product image
    hrefAttribute: '.image-cover a', // Targets the anchor tag for the product link
    baseUrl: 'https://ghmotorcycles.co.uk/',
    hasPagination: false,
    
},
       
        
    
    


    
];

// Specific enduro bike models to filter products
const keys = [
    // Beta models
     'RR', 'RR Racing', 'RR Race', 'RR Factory',
    // KTM models
    'EXC', 'EXC-F', 'EXC TPI', 'EXC-F Six Days', 'EXC-F Factory',
    'XCF-W', 'XCF-W TPI', 'XCF-W Six Days',
   
    // Husqvarna models
    'FE', 'FE 250', 'FE 350', 'FE 450', 'FE 501',
    'TE', 'TE 150', 'TE 250', 'TE 300',
    // Yamaha models
    'WR', 'WR250F', 'WR450F',
    // Honda models
    'CRF', 'CRF250L', 'CRF300L', 'CRF450RL', 'CRF450RX',
    
    
    // Other common enduro models
    'EC', 'EC 250', 'EC 300', 'EC 350',
    'SEF', 'SEF 250', 'SEF 450',
    'XEF', 'XEF 250', 'XEF 450',
    'EN', 'EN 250', 'EN 450'
];

const excludedPatterns = [
    /evo\s?\d*/i, /txt/i, /nitro/i, /gold/i, /one\s?r/i, /vertigo/i,
    /montessa/i, /4rt/i, /sc-f/i, /sct/i, /300rrs/i, /sx\s?-?f?/i,
    /mc/i, /mx/i, /fc/i, /tc/i, /xc\s?-?w?/i, /motard/i, /alp/i,
    /royal\s?enfield/i, /adventure/i, /vitpilen\s?801/i, /norden\s?901/i,
    /commando/i, /svartpilen\s?401/i, /harley\s?-?davidson/i,
    /tenere\s?700\s?world\s?raid/i, /moto\s?guzzi/i,
    /cbr1000rr\s?fireblade/i, /g\s?trail/i, /g\s?cross/i, /g\s?enduro/i,
    /mercedes/i, /surron/i, /trs/i, /harley/i, /davidson/i, /rally/i, /g\s?light/i,
    /svartpilen/i, /vitpilen/i, /Kawasaki/i, /royal/i, /enfield/i, /agusta/i, /dragster/i,
    /montessa rr 301/i, /Tenere 1200/i, /MONSTER 821/i, /BONNEVILLE SPEEDMASTER/i, /SUPER TENERE 1200Z/i
    , /YAMAHA TENERE 700/i

];





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
                    await page.waitForSelector(site.containerSelector, { timeout: 20000 });
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

                    // Inside your product loop, after extracting the title
const titleLower = title.toLowerCase();

// Check if the title contains any of the keys
const matchesKey = keys.some(key => titleLower.includes(key.toLowerCase()));

// Check if the title matches any of the excluded patterns
const isExcluded = excludedPatterns.some(pattern => pattern.test(title));

if (!matchesKey || isExcluded) {
    console.log(`Skipping product: ${title} (matchesKey: ${matchesKey}, isExcluded: ${isExcluded})`);
    continue;
}

if (!matchesKey) {
    console.log(`Skipping product due to no key match: ${title}`);
}
if (isExcluded) {
    console.log(`Skipping product due to exclusion match: ${title}`);
}
if (matchesKey && !isExcluded) {
    console.log(`Including product: ${title}`);
}



// If the product passes the filters, proceed with extracting other details



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
                                'Beta': ['Beta', 'Beta RR'],
                                'Sherco': ['Sherco'],
                                'Honda': ['Honda'],
                                'KTM': ['KTM'],
                                'Husqvarna': ['Husqvarna'],
                                'Fantic': ['Fantic'],
                                'TM Moto': ['TM, TM Moto, TM Racing'],
                                'Rieju': ['Rieju']
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
                            INSERT INTO enduro (title, price, image_urls, product_link, bike_type)
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
