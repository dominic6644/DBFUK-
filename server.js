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

const axios = require('axios');

async function submitIndexNow(slug) {
  const indexNowKey = 'b9bad444c01f4d7590bb7432d7824239';
  const siteHost = 'www.dirtbikefinderuk.co.uk';
  const postUrl = `https://${siteHost}/post/${slug}`;

  try {
    await axios.post('https://api.indexnow.org/indexnow', {
      host: siteHost,
      key: indexNowKey,
      keyLocation: `https://${siteHost}/${indexNowKey}.txt`,
      urlList: [postUrl],
    });

    console.log(`✅ IndexNow submitted for: ${postUrl}`);
  } catch (err) {
    console.error('⚠️ IndexNow submission failed:', err.message);
  }
}

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
  const { title, slug, content, author, featured_image, youtube_url } = req.body;

  if (!title || !slug || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await pool.query(
      `INSERT INTO blog_posts 
       (title, slug, content, author, featured_image, youtube_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, slug, content, author, featured_image, youtube_url || null]
    );

    // 🔥 Submit to IndexNow AFTER successful insert
    submitIndexNow(slug);

    res.status(201).json({ message: 'Blog post added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding blog post' });
  }
});

//helper
function getYouTubeEmbedUrl(url) {
    if (!url) return null;

    url = url.trim(); // 

    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
        }

        if (parsed.hostname.includes('youtube.com')) {
            const id = parsed.searchParams.get('v');
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
    } catch (e) {
        console.error('Invalid YouTube URL:', url);
        return null;
    }

    return null;
	
}

    

// Serve post page
app.get('/post/:slug', async (req, res) => {
    const slug = decodeURIComponent(req.params.slug);
try {
    console.log('Requested slug:', slug);
    try {
      const result = await pool.query(
  'SELECT * FROM blog_posts WHERE slug ILIKE $1',
  [slug]
);
  if (result.rows.length === 0) return res.status(404).send('<h1>404 - Post not found</h1>');

        const post = result.rows[0];
        const description = post.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...';
        const image = post.featured_image || '/images/default-image.jpg';
        const youtubeEmbed = getYouTubeEmbedUrl(post.youtube_url);

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
${youtubeEmbed ? `
<meta property="og:type" content="video.other" />
<meta property="og:video" content="${youtubeEmbed}" />
<meta property="og:video:secure_url" content="${youtubeEmbed}" />
<meta property="og:video:type" content="text/html" />
<meta property="og:video:width" content="1280" />
<meta property="og:video:height" content="720" />
` : ''}
	<meta name="google-adsense-account" content="ca-pub-7960582198518252">
<!-- Google font -->
		<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">

		<!-- Bootstrap -->
		<link type="text/css" rel="stylesheet" href="/css/bootstrap.min.css"/>

		<!-- Slick -->
		<link type="text/css" rel="stylesheet" href="/css/slick.css"/>
		<link type="text/css" rel="stylesheet" href="/css/slick-theme.css"/>

		<!-- nouislider -->
		<link type="text/css" rel="stylesheet" href="/css/nouislider.min.css"/>

		<!-- Font Awesome Icon -->
		<link rel="stylesheet" href="/css/font-awesome.min.css">
<link rel="stylesheet" href="/css/style.css" />
<link rel="icon" href="images/logo.png" type="/image/png">
</head>
<body>

<!-- HEADER -->
		<header>
			<!-- TOP HEADER -->
			<div id="top-header">
				<div class="container">
					<ul class="header-links pull-right">
						<li><a href="#"><i class="fa fa-instagram fa-2x"></i></a></li>
						<li><a href="#"><i class="fa fa-facebook fa-2x"></i> </a></li>
						
					</ul>
					<ul class="header-links pull-right">
						<li><a href="#"><i class=""></i> </a></li>
						<li><a href="#"><i class=""></i> </a></li>
					</ul>
				</div>
			</div>
			<!-- /TOP HEADER -->

			<!-- MAIN HEADER -->
			<div id="header">
				<!-- container -->
				<div class="container">
					<!-- row -->
					<div class="row">
						<!-- LOGO -->
						<div class="col-md-3">
							<div class="header-logo">
								<a href="#" class="logo">
									<img src="/images/logo.png" alt="" height="150px" width="125px">
								</a>
							</div>
							
						</div>
						<!-- /LOGO -->

						<!-- SEARCH BAR -->

						<!-- /SEARCH BAR -->

						<!-- ACCOUNT -->
						<div class="col-md-3 clearfix">
							<div class="header-ctn">
								<!-- Wishlist -->
								<div>
									<a href="#">
										<i class=""></i>
										<span></span>
										<div class=""></div>
									</a>
								</div>
								<!-- /Wishlist -->

								<!-- Cart -->
							
								<!-- /Cart -->

								<!-- Menu Toogle -->
								   <div class="menu-toggle ">
      <a href="javascript:void(0);" id="nav-toggle-btn">
        <i class="fa fa-bars" id="menu-icon"></i>
        <span>Menu</span>
      </a>
    </div>
								<!-- /Menu Toogle -->
							</div>
						</div>
						<!-- /ACCOUNT -->
					</div>
					<!-- row -->
				</div>
				<!-- container -->
			</div>
			<!-- /MAIN HEADER -->
		</header>
		<!-- /HEADER -->

		<!-- NAVIGATION -->
		<nav id="navigation">
			<!-- container -->
			<div class="container">
				<!-- Menu Toggle Button -->
                 


				<!-- responsive-nav -->
				<div id="responsive-nav">
					<!-- NAV -->
					<ul class="main-nav nav navbar-nav">
						<li><a href="/index.html">Home</a></li>
						<li><a href="/trials.html">Trials Bikes</a></li>
						<li><a href="/enduro.html">Enduro Bikes</a></li>
						<li><a href="/mx.html">Motorcross Bikes</a></li>
						<li><a href="/mountain-Bikes.html">Mountain Bikes</a></li>
						<li class="active"><a href="/news.html">News</a></li>
						<li><a href="/contact.html">Get in Touch</a></li>
					</ul>
					<!-- /NAV -->
				</div>
				<!-- /responsive-nav -->
			</div>
			<!-- /container -->
		</nav>
		<!-- /NAVIGATION -->

        	<!-- HOT DEAL SECTION -->
<div id="hot-deal" class="section" style="background-image: url('/images/banner-4.png');">
  <!-- container -->
  <div class="container">
    <!-- Banner Title -->
    <div class="banner-title">
      <h1></h1>
    </div>
    <!-- row -->
    <div class="row">
      <div class="col-md-12">
        <div class="hot-deal">
          <ul class="hot-deal-countdown">
            <li><div><h3></h3><span></span></div></li>
            <li><div><h3></h3><span></span></div></li>
            <li><div><h3></h3><span></span></div></li>
            <li><div><h3></h3><span></span></div></li>
          </ul>
          <h2 class="text-uppercase"></h2>
          <p></p>
          <a class="" href="#"></a>
        </div>
      </div>
    </div>
    <!-- /row -->
  </div>
  <!-- /container -->
</div>

<!-- /HOT DEAL SECTION -->

<div class="post-page">
  <!-- Left: Main post -->
  <div class="post-container">

<div id="post">
<h1>${post.title}</h1>
<p class="date">${new Date(post.published_date).toLocaleDateString()}</p>
${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" />` : ''}
<div class="content">${post.content}</div>
<div style="position:relative; padding-bottom:56.25%; height:0; margin:20px 0;">
  <iframe
      src="${youtubeEmbed}"
      frameborder="0"
      style="position:absolute; top:0; left:0; width:100%; height:100%;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
  </iframe>
</div>
</div>

  <!-- Bottom ad below post -->
    <div class="bottom-ad">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7960582198518252" crossorigin="anonymous"></script>
      <!-- post-3 -->
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7960582198518252"
        data-ad-slot="3624781783"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  </div>

  <!-- Right: Sidebar ads -->
  <aside class="sidebar-ads">
    <div class="ad">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7960582198518252" crossorigin="anonymous"></script>
      <!-- post-1 -->
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7960582198518252"
        data-ad-slot="1381761821"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>

    <div class="ad">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7960582198518252" crossorigin="anonymous"></script>
      <!-- post-2 -->
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7960582198518252"
        data-ad-slot="6184578087"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  </aside>
</div>
<!-- FOOTER -->
		<footer id="footer">
			<!-- top footer -->
			<div class="section">
				<!-- container -->
				<div class="container">
					<!-- row -->
					<div class="row">
						<div class="col-md-3 col-xs-6">
							<div class="footer">
								<h3 class="footer-title"></h3>
								<img src="/images/logo.png" alt="" height="150px" width="125px">
								<ul class="footer-links">
									
									
								</ul>
							</div>
						</div>

						<div class="col-md-3 col-xs-6">
							<div class="footer">
								<h3 class="footer-title">Categories</h3>
								<ul class="footer-links">
									<li><a href="/index.html">Home</a></li>
									<li><a href="/trials.html">Trials Bikes</a></li>
									<li><a href="/enduro.html">Enduro Bikes</a></li>
									<li><a href="/mx.html">Motocross Bikes</a></li>
									<li><a href="/mountain-Bikes.html">Mountain Bikes</a></li>
								</ul>
							</div>
						</div>

						<div class="clearfix visible-xs"></div>

						<div class="col-md-3 col-xs-6">
							<div class="footer">
								<h3 class="footer-title">Information</h3>
								<ul class="footer-links">
									<li><a href="/news.html">News</a></li>
									<li><a href="/contact.html">Get in Touch</a></li>
									<li><a href="/p&p.html">Privacy Policy</a></li>
									<li><a href="/T&C.html">Terms & Conditions</a></li>
									<li><a href="/login.html">login</a></li>
								</ul>
							</div>
						</div>

						<div class="col-md-3 col-xs-6">
							<div class="footer">
								<h3 class="footer-title">Socials</h3>
								<ul class="footer-links">
									<li><a href="#"><i class="fa fa-instagram fa-3x" ></i></a></li>
									<li><a href="#"><i class="fa fa-facebook fa-3x"></i></a></li>
								</ul>
							</div>
						</div>
					</div>
					<!-- /row -->
				</div>
				<!-- /container -->
			</div>
			<!-- /top footer -->

			<!-- bottom footer -->
			<div id="bottom-footer" class="section">
				<div class="container">
					<!-- row -->
					<div class="row">
						<div class="col-md-12 text-center">

							<span class="copyright">
								<!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
								<p>
  Copyright &copy; <script>document.write(new Date().getFullYear());</script>
  All rights reserved | Dirt Bike Finder UK |
  Designed by <a href="https://wolfgang-dev.com/" target="_blank" rel="noopener noreferrer">Wolfgang Dev</a>
</p>

							<!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
							</span>
						</div>
					</div>
						<!-- /row -->
				</div>
				<!-- /container -->
			</div>
			<!-- /bottom footer -->
		</footer>
		<!-- /FOOTER -->

		<!-- jQuery Plugins -->
		<script src="/js/jquery.min.js"></script>
		<script src="/js/bootstrap.min.js"></script>
		<script src="/js/slick.min.js"></script>
		<script src="/js/nouislider.min.js"></script>
		<script src="/js/jquery.zoom.min.js"></script>
		<script src="/js/main.js"></script>
        <script src="/js/filter.js"></script>
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
























