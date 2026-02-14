// --- CONFIGURACIÓN ---

// 1. LINK PARA LEER (Tu CSV actual)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv'; 

// 2. LINK PARA GUARDAR (El de Apps Script)
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzghewipW-BXWrLDy4Rv5T20322BkD15UjmoryzHTO9LgcSj0x4G7sOW2JRTWWaqzCXYw/exec';

const FALLBACK_NUMBER = '5491100000000'; 
const FALLBACK_BONUS = '---------';
const FALLBACK_SPINS = '-------';
const BASE_MESSAGE = "Hola, quiero reclamar mi bono de bienvenida y mis tiros gratis.";

// --- ELEMENTOS DEL DOM ---
const btn = document.getElementById('cta-button');
const btnText = document.getElementById('btn-text');
const bonusElement = document.getElementById('bonus-text'); 
const spinsElement = document.getElementById('spins-text'); 

// --- FUNCIÓN: ENVIAR AL EXCEL (TRACKER) ---
function trackToExcel(accion) {
    function trackToExcel(accion) {
  if (!WEBHOOK_URL.includes("script.google.com")) return;

  const urlParams = new URLSearchParams(window.location.search);
  const fuente = urlParams.get("utm_source") || document.referrer || "Directo";
  const dispositivo = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? "Móvil" : "PC";

  const payload = JSON.stringify({ fuente, dispositivo, accion });

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

}

// --- EVENTO CLIC (WhatsApp + GA4 + Excel) ---
btn.addEventListener("click", (e) => {
    e.preventDefault(); 
    const url = btn.href;

    // 1. GA4
    if (typeof gtag === "function") {
        gtag("event", "click_whatsapp", {
            event_category: "lead",
            event_label: "cta_whatsapp",
            page_location: window.location.href
        });
    }

    // 2. Excel (Tracker)
    trackToExcel('CLIC WHATSAPP ✅');
    // Añadir esto dentro del evento click del botón en tu script.js
    gtag('event', 'conversion', {
        'send_to': 'AW-17864184568/FUOuCMuoiuAbEPilp8ZC'
    });

    // 3. Redirigir
    // Damos 600ms para asegurar que los scripts corran
    setTimeout(() => { window.location.href = url; }, 80);
});

// --- CARGA DE DATOS ---
async function updateContent() {
    try {
        // Registrar visita al cargar
        trackToExcel('Visita Web');

        console.log("Cargando datos...");
        const uniqueUrl = `${SHEET_URL}&t=${Math.floor(Date.now() / 60000)}`;
        
        const response = await fetch(uniqueUrl);
        if (!response.ok) throw new Error("Error de red");

        const data = await response.text();
        const rows = data.split('\n');

        // 1. Teléfono
        let rawPhone = rows[0] || '';
        let cleanNumber = rawPhone.replace(/\D/g, ''); 
        if (!cleanNumber || cleanNumber.length < 8) cleanNumber = FALLBACK_NUMBER;
        setButtonLink(cleanNumber);

        // 2. Bono
        let rawAmount = rows[1] ? rows[1].trim() : '';
        let cleanAmount = rawAmount.replace(/\D/g, ''); 
        if (cleanAmount.length > 0) {
            let formatted = new Intl.NumberFormat('es-AR').format(cleanAmount);
            bonusElement.innerText = `$${formatted} ARS`;
        } else {
            bonusElement.innerText = FALLBACK_BONUS;
        }

        // 3. Giros
        let rawSpins = rows[2] ? rows[2].trim() : '';
        let cleanSpins = rawSpins.replace(/\D/g, ''); 
        if (cleanSpins.length > 0) {
            spinsElement.innerText = cleanSpins;
        } else {
            spinsElement.innerText = FALLBACK_SPINS;
        }

    } catch (error) {
        console.warn("Usando backup por error:", error);
        setButtonLink(FALLBACK_NUMBER);
        bonusElement.innerText = FALLBACK_BONUS;
        spinsElement.innerText = FALLBACK_SPINS;
    }
}

function setButtonLink(number) {
    const finalUrl = `https://wa.me/${number}?text=${encodeURIComponent(BASE_MESSAGE)}`;
    btn.href = finalUrl;
    btnText.innerText = "RECLAMAR MI BONO";
    btn.classList.add('active'); 
}

// Iniciar
updateContent();

// // --- ELEMENTOS DEL DOM ---
// const btn = document.getElementById('cta-button');
// const btnText = document.getElementById('btn-text');
// const bonusElement = document.getElementById('bonus-text'); 
// const spinsElement = document.getElementById('spins-text'); // Elemento nuevo
// // --- EVENTO GA4: click a WhatsApp ---
// btn.addEventListener("click", (e) => {
//   // Si el botón es <a>, frenamos un instante para enviar el evento
//   const url = btn.href;

//   if (typeof gtag === "function") {
//     e.preventDefault();

//     gtag("event", "click_whatsapp", {
//       event_category: "lead",
//       event_label: "cta_whatsapp",
//       page_location: window.location.href,
//       transport_type: "beacon",
//       event_callback: function () {
//         window.location.href = url;
//       }
//     });

//     // fallback por si el callback no corre
//     setTimeout(() => (window.location.href = url), 800);
//   }
// });



// async function updateContent() {
//     try {
//         console.log("Consultando datos...");
//         const uniqueUrl = `${SHEET_URL}&t=${new Date().getTime()}`;
        
//         const response = await fetch(uniqueUrl);
//         if (!response.ok) throw new Error("Error de red");

//         const data = await response.text();
//         const rows = data.split('\n'); // Separamos por filas

//         // --- 1. PROCESAR TELÉFONO (Fila 1 / A1) ---
//         let rawPhone = rows[0] || '';
//         let cleanNumber = rawPhone.replace(/\D/g, ''); 
//         if (!cleanNumber || cleanNumber.length < 8) cleanNumber = FALLBACK_NUMBER;
//         setButtonLink(cleanNumber);

//         // --- 2. PROCESAR BONO (Fila 2 / A2) ---
//         let rawAmount = rows[1] ? rows[1].trim() : '';
//         rawAmount = rawAmount.replace(/^"|"$/g, ''); // Limpiar comillas
//         if (rawAmount.length > 0) {
//             bonusElement.innerText = `$${rawAmount} ARS`;
//         }

//         // --- 3. PROCESAR TIROS (Fila 3 / A3) ---
//         let rawSpins = rows[2] ? rows[2].trim() : '';
//         rawSpins = rawSpins.replace(/^"|"$/g, ''); // Limpiar comillas
//         if (rawSpins.length > 0) {
//             spinsElement.innerText = rawSpins;
//             console.log("Tiros actualizados a:", rawSpins);
//         }

//     } catch (error) {
//         console.warn("Usando valores por defecto.", error);
//         setButtonLink(FALLBACK_NUMBER);
//         bonusElement.innerText = FALLBACK_BONUS;
//         spinsElement.innerText = FALLBACK_SPINS;
//     }
// }

// function setButtonLink(number) {
//   const finalUrl = `https://wa.me/${number}?text=${encodeURIComponent(BASE_MESSAGE)}`;
//   btn.href = finalUrl;
//   btnText.innerText = "RECLAMAR MI BONO";
//   btn.classList.add('active'); 
// }


// updateContent();
