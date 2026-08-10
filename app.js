const favoritesKey = "bluark-ui-favorites";
if (!document.querySelector('script[src="auth.js"]')) {
  const authScript = document.createElement("script");
  authScript.src = "auth.js";
  authScript.defer = true;
  document.head.append(authScript);
}
let currentItems = [];
let currentMode = "venta";
let currentContainerId = "";

function formatCopy(value) {
  return String(value)
    .replace(/Duplex/g, "Dúplex")
    .replace(/Jardin/g, "Jardín")
    .replace(/Balcon/g, "Balcón")
    .replace(/Banos/g, "Baños")
    .replace(/Bano/g, "Baño")
    .replace(/Anos/g, "Años")
    .replace(/Ano/g, "Año");
}

function normalized(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(favoritesKey)) || []);
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
  const remoteFavorites = [...favorites].map(id => {
    const item = getItemById(id);
    return { property_id: item.id, title: item.title, location: item.location, price: item.price };
  });
  fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ favorites: remoteFavorites })
  }).catch(() => {});
}

async function loadRemoteFavorites() {
  try {
    const response = await fetch("/api/favorites", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json();
    const remoteFavorites = new Set((data.favorites || []).map(item => item.property_id));
    const localFavorites = getFavorites();
    if (!remoteFavorites.size && localFavorites.size) {
      saveFavorites(localFavorites);
      return;
    }
    saveLocalFavorites(remoteFavorites);
    applyFilters();
    renderFavorites();
  } catch {}
}

function saveLocalFavorites(favorites) {
  localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
}

function getItemById(id) {
  return allProperties.find(item => item.id === id) || properties[0];
}

function whatsappLink(item, action = "consultar") {
  const message = `Hola Bluark Inmobiliaria, quiero ${action} por esta propiedad: ${formatCopy(item.title)} ubicada en ${item.location}. Precio: ${item.price}.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function card(item) {
  const favorites = getFavorites();
  const saved = favorites.has(item.id);
  return `
    <article class="listing-card" data-type="${item.type}">
      <button class="card-image image-open" type="button" data-image="${item.image}" aria-label="Ampliar foto de ${item.title}">
        <img src="${item.image}" alt="${formatCopy(item.title)}">
        <span class="tag ${item.sold ? "tag-sold" : ""}">${item.badge}</span>
        <span class="zoom-pill">Ampliar</span>
      </button>
      <button class="heart ${saved ? "active" : ""}" type="button" data-save="${item.id}" aria-label="Guardar favorito">&#9825;</button>
      <div class="card-body">
        <div class="price-row">
          <strong>${item.price}</strong>
          <span>${item.agency}</span>
        </div>
        <h2>${formatCopy(item.shortTitle)}</h2>
        <p>${item.address}</p>
        <div class="mini-stats">${item.stats.map(stat => `<span>${formatCopy(stat)}</span>`).join("")}</div>
        <a class="details-button" href="detalles.html?id=${encodeURIComponent(item.id)}">Ver Detalles</a>
      </div>
    </article>
  `;
}

function updateCount(count) {
  const target = document.getElementById("resultCount");
  if (target) target.textContent = count.toString();
}

function filterItems(items) {
  const query = normalized((document.getElementById("searchInput")?.value || "").trim());
  const type = document.getElementById("typeFilter")?.value || "all";
  const min = Number(document.getElementById("minPrice")?.value || 0);
  const max = Number(document.getElementById("maxPrice")?.value || Number.MAX_SAFE_INTEGER);
  const rooms = document.querySelector(".room-buttons button.selected")?.dataset.rooms || "all";
  const needsGarden = document.getElementById("gardenFilter")?.checked || false;
  const needsGarage = document.getElementById("garageFilter")?.checked || false;
  const needsBalcony = document.getElementById("balconyFilter")?.checked || false;

  return items.filter(item => {
    const text = normalized(`${item.location} ${item.address} ${item.title} ${item.shortTitle}`);
    const roomOk = rooms === "all" || (rooms === "4" ? item.bedrooms >= 4 : item.bedrooms === Number(rooms));
    const gardenOk = !needsGarden || item.amenities.some(value => ["jardin", "patio"].includes(value));
    const garageOk = !needsGarage || item.amenities.includes("cochera");
    const balconyOk = !needsBalcony || item.amenities.includes("balcon");
    return (!query || text.includes(query)) &&
      (type === "all" || item.type === type) &&
      item.priceValue >= min &&
      item.priceValue <= max &&
      roomOk &&
      gardenOk &&
      garageOk &&
      balconyOk;
  });
}

function drawItems(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.length ? items.map(card).join("") : `<div class="no-results">No encontramos propiedades con esos filtros.</div>`;
  updateCount(items.length);
}

function applyFilters() {
  if (!currentContainerId) return;
  drawItems(currentContainerId, filterItems(currentItems));
}

function renderListing(containerId, mode) {
  currentContainerId = containerId;
  currentMode = mode;
  currentItems = mode === "alquiler" ? rentals : properties;
  drawItems(containerId, filterItems(currentItems));
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const empty = document.getElementById("favoritesEmpty");
  const count = document.getElementById("favoriteCount");
  if (!list || !empty) return;
  const favorites = getFavorites();
  const items = allProperties.filter(item => favorites.has(item.id));
  list.innerHTML = items.map(card).join("");
  empty.style.display = items.length ? "none" : "grid";
  if (count) count.textContent = `${items.length} propiedades`;
}

function renderDetails() {
  const detailRoot = document.getElementById("detailRoot");
  if (!detailRoot) return;
  const params = new URLSearchParams(location.search);
  const item = getItemById(params.get("id"));
  const gallery = item.gallery.length ? item.gallery : [item.image, ...properties.slice(1, 3).map(prop => prop.image)];
  detailRoot.innerHTML = `
    <section class="detail-grid">
      <div>
        <div class="detail-media">
          <button class="detail-main image-open" type="button" data-image="${item.image}" aria-label="Ampliar imagen principal">
            <img src="${item.image}" alt="${item.title}">
          </button>
          <div class="detail-thumbs">${gallery.slice(0, 3).map(src => `<button class="image-open" type="button" data-image="${src}"><img src="${src}" alt="Ambiente de la propiedad"></button>`).join("")}</div>
        </div>
        <div class="detail-heading">
          <strong>${item.price}</strong>
          <a class="badge-button" href="${whatsappLink(item, item.mode === "venta" ? "comprar" : "alquilar")}" target="_blank" rel="noopener">Venta Directa</a>
          <h1>${formatCopy(item.title)}</h1>
          <p>${item.location}</p>
        </div>
        <section class="tech-card">
          <h2>Ficha técnica de la propiedad</h2>
          <div>${item.features.map((feature, index) => `<span><small>${["Sup. cubierta", "Sup. total", "Habitaciones", "Dormitorios", "Baños completos", "Antigüedad"][index]}</small>${formatCopy(feature)}</span>`).join("")}</div>
        </section>
        <section class="description">
          <h2>Descripción del inmueble</h2>
          <p>Espectacular propiedad de diseño minimalista ubicada en una zona destacada. Combina ambientes amplios, luz natural y terminaciones modernas para vivir con comodidad y seguridad.</p>
        </section>
        <section class="comparison">
          <h2>Comparativa de inmobiliarias</h2>
          <div><span>Tracto Propiedades</span><strong>${item.price}</strong><small>Comisión 2%</small><a href="${whatsappLink(item, "contactar")}" target="_blank" rel="noopener">Contactar</a></div>
          <div><span>La Ramos</span><strong>${item.mode === "venta" ? "USD 319.000" : "$210.000/mes"}</strong><small>Comisión 2.5%</small><a href="${whatsappLink(item, "contactar")}" target="_blank" rel="noopener">Contactar</a></div>
        </section>
      </div>
      <aside class="visit-card">
        <h2>Agendar una Visita</h2>
        <label>Nombre Completo<input placeholder="Tu nombre"></label>
        <label>E-mail de Contacto<input placeholder="tu@email.com"></label>
        <div class="visit-schedule">
          <label>Elegí un día<input id="visitDate" type="date"></label>
          <label>Elegí un horario<input id="visitTime" type="time"></label>
        </div>
        <a class="orange-button" href="${whatsappLink(item, "reservar una cita")}" data-reserve="${item.id}" target="_blank" rel="noopener">Reservar cita</a>
        <p>Elegí el día y horario que preferís. Te llevamos a WhatsApp para confirmar la visita.</p>
      </aside>
    </section>
  `;
}

function openImage(src) {
  const modal = document.getElementById("imageModal");
  if (!modal) return;
  modal.querySelector("img").src = src;
  modal.classList.add("open");
}

function closeImage() {
  document.getElementById("imageModal")?.classList.remove("open");
}

document.addEventListener("click", event => {
  const reservation = event.target.closest("[data-reserve]");
  if (reservation) {
    const date = document.getElementById("visitDate")?.value || "a coordinar";
    const time = document.getElementById("visitTime")?.value || "a coordinar";
    const item = getItemById(reservation.dataset.reserve);
    reservation.href = `${whatsappLink(item, "reservar una cita")}%0AFecha%20preferida:%20${encodeURIComponent(date)}%0AHorario%20preferido:%20${encodeURIComponent(time)}`;
  }
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    const favorites = getFavorites();
    const id = saveButton.dataset.save;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    saveFavorites(favorites);
    applyFilters();
    renderFavorites();
    return;
  }

  const imageButton = event.target.closest(".image-open");
  if (imageButton) {
    openImage(imageButton.dataset.image);
    return;
  }

  if (event.target.closest("[data-modal-close]") || event.target.id === "imageModal") {
    closeImage();
  }
});

document.addEventListener("input", event => {
  if (event.target.matches("#searchInput, #typeFilter, #minPrice, #maxPrice, #gardenFilter, #garageFilter, #balconyFilter")) {
    applyFilters();
  }
});

document.addEventListener("change", event => {
  if (event.target.matches("#typeFilter, #gardenFilter, #garageFilter, #balconyFilter")) applyFilters();
});

document.addEventListener("submit", event => {
  if (event.target.matches(".search")) {
    event.preventDefault();
    applyFilters();
  }
});

document.querySelectorAll(".room-buttons button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".room-buttons button").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    applyFilters();
  });
});

const initialSearch = new URLSearchParams(location.search).get("q");
const listingSearch = document.getElementById("searchInput");
if (initialSearch && listingSearch) listingSearch.value = initialSearch;

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeImage();
});

loadCatalogFromDatabase();
loadRemoteFavorites();
