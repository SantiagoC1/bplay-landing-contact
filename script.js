// --- CONFIGURACIÓN ---

// 1. PEGA AQUÍ EL ENLACE .CSV DE GOOGLE SHEETS
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv'; 
const FALLBACK_NUMBER = '5491100000000'; 
const FALLBACK_BONUS = '---------';
const FALLBACK_SPINS = '-------'; // Valor por defecto de tiros
const BASE_MESSAGE = "Hola, quiero reclamar mi bono de bienvenida y mis tiros gratis.";


// --- ELEMENTOS DEL DOM ---
const btn = document.getElementById('cta-button');
const btnText = document.getElementById('btn-text');
const bonusElement = document.getElementById('bonus-text'); 
const spinsElement = document.getElementById('spins-text'); // Elemento nuevo
// --- EVENTO GA4: click a WhatsApp ---
btn.addEventListener("click", () => {
  if (typeof gtag === "function") {
    gtag("event", "click_whatsapp", {
      event_category: "lead",
      event_label: "cta_whatsapp",
      page_location: window.location.href
    });
  }
});


async function updateContent() {
    try {
        console.log("Consultando datos...");
        const uniqueUrl = `${SHEET_URL}&t=${new Date().getTime()}`;
        
        const response = await fetch(uniqueUrl);
        if (!response.ok) throw new Error("Error de red");

        const data = await response.text();
        const rows = data.split('\n'); // Separamos por filas

        // --- 1. PROCESAR TELÉFONO (Fila 1 / A1) ---
        let rawPhone = rows[0] || '';
        let cleanNumber = rawPhone.replace(/\D/g, ''); 
        if (!cleanNumber || cleanNumber.length < 8) cleanNumber = FALLBACK_NUMBER;
        setButtonLink(cleanNumber);

        // --- 2. PROCESAR BONO (Fila 2 / A2) ---
        let rawAmount = rows[1] ? rows[1].trim() : '';
        rawAmount = rawAmount.replace(/^"|"$/g, ''); // Limpiar comillas
        if (rawAmount.length > 0) {
            bonusElement.innerText = `$${rawAmount} ARS`;
        }

        // --- 3. PROCESAR TIROS (Fila 3 / A3) ---
        let rawSpins = rows[2] ? rows[2].trim() : '';
        rawSpins = rawSpins.replace(/^"|"$/g, ''); // Limpiar comillas
        if (rawSpins.length > 0) {
            spinsElement.innerText = rawSpins;
            console.log("Tiros actualizados a:", rawSpins);
        }

    } catch (error) {
        console.warn("Usando valores por defecto.", error);
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


updateContent();
