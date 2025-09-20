// ==================== Teachable Machine Model ====================
const URL = "https://teachablemachine.withgoogle.com/models/wIsUNcpFZ/";
let model, maxPredictions;

async function init() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
    console.log("Teachable Machine model loaded ✅");
}
init();

const uploadForm = document.getElementById("uploadForm");
const message = document.getElementById("message");
const recyclingCenters = document.getElementById("recyclingCenters");

// ==================== Upload & Classify ====================
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = uploadForm.querySelector("input[type='file']").files[0];
    if (!file) {
        message.textContent = "Please select an image ❌";
        return;
    }

    const img = document.createElement("img");
    img.src = window.URL.createObjectURL(file);
    img.width = 224;

    img.onload = async () => {
        const prediction = await model.predict(img);
        const topPrediction = prediction.reduce((prev, curr) =>
            prev.probability > curr.probability ? prev : curr
        );

        message.textContent = `Detected: ${topPrediction.className} ✅`;

        // Show nearest recycling centers
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    showNearestRecyclingCenters(topPrediction.className, userLat, userLng);
                },
                err => {
                    console.error(err);
                    recyclingCenters.innerHTML = "<p>Cannot fetch your location. Enable location services 🌱</p>";
                }
            );
        } else {
            recyclingCenters.innerHTML = "<p>Geolocation is not supported by your browser 🌱</p>";
        }
    };
});

// ==================== Nearest Recycling Centers ====================
async function showNearestRecyclingCenters(wasteType, userLat, userLng) {
    try {
        const res = await fetch("js/recycling_centers.json"); // local JSON file
        const centers = await res.json();

        // Filter by waste type
        let filtered = centers.filter(c => c.type.toLowerCase() === wasteType.toLowerCase());

        if (filtered.length === 0) {
            recyclingCenters.innerHTML = "<p>No centers found 🌱</p>";
            return;
        }

        // Compute distance and sort
        filtered.forEach(c => {
            c.distance = getDistance(userLat, userLng, c.lat, c.lng);
        });

        filtered.sort((a, b) => a.distance - b.distance);

        // Take top 3 nearest
        const nearest = filtered.slice(0, 3);

        let html = `<h3>Nearest Recycling Centers for ${wasteType}</h3>`;
        nearest.forEach(center => {
            html += `
                <p>
                    <strong>${center.name}</strong><br>
                    ${center.address}<br>
                    📞 <a href="tel:${center.phone}">${center.phone}</a><br>
                    🌐 <a href="${center.website}" target="_blank">${center.website}</a>
                </p><hr>
            `;
        });

        recyclingCenters.innerHTML = html;

    } catch (err) {
        console.error(err);
        recyclingCenters.innerHTML = "<p>Error loading recycling centers ❌</p>";
    }
}

// ==================== Haversine Formula ====================
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
