/* ================================
   SLAPMAP: EAST BAY — SCRIPT.JS
   ================================ */

// ---------- LOADING SEQUENCE ----------
const loadingScreen = document.getElementById("loading-screen");
const progressBar = document.querySelector(".progress-fill");
const progressText = document.getElementById("progress-text");
const soundBtn = document.getElementById("sound-toggle");

let soundPlaying = false;
const audio = new Audio(
  "https://archive.org/download/Windows95StartupSound/Windows95StartupSound.mp3",
);
audio.loop = true;

soundBtn.addEventListener("click", () => {
  if (soundPlaying) {
    audio.pause();
    soundBtn.textContent = "Sound Off";
  } else {
    audio.play();
    soundBtn.textContent = "Sound On";
  }
  soundPlaying = !soundPlaying;
});

let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 7;
  progressBar.style.width = Math.min(progress, 100) + "%";
  if (progress < 30)
    progressText.textContent = "Decrypting East Bay coordinates...";
  else if (progress < 60)
    progressText.textContent = "Loading hyphy transmissions...";
  else if (progress < 90) progressText.textContent = "Rendering slap grid...";
  else progressText.textContent = "SLAPMAP ONLINE.";
  if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => loadingScreen.classList.add("hide"), 1000);
  }
}, 200);

// ---------- MAP SETUP ----------
const map = L.map("map", {
  center: [37.85, -122.25],
  zoom: 13,
  zoomControl: true,
  scrollWheelZoom: true,
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> & <a href="https://carto.com/">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19,
}).addTo(map);

// ---------- ICONS ----------
const icons = {
  "food": L.icon({
    iconUrl: "food_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  "drinks": L.icon({
    iconUrl: "liquid_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  "objects dept": L.icon({
    iconUrl: "objects_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  "aesthetic moments": L.icon({
    iconUrl: "aesthetic_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  "touch grass": L.icon({
    iconUrl: "grass_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
};

// ---------- LOAD CSV ----------
const markers = [];

Papa.parse("SlapMap csv - Sheet1 (6).csv", {
  download: true,
  header: true,
  complete: function (results) {
    results.data.forEach((row) => {
      if (!row.latitude || !row.longitude) return;

      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      const name = row.name?.trim() || "Unnamed";
      const category = row.category?.trim().toLowerCase();
      const description = row.description?.trim() || "";
      const price = row.price?.trim() || "";
      const address = row.address?.trim() || "";
      const link = row.link?.trim() || "";
      const proTip = row["pro tip"]?.trim() || "";

      const icon = icons[category] || icons["food"];

      const popupHTML = `
        <div class="popup-content">
          <a href="${link}" target="_blank" class="popup-title">${name}</a>
          <p>${description}</p>
          ${price ? `<div class="price-badge"><span>${price}</span></div>` : ""}
          ${address ? `<p class="popup-address">${address}</p>` : ""}
          ${proTip ? `<div class="protip"><span class="label">Pro Tip:</span> ${proTip}</div>` : ""}
        </div>
      `;

      const marker = L.marker([lat, lng], { icon }).bindPopup(popupHTML);
      marker.category = category;
      markers.push(marker);
      marker.addTo(map);
    });
  },
});

// ---------- FILTER BUTTONS ----------
document.querySelectorAll(".button-container button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.getAttribute("data-category");
    document
      .querySelectorAll(".button-container button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    markers.forEach((marker) => {
      if (category === "all" || marker.category === category) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  });
});
