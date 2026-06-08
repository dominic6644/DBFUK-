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
