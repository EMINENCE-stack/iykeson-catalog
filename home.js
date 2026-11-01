(function () {
  const { CFG, esc, img, loadProducts, categories, generalWhatsApp, cardHTML, searchText } = window.Iyk;
  const $ = id => document.getElementById(id);
  const setText = (id, t) => { const e = $(id); if (e && t) e.textContent = t; };
  let all = [], cat = "All";

  setText("hero-title", CFG.HERO_TITLE);
  setText("hero-tagline", CFG.TAGLINE);
  if ($("hero-wa")) $("hero-wa").href = generalWhatsApp();
  if (CFG.HERO_IMAGE && $("hero")) {
    $("hero").style.backgroundImage = `url("${img(CFG.HERO_IMAGE, 2000)}")`;
    $("hero").style.backgroundPosition = CFG.HERO_POSITION || "center 40%";   // which part of the photo stays visible
  }
  // Shop photo: works even if index.html has no #shop-photo box (it creates one)
  if (CFG.SHOP_IMAGE && $("contact")) {
    let box = $("shop-photo");
    if (!box) {
      box = document.createElement("div"); box.id = "shop-photo";
      const left = $("contact").querySelector(".two > div") || $("contact");
      left.appendChild(box);
    }
    box.innerHTML = `<figure class="shop-photo"><img loading="lazy" src="${esc(img(CFG.SHOP_IMAGE, 900))}" alt="Our shop front"><figcaption>Look out for this building</figcaption></figure>`;
  }
  if ($("contact-list")) $("contact-list").innerHTML =
    `<li><strong>Address</strong><br>${esc(CFG.ADDRESS)}</li>` +
    `<li><strong>Opening hours</strong><br>${esc(CFG.OPENING_HOURS)}</li>` +
    (CFG.PHONE_DISPLAY ? `<li><strong>Phone</strong><br>${esc(CFG.PHONE_DISPLAY)}</li>` : "") +
    (CFG.EMAIL ? `<li><strong>Email</strong><br><a style="text-decoration:underline" href="mailto:${esc(CFG.EMAIL)}">${esc(CFG.EMAIL)}</a></li>` : "") +
    `<li><a class="btn btn-wa" href="${generalWhatsApp()}" target="_blank" rel="noopener">Message us on WhatsApp</a></li>`;

  // ---- Map, directions, brands and search-engine data ----
  const mq = CFG.MAP_QUERY || "";
  const dirURL = mq ? "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(mq) : (CFG.MAPS_LINK || "");
  const viewURL = CFG.MAPS_LINK || (mq ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mq) : "");
  if ($("contact-list")) {
    if (dirURL) {
      const li = document.createElement("li");
      li.innerHTML = `<a class="btn btn-red" href="${esc(dirURL)}" target="_blank" rel="noopener">Get directions</a>` +
        (viewURL && viewURL !== dirURL ? ` <a class="btn btn-ghost" href="${esc(viewURL)}" target="_blank" rel="noopener">View on map</a>` : "");
      $("contact-list").insertBefore(li, $("contact-list").lastElementChild);
    }
    if (mq) {
      const m = document.createElement("div"); m.className = "map-embed";
      m.innerHTML = `<iframe title="Map showing our shop" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(mq)}&output=embed"></iframe>`;
      $("contact-list").insertAdjacentElement("afterend", m);
    }
  }
  if (Array.isArray(CFG.BRANDS) && CFG.BRANDS.length && $("contact")) {
    const sec = document.createElement("section"); sec.className = "block"; sec.id = "brands";
    sec.innerHTML = `<div class="wrap"><div class="sec-head"><h2>Our brands</h2><p>All under one roof${CFG.CITY ? " in " + esc(CFG.CITY) : ""}</p></div><div class="brands">` +
      CFG.BRANDS.map(b => `<div class="brand-card"><h3>${esc(b.name)}</h3><p>${esc(b.text || "")}</p></div>`).join("") + `</div></div>`;
    $("contact").insertAdjacentElement("beforebegin", sec);
  }
  (function seoData() {   // structured data so Google can understand who we are
    const d = { "@context": "https://schema.org", "@type": ["Store", "HomeAndConstructionBusiness"], name: CFG.BUSINESS_NAME,
      description: CFG.TAGLINE, address: { "@type": "PostalAddress", streetAddress: CFG.ADDRESS, addressLocality: CFG.CITY || undefined, addressRegion: CFG.REGION || undefined, addressCountry: "NG" } };
    if (CFG.SITE_URL) d.url = CFG.SITE_URL;
    if (CFG.LOGO) d.logo = CFG.LOGO;
    if (CFG.SHOP_IMAGE || CFG.HERO_IMAGE) d.image = CFG.SHOP_IMAGE || CFG.HERO_IMAGE;
    if (CFG.PHONE_INTL) d.telephone = CFG.PHONE_INTL;
    if (CFG.EMAIL) d.email = CFG.EMAIL;
    if (CFG.OPENING_HOURS) d.openingHours = CFG.OPENING_HOURS;
    if (/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(mq)) { const [la, lo] = mq.split(","); d.geo = { "@type": "GeoCoordinates", latitude: +la, longitude: +lo }; }
    if (Array.isArray(CFG.BRANDS)) d.brand = CFG.BRANDS.map(b => ({ "@type": "Brand", name: b.name, description: b.text }));
    const t = document.createElement("script"); t.type = "application/ld+json"; t.textContent = JSON.stringify(d); document.head.appendChild(t);
    // Tells Google the site's name and other names people may search for (e.g. the brand names)
    if (CFG.SITE_URL) {
      const alt = [CFG.BUSINESS_NAME].concat((CFG.BRANDS || []).map(x => x.name)).filter(n => n && n !== CFG.SHORT_NAME);
      const w = { "@context": "https://schema.org", "@type": "WebSite", name: CFG.SHORT_NAME || CFG.BUSINESS_NAME, alternateName: alt, url: CFG.SITE_URL };
      const t2 = document.createElement("script"); t2.type = "application/ld+json"; t2.textContent = JSON.stringify(w); document.head.appendChild(t2);
    }
  })();

  function priceNum(p) { const n = Number(String(p.price).replace(/[^0-9.]/g, "")); return n || null; }

  function renderCats() {
    const list = categories(all);
    $("cats").innerHTML = list.map(c => {
      const p = all.find(x => x.category === c.name && x.images[0]);
      const bg = p ? `style="background-image:url('${esc(img(p.images[0], 500))}')"` : "";
      return `<button class="cat" data-cat="${esc(c.name)}" ${bg}><span><b>${esc(c.name)}</b><small>${c.count} item${c.count > 1 ? "s" : ""}</small></span></button>`;
    }).join("");
    $("chips").innerHTML = ["All"].concat(list.map(c => c.name)).map(n =>
      `<button class="chip ${n === cat ? "on" : ""}" data-cat="${esc(n)}">${esc(n)}</button>`).join("");
  }

  function renderGrid() {
    const q = $("q").value.trim().toLowerCase();
    let list = all.filter(p => (cat === "All" || p.category === cat) && (!q || q.split(/\s+/).every(w => searchText(p).includes(w))));
    const s = $("sort").value;
    if (s === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (s === "low") list.sort((a, b) => (priceNum(a) ?? 1e12) - (priceNum(b) ?? 1e12));
    if (s === "high") list.sort((a, b) => (priceNum(b) ?? -1) - (priceNum(a) ?? -1));
    $("count").textContent = list.length + " product" + (list.length === 1 ? "" : "s") + (cat !== "All" ? " in " + cat : "");
    $("grid").innerHTML = list.length ? list.map(p => cardHTML(p)).join("") :
      `<div class="empty" style="grid-column:1/-1">Nothing matches that search. Try fewer words, or <a style="text-decoration:underline" href="${generalWhatsApp()}" target="_blank" rel="noopener">ask us on WhatsApp</a>.</div>`;
  }

  function setCat(n, scroll) {
    cat = n; renderCats(); renderGrid();
    if (scroll) $("products").scrollIntoView({ behavior: "smooth" });
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-cat]"); if (!t) return;
    setCat(t.dataset.cat, !!t.closest("#cats"));
  });
  $("q").addEventListener("input", renderGrid);
  $("sort").addEventListener("change", renderGrid);

  function show(products) {
    all = products;
    if (!all.some(p => p.category === cat)) cat = "All";
    renderCats(); renderGrid();
  }

  loadProducts((p) => show(p)).catch(() => {
    $("grid").innerHTML = `<div class="empty" style="grid-column:1/-1">We couldn't load the products right now. Please check your internet and refresh, or <a style="text-decoration:underline" href="${generalWhatsApp()}">message us on WhatsApp</a>.</div>`;
    $("cats").innerHTML = "";
  });
})();
