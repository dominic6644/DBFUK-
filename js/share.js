
/* ==========================================================
   DIRT BIKE FINDER UK
   ARTICLE SHARING & EMBED FUNCTIONALITY
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Get article information
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    const articleUrl = canonicalLink
        ? canonicalLink.href
        : window.location.href.split("#")[0];

    const articleTitle =
        document.querySelector(".article-header h1")?.textContent.trim()
        || document.querySelector("h1")?.textContent.trim()
        || document.title;

    // Encode information for sharing URLs
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(articleTitle);


    /* ======================================================
       SOCIAL SHARING LINKS
    ====================================================== */

    const shareLinks = {

        facebook:
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

        x:
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,

        whatsapp:
            `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,

        pinterest:
            `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,

        reddit:
            `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,

        linkedin:
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,

        telegram:
            `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,

        email:
            `mailto:?subject=${encodedTitle}&body=${encodedUrl}`

    };


    // Set up all social sharing buttons
    document.querySelectorAll("[data-share]").forEach(function (button) {

        const platform = button.dataset.share;

        if (!shareLinks[platform]) {
            return;
        }

        button.href = shareLinks[platform];

        if (platform !== "email") {
            button.target = "_blank";
            button.rel = "noopener noreferrer";
        }

    });


    /* ======================================================
       COPY ARTICLE LINK
    ====================================================== */

    const copyLinkButton = document.getElementById("copyArticleLink");
    const shareFeedback = document.getElementById("shareFeedback");


    // Clipboard helper with a fallback for older browsers
    async function copyToClipboard(text) {

        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = text;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";

        document.body.appendChild(temporaryInput);

        temporaryInput.select();

        const copied = document.execCommand("copy");

        temporaryInput.remove();

        if (!copied) {
            throw new Error("Copy failed");
        }

    }


    if (copyLinkButton && shareFeedback) {

        copyLinkButton.addEventListener("click", async function () {

            try {

                await copyToClipboard(articleUrl);

                shareFeedback.textContent = "Article link copied!";
                shareFeedback.classList.add("success");

            } catch (error) {

                shareFeedback.textContent =
                    "Unable to copy automatically. Please copy the URL from your browser.";

                shareFeedback.classList.remove("success");

            }

        });

    }


  

    
/* ======================================================
   GENERATE AND COPY ARTICLE EMBED CODE
====================================================== */

const copyEmbedButton = document.getElementById("copyEmbedCode");
const embedFeedback = document.getElementById("embedFeedback");

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

if (copyEmbedButton && embedFeedback) {

    const safeTitle = escapeHTML(articleTitle);
    const safeUrl = escapeHTML(articleUrl);

    const embedCode = `
<div style="max-width:520px;padding:18px;border:1px solid #ddd;border-left:4px solid #D10024;border-radius:6px;background:#fff;font-family:Arial,Helvetica,sans-serif;">

    <div style="margin-bottom:10px;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#D10024;">
        Dirt Bike Finder UK
    </div>

    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:block;margin-bottom:12px;color:#171717;font-size:17px;font-weight:bold;line-height:1.4;text-decoration:none;">
        ${safeTitle}
    </a>

    <p style="margin:0;color:#666;font-size:13px;line-height:1.5;">
        Read the full article at
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#D10024;text-decoration:none;font-weight:bold;">
            Dirt Bike Finder UK
        </a>.
    </p>

</div>
    `.trim();

    copyEmbedButton.addEventListener("click", async function () {

        try {

            await copyToClipboard(embedCode);

            embedFeedback.textContent = "Embed code copied successfully!";
            embedFeedback.classList.add("success");

        } catch (error) {

            embedFeedback.textContent = "Unable to copy. Please try again.";
            embedFeedback.classList.remove("success");

        }

    });

}
