require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Other configurations and routes...

app.use(express.static(path.join(__dirname)));

// Example route (optional, just loads index.html at root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});












// Log environment variables to verify they are loaded correctly
console.log('DB User:', process.env.DB_USER);
console.log('DB Host:', process.env.DB_HOST);
console.log('DB Name:', process.env.DB_NAME);
console.log('DB Password:', process.env.DB_PASSWORD);
console.log('DB Port:', process.env.DB_PORT);

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully. Current time:', res.rows[0].now);
    }
});

// Other routes and configurations...


// Other routes and configurations...


// GET all products (no filters)
app.get('/products', async (req, res) => {
    const tableName = req.query.table || 'product'; // Default to 'product'
    try {
        const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY RANDOM()`); // Randomize rows
        const products = result.rows.map(product => ({
            ...product,
            image_urls: product.image_urls
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching products");
    }
});


// POST filtered products
app.post('/products', async (req, res) => {
    const { maxPrice, bikeTypes } = req.body;
    const tableName = req.query.table || 'product'; // Default to 'product' if no query parameter is provided
    console.log('Received maxPrice:', maxPrice);
    console.log('Received bikeTypes:', bikeTypes);

    try {
        // Base query: extract numeric part of price, cast it to float
        let query = `
            SELECT * FROM (
                SELECT *,
                    CAST((REGEXP_MATCHES(price, '([0-9]+(?:\\.[0-9]+)?)'))[1] AS FLOAT) AS numeric_price
                FROM ${tableName}
            ) AS cleaned
            WHERE numeric_price <= $1
        `;
        const values = [maxPrice];

        // Optional filter for bike types
        if (bikeTypes && bikeTypes.length > 0) {
            query += ' AND bike_type = ANY($2)';
            values.push(bikeTypes);
        }

        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);
        const products = result.rows.map(product => ({
            ...product,
            image_urls: product.image_urls
        }));

        console.log('Filtered Products:', products);
        res.json(products);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send("Error fetching products");
    }
});

//node mailer

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Your Yahoo email address
        pass: process.env.EMAIL_PASS  // Your Yahoo password or app-specific password
    }
});

// Handle form submission for "Get in Touch"
app.post('/submit-form', (req, res) => {
    const { name, subject, message } = req.body;

    console.log('\n=== New Form Submission Received ===');
    console.log(`From Name    : ${name}`);
    console.log(`Subject      : ${subject}`);
    console.log(`Message      : ${message}`);
    console.log('------------------------------------');

    const mailOptions = {
        from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Submission: ${subject}`,
        text: `You have a new message from ${name}:\n\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('\n❌ Error sending email:', error);
            return res.status(500).send("Error sending email");
        } else {
            console.log('\n✅ Email sent successfully!');
            res.send(`
                <h1>Thanks, ${name}!</h1>
                <p>Your message has been sent. We’ll get back to you shortly.</p>
            `);
        }
    });
});




// === BLOG ROUTES ===

// --- BLOG ROUTES ---
// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blog_posts ORDER BY published_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching blog posts' });
    }
});

// Get single post by slug (API)
app.get('/api/posts/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching blog post' });
    }
});

// Add a new blog post
app.post('/api/posts', async (req, res) => {
    const { title, slug, content, author, featured_image } = req.body;
    if (!title || !slug || !content || !author) return res.status(400).json({ error: 'Missing required fields' });

    try {
        await pool.query(
            'INSERT INTO blog_posts (title, slug, content, author, featured_image) VALUES ($1,$2,$3,$4,$5)',
            [title, slug, content, author, featured_image]
        );
        res.status(201).json({ message: 'Blog post added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding blog post' });
    }
});

// Serve post page
app.get('/post/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
        if (result.rows.length === 0) return res.status(404).send('<h1>404 - Post not found</h1>');

        const post = result.rows[0];
        const description = post.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...';
        const image = post.featured_image || 'https://dirtbikefinderuk.co.uk/default-image.jpg';

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${post.title} | Dirt Bike Finder UK</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${post.title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<div id="post">
<h1>${post.title}</h1>
<p class="date">${new Date(post.published_date).toLocaleDateString()}</p>
${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" />` : ''}
<div class="content">${post.content}</div>
</div>
</body>
</html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('<h1>Server error loading post.</h1>');
    }
});


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Mock user data (replace with database query in a real application)
const users = [
    { id: 1, username: 'Dominic123', password: bcrypt.hashSync('Adidas123', 10) }
];

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user in database (mock data for example)
    const user = users.find(user => user.username === username);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.user = user;
    res.json({ message: 'Login successful' });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// Example protected route
app.get('/api/protected', isAuthenticated, (req, res) => {
    res.json({ message: 'This is a protected route' });
});










