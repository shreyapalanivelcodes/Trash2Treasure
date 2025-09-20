// ==================== Tips Array ====================
const tips = [
    "♻️ Recycle plastic bottles properly.",
    "🌱 Compost kitchen waste.",
    "⚡ Switch off unused devices to save energy.",
    "💧 Save water; avoid wastage.",
    "🛍️ Use reusable bags.",
    "📦 Buy products with minimal packaging.",
    "🌿 Plant a tree.",
    "🚲 Walk or cycle for short distances.",
    "♻️ Donate old items instead of discarding.",
    "📚 Educate others about sustainable living.",
    "🌱 Avoid single-use plastics.",
    "⚡ Use LED lights to save electricity.",
    "💧 Fix leaking taps immediately.",
    "🌿 Support local eco-friendly businesses.",
    "📦 Reuse packaging materials.",
    "♻️ Participate in local clean-up drives.",
    "🛍️ Prefer eco-friendly products.",
    "🌱 Grow a small herb garden at home.",
    "🚲 Carpool when possible.",
    "📚 Share knowledge about recycling with friends."
];

// ==================== Show Random Tip ====================
function showRandomTip() {
    const tipPopup = document.getElementById("tipPopup");
    if (!tipPopup) return;

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipPopup.textContent = randomTip;
    tipPopup.style.display = "block";

    // Hide after 10 seconds
    setTimeout(() => {
        tipPopup.style.display = "none";
    }, 10000);
}

// Show tip when page loads
window.addEventListener("load", showRandomTip);
