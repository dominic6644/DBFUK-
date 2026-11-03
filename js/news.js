const ads = document.querySelectorAll('.lazy-ad');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const slot = entry.target.dataset.adSlot;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-7960582198518252');
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    entry.target.appendChild(ins);

    (adsbygoogle = window.adsbygoogle || []).push({});

    observer.unobserve(entry.target);
  });
});

ads.forEach(ad => observer.observe(ad));



document.addEventListener("DOMContentLoaded", function () {

    const articleUrl = window.location.href;
    const articleTitle = document.title;

    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(articleTitle);

    // SOCIAL SHARING

    const shareLinks = {

        facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl,

        x: "https://twitter.com/intent/tweet?url=" + encodedUrl + "&text=" + encodedTitle,

        whatsapp: "https://api.whatsapp.com/send?text=" + encodedTitle + "%20" + encodedUrl,

        pinterest: "https://pinterest.com/pin/create/button/?url=" + encodedUrl + "&description=" + encodedTitle,

        reddit: "https://www.reddit.com/submit?url=" + encodedUrl + "&title=" + encodedTitle,

        linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodedUrl,

        telegram: "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedTitle,

        email: "mailto:?subject=" + encodedTitle + "&body=" + encodedUrl

    };

    document.querySelectorAll("[data-share]").forEach(function(button) {

        const platform = button.dataset.share;

        if (shareLinks[platform]) {

            button.href = shareLinks[platform];

            if (platform !== "email") {
                button.target = "_blank";
                button.rel = "noopener noreferrer";
            }

        }

    });


    // COPY ARTICLE LINK

    const copyLinkButton = document.getElementById("copyArticleLink");
    const shareFeedback = document.getElementById("shareFeedback");

    copyLinkButton.addEventListener("click", async function() {

        try {
            await navigator.clipboard.writeText(articleUrl);
            shareFeedback.textContent = "Article link copied!";
        } catch (error) {
            shareFeedback.textContent = "Unable to copy link. Please copy it from your browser.";
        }

    });


    // GENERATE EMBED CODE

    const embedCode = `
<div style="border:1px solid #ddd;padding:15px;border-radius:8px;max-width:500px;font-family:Arial,sans-serif;">
    <strong style="font-size:16px;">
        <a href="${articleUrl}" target="_blank" rel="noopener noreferrer" style="color:#222;text-decoration:none;">
            ${articleTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}
        </a>
    </strong>
    <p style="margin-bottom:0;font-size:13px;color:#666;">
        Read more at Dirt Bike Finder UK
    </p>
</div>
    `.trim();

    const embedTextarea = document.getElementById("articleEmbedCode");

    embedTextarea.value = embedCode;


    // COPY EMBED CODE

    const copyEmbedButton = document.getElementById("copyEmbedCode");
    const embedFeedback = document.getElementById("embedFeedback");

    copyEmbedButton.addEventListener("click", async function() {

        try {
            await navigator.clipboard.writeText(embedTextarea.value);
            embedFeedback.textContent = "Embed code copied successfully!";
        } catch (error) {
            embedTextarea.select();
            embedFeedback.textContent = "Select and copy the code manually.";
        }

    });

});

