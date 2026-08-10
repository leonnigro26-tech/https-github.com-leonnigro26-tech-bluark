const whatsappNumber = "5493515089081";

let properties = [
  {
    id: "moderno-jardin",
    mode: "venta",
    type: "duplex",
    bedrooms: 2,
    priceValue: 245000,
    amenities: ["jardin", "cochera"],
    title: "Hermoso Duplex Moderno con Jardin Privado",
    shortTitle: "Duplex con jardin",
    location: "Palermo Soho",
    address: "Gorriti 5100, Palermo, CABA",
    price: "USD 245.000",
    agency: "La Ramos",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=82"
    ],
    stats: ["110 m2", "2 Dorms.", "2 Banos"],
    features: ["110 m2", "3 Ambientes", "2 Dorms.", "2 Banos", "2 Anos", "A estrenar"]
  },
  {
    id: "casa-premium",
    mode: "venta",
    type: "casa",
    bedrooms: 3,
    priceValue: 315000,
    amenities: ["jardin", "cochera", "pileta"],
    title: "Casa Premium en Barrio Cerrado",
    shortTitle: "Casa Premium",
    location: "Villa Allende",
    address: "Av. San Martin 1200",
    price: "USD 315.000",
    agency: "Tracto Propiedades",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["220 m2", "3 Dorms.", "3 Banos"],
    features: ["220 m2", "5 Ambientes", "3 Dorms.", "3 Banos", "5 Anos", "Pileta"]
  },
  {
    id: "depto-vista",
    mode: "venta",
    type: "departamento",
    bedrooms: 2,
    priceValue: 420000,
    amenities: ["cochera", "balcon"],
    title: "Departamento con Vista Panoramica",
    shortTitle: "Departamento con vista",
    location: "Nueva Cordoba",
    address: "Buenos Aires 850",
    price: "USD 420.000",
    agency: "Gomez Estevez",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["145 m2", "2 Dorms.", "2 Banos"],
    features: ["145 m2", "4 Ambientes", "2 Dorms.", "2 Banos", "1 Ano", "Cochera"]
  },
  {
    id: "edificio-centro",
    mode: "venta",
    type: "departamento",
    bedrooms: 2,
    priceValue: 189000,
    amenities: ["balcon"],
    title: "Departamento Clasico Reciclado",
    shortTitle: "Depto reciclado",
    location: "Recoleta",
    address: "Av. Quintana 200",
    price: "USD 189.000",
    agency: "La Ramos",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["85 m2", "2 Dorms.", "1 Bano"],
    features: ["85 m2", "3 Ambientes", "2 Dorms.", "1 Bano", "12 Anos", "Balcon"]
  },
  {
    id: "quinta-verde",
    mode: "venta",
    type: "casa",
    bedrooms: 4,
    priceValue: 390000,
    amenities: ["jardin", "cochera", "pileta"],
    title: "Casa Quinta con Galeria Verde",
    shortTitle: "Casa quinta",
    location: "Ramos Mejia",
    address: "Belgrano 900",
    price: "USD 390.000",
    agency: "Ramos Premium",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["240 m2", "4 Dorms.", "3 Banos"],
    features: ["240 m2", "6 Ambientes", "4 Dorms.", "3 Banos", "8 Anos", "Jardin"]
  },
  {
    id: "loft-industrial",
    mode: "venta",
    type: "loft",
    bedrooms: 1,
    priceValue: 135000,
    amenities: ["balcon"],
    title: "Loft Industrial con Terraza",
    shortTitle: "Loft industrial",
    location: "Palermo Soho",
    address: "Thames 1800",
    price: "USD 135.000",
    agency: "Tracto Propiedades",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["58 m2", "1 Dorm.", "1 Bano"],
    features: ["58 m2", "2 Ambientes", "1 Dorm.", "1 Bano", "4 Anos", "Terraza"]
  },
  {
    id: "casa-minimal",
    mode: "venta",
    type: "casa",
    bedrooms: 3,
    priceValue: 298000,
    amenities: ["jardin", "cochera"],
    title: "Casa Minimalista con Patio",
    shortTitle: "Casa minimalista",
    location: "Belgrano R",
    address: "Superi 2300, Belgrano",
    price: "USD 298.000",
    agency: "Norte Propiedades",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["180 m2", "3 Dorms.", "2 Banos"],
    features: ["180 m2", "4 Ambientes", "3 Dorms.", "2 Banos", "3 Anos", "Patio"]
  },
  {
    id: "ph-boedo",
    mode: "venta",
    type: "ph",
    bedrooms: 2,
    priceValue: 165000,
    amenities: ["patio"],
    title: "PH Reciclado con Patio Propio",
    shortTitle: "PH reciclado",
    location: "Boedo",
    address: "Maza 840, Boedo",
    price: "USD 165.000",
    agency: "Sur Casas",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["92 m2", "2 Dorms.", "1 Bano"],
    features: ["92 m2", "3 Ambientes", "2 Dorms.", "1 Bano", "10 Anos", "Patio"]
  },
  {
    id: "local-palermo",
    mode: "venta",
    type: "local",
    bedrooms: 1,
    priceValue: 120000,
    amenities: ["cochera"],
    title: "Local Comercial sobre Avenida",
    shortTitle: "Local comercial",
    location: "Palermo",
    address: "Av. Santa Fe 3900",
    price: "USD 120.000",
    agency: "Comercial BA",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["50 m2", "1 Planta", "1 Bano"],
    features: ["50 m2", "1 Ambiente", "1 Planta", "1 Bano", "6 Anos", "Vidriera"]
  },
  {
    id: "depto-caballito",
    mode: "venta",
    type: "departamento",
    bedrooms: 3,
    priceValue: 210000,
    amenities: ["balcon", "cochera"],
    title: "Departamento Familiar con Balcon",
    shortTitle: "Depto familiar",
    location: "Caballito",
    address: "Pedro Goyena 600",
    price: "USD 210.000",
    agency: "Centro Hogar",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["105 m2", "3 Dorms.", "2 Banos"],
    features: ["105 m2", "4 Ambientes", "3 Dorms.", "2 Banos", "7 Anos", "Balcon"]
  },
  {
    id: "duplex-nordelta",
    mode: "venta",
    type: "duplex",
    bedrooms: 4,
    priceValue: 460000,
    amenities: ["jardin", "cochera", "pileta"],
    title: "Duplex Premium con Muelle",
    shortTitle: "Duplex premium",
    location: "Nordelta",
    address: "Barrio Los Lagos",
    price: "USD 460.000",
    agency: "Delta Real Estate",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["260 m2", "4 Dorms.", "3 Banos"],
    features: ["260 m2", "6 Ambientes", "4 Dorms.", "3 Banos", "2 Anos", "Muelle"]
  },
  {
    id: "monoambiente-centro",
    mode: "venta",
    type: "departamento",
    bedrooms: 1,
    priceValue: 89000,
    amenities: ["balcon"],
    title: "Monoambiente Divisible Luminoso",
    shortTitle: "Monoambiente",
    location: "Microcentro",
    address: "Maipu 500",
    price: "USD 89.000",
    agency: "Urbana BA",
    badge: "VENTA",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=82",
    gallery: [],
    stats: ["42 m2", "1 Dorm.", "1 Bano"],
    features: ["42 m2", "1 Ambiente", "1 Dorm.", "1 Bano", "4 Anos", "Luminoso"]
  }
];

