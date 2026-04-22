const stopList = document.getElementById('stop-list');
const summaryStops = document.getElementById('summary-stops');
const summaryTheme = document.getElementById('summary-theme');
const fitRouteButton = document.getElementById('fit-route');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const titleEl = document.getElementById('story-title');

const locationEl = document.getElementById('story-location');

const featuredImage = document.getElementById('featured-image');
const thumbStrip = document.getElementById('thumb-strip');

const bodyEl = document.getElementById('story-body');


summaryStops.textContent = stops.length;
summaryTheme.textContent = storyTheme;

document.title = `${storyTheme} Story Map`;

const map = L.map('map', {
  center: [-37.96715716216845, 145.0312039098792],
  zoom: 10,
  zoomControl: true,
  scrollWheelZoom: true,
  worldCopyJump: true
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

const routeCoords = stops.map(stop => stop.coords);
const bounds = L.latLngBounds(routeCoords);


const markers = [];

function createMarkerIcon(index) {
  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div class="custom-marker">${index + 1}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -12]
  });
}

function selectPhoto(stop, photoIndex) {
  const photo = stop.photos[photoIndex];
  featuredImage.src = photo.src;
  featuredImage.alt = photo.alt || stop.title;

  featuredImage.oneclick = () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt || stop.title;
  };
  thumbStrip.querySelectorAll('button').forEach((button, index) => {
    button.classList.toggle('active', index === photoIndex);
  });
}

function renderStory(stop) {
  titleEl.textContent = stop.title;
  
  locationEl.textContent = stop.locationLabel;
  
  
  bodyEl.innerHTML = stop.body.map(paragraph => `<p>${paragraph}</p>`).join('');

  thumbStrip.innerHTML = stop.photos.map((photo, index) => `
  <button class="thumb ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Open photo ${index + 1}">
    <img src="${photo.src}" alt="${photo.alt || stop.title}" />
    <span>${photo.caption || ''}</span>
  </button>
`).join('');

  thumbStrip.querySelectorAll('.thumb').forEach(button => {
    button.addEventListener('click', () => selectPhoto(stop, Number(button.dataset.index)));
  });

  selectPhoto(stop, 0);
}

stops.forEach((stop, index) => {
  const marker = L.marker(stop.coords, { icon: createMarkerIcon(index) }).addTo(map);
  marker.bindPopup(`<strong>${stop.title}</strong><br>`);
  marker.on('click', () => renderStory(stop));
  markers.push(marker);

  const card = document.createElement('button');
  card.className = 'stop-card';
  card.innerHTML = `
    <div class="stop-card-number">${index + 1}</div>
    <div class="stop-card-copy">
      <h3>${stop.title}</h3>
      </div>
     
  `;
  card.addEventListener('click', () => {
    renderStory(stop);
    map.flyTo(stop.coords, Math.max(map.getZoom(), 15), { duration: 1.2 });
    marker.openPopup();
  });
  stopList.appendChild(card);
});

fitRouteButton.addEventListener('click', () => {
  map.fitBounds(bounds, { padding: [60, 60] });
});


renderStory(stops[0]);

featuredImage.addEventListener('click', () => {
  lightbox.style.display = 'flex';
  lightboxImg.src = featuredImage.src;
  lightboxImg.alt = featuredImage.alt;
});

lightbox.addEventListener('click', () => {
  lightbox.style.display = 'none';
});