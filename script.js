// --- CONFIGURACIÓN ---

// 1) LINK PARA LEER (Tu CSV actual)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv";

// 2) LINK PARA GUARDAR (El de Apps Script)
const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzghewipW-BXWrLDy4Rv5T20322BkD15UjmoryzHTO9LgcSj0x4G7sOW2JRTWWaqzCXYw/exec";

const FALLBACK_NUMBER = "5491100000000";
const FALLBACK_BONUS = "---------";
const FALLBACK_SPINS = "-------";
const BASE_MESSAGE = "Hola, quiero reclamar mi bono de bienvenida y mis tiros gratis.";

// --- ELEMENTOS DEL DOM ---
const btn = document.getElementById("cta-button");
const btnText = document.getElementById("btn-text");
const bonusElement = document.getElementById("bonus-text");
const spinsElement = document.getElementById("spins-text");

// --- HELPERS ---
function getUtmData() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get("utm_source") || "direct",
    utm_medium: urlParams.get("utm_medium") || "none",
    utm_campaign: urlParams.get("utm_campaign") || "none",
    utm_term: urlParams.get("utm_term") || "",
    utm_content: urlParams.get("utm_content") || ""
  };
}

// --- FUNCIÓN: ENVIAR AL EXCEL (TRACKER) ---
function trackToExcel(accion) {
  if (!WEBHOOK_URL || !WEBHOOK_URL.includes("script.google.com")) return;

  const utm = getUtmData();
  const fuente = utm.utm_source || document.referrer || "Directo";
  const dispositivo = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    ? "Móvil"
    : "PC";

  const payload = JSON.stringify({
    fuente,
    dispositivo,
    accion,
    ...utm
  });

  // ✅ 1) Beacon (mejor para trackers)
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(WEBHOOK_URL, blob);
    return;
  }

  // ✅ 2) Fallback
  fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: payload
  }).catch(() => {});
}

// --- EVENTO CLIC (WhatsApp + GA4 + Ads + Excel) ---
if (btn) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const url = btn.href;
    const utm = getUtmData();

    // 1) GA4 (evento)
    if (typeof gtag === "function") {
      gtag("event", "click_whatsapp", {
        link_url: url,
        event_category: "lead",
        event_label: "cta_whatsapp",
        ...utm
      });
    }

    // 2) Google Ads (Conversión) ✅ SOLO EN CLICK
    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-17864184568/FUOuCMuoiuAbEPilp8ZC"
      });
    }

    // 3) Excel (Tracker) (si falla, no rompe el click)
    try { trackToExcel("CLIC WHATSAPP ✅"); } catch (e) {}


    // 4) Redirigir con tiempo para asegurar envío
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  });
}

// --- CARGA DE DATOS ---
async function updateContent() {
  try {
    // Registrar visita
    try { trackToExcel("Visita Web"); } catch (e) {}

    const uniqueUrl = `${SHEET_URL}&t=${Math.floor(Date.now() / 60000)}`;
    const response = await fetch(uniqueUrl);

    if (!response.ok) throw new Error("Error de red");

    const data = await response.text();
    const rows = data.split("\n").map((r) => r.trim());

    // 1) Teléfono
    let rawPhone = rows[0] || "";
    let cleanNumber = rawPhone.replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 8) cleanNumber = FALLBACK_NUMBER;
    setButtonLink(cleanNumber);

    // 2) Bono
    let rawAmount = rows[1] ? rows[1].trim() : "";
    let cleanAmount = rawAmount.replace(/\D/g, "");
    if (cleanAmount.length > 0) {
      let formatted = new Intl.NumberFormat("es-AR").format(cleanAmount);
      if (bonusElement) bonusElement.innerText = `$${formatted} ARS`;
    } else {
      if (bonusElement) bonusElement.innerText = FALLBACK_BONUS;
    }

    // 3) Giros
    let rawSpins = rows[2] ? rows[2].trim() : "";
    let cleanSpins = rawSpins.replace(/\D/g, "");
    if (cleanSpins.length > 0) {
      if (spinsElement) spinsElement.innerText = cleanSpins;
    } else {
      if (spinsElement) spinsElement.innerText = FALLBACK_SPINS;
    }
  } catch (error) {
    console.warn("Usando backup por error:", error);
    setButtonLink(FALLBACK_NUMBER);
    if (bonusElement) bonusElement.innerText = FALLBACK_BONUS;
    if (spinsElement) spinsElement.innerText = FALLBACK_SPINS;
  }
}

function setButtonLink(number) {
  const finalUrl = `https://wa.me/${number}?text=${encodeURIComponent(
    BASE_MESSAGE
  )}`;
  if (!btn) return;

  btn.href = finalUrl;

  if (btnText) btnText.innerText = "RECLAMAR MI BONO";
  btn.classList.add("active");
}
function doOptions(e) {
   return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}


// Iniciar
updateContent();