const rentPrices = [180000, 250000, 95000, 120000, 210000, 85000, 310000, 145000, 220000, 175000, 390000, 78000];

let rentals = properties.map((item, index) => ({
  ...item,
  id: `alquiler-${item.id}`,
  mode: "alquiler",
  badge: "ALQUILER",
  priceValue: rentPrices[index],
  price: `$${rentPrices[index].toLocaleString("es-AR")}/mes`
}));

let allProperties = [...properties, ...rentals];

const localCatalogById = new Map(properties.map(item => [item.id, item]));

function formatPrice(value, mode) {
  const amount = Number(value || 0).toLocaleString("es-AR");
  return mode === "alquiler" ? `$${amount}/mes` : `USD ${amount}`;
}

function catalogItem(item) {
  const localItem = localCatalogById.get(item.id) || {};
  const mode = item.mode === "alquiler" ? "alquiler" : "venta";
  const bedrooms = Number(item.bedrooms || 0);
  const bathrooms = Number(item.bathrooms || 0);
  const surface = Number(item.surface || 0);
  return {
    ...localItem,
    ...item,
    mode,
    badge: item.sold ? "VENDIDA" : (item.alquilada ? "ALQUILADA" : mode.toUpperCase()),
    image: localItem.image || "bluark-logo-clean.png",
    gallery: localItem.gallery || [],
    amenities: localItem.amenities || [],
    price: formatPrice(item.priceValue, mode),
    stats: [`${surface} m2`, `${bedrooms} Dorms.`, `${bathrooms} Banos`],
    features: [`${surface} m2`, `${bedrooms + 1} Ambientes`, `${bedrooms} Dorms.`, `${bathrooms} Banos`]
  };
}

async function loadCatalogFromDatabase() {
  try {
    const response = await fetch("/api/properties", { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    if (!Array.isArray(payload.properties) || !payload.properties.length) return;
    properties = payload.properties
      .map(catalogItem)
      .filter(item => item.mode === "venta" && !item.alquilada);
    rentals = payload.properties
      .map(catalogItem)
      .filter(item => item.mode === "alquiler" && !item.alquilada);
    allProperties = [...properties, ...rentals];
    if (currentContainerId) renderListing(currentContainerId, currentMode);
    renderFavorites();
  } catch {
    // The catalogue defined above remains available when the sheet is offline.
  }
}
