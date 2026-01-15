// --- CONFIGURACIÓN ---

// 1. PEGA AQUÍ EL ENLACE .CSV DE GOOGLE SHEETS
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv'; 
const FALLBACK_NUMBER = '5491100000000'; 
const FALLBACK_BONUS = '---------';
const FALLBACK_SPINS = '-------'; // Valor por defecto de tiros
const BASE_MESSAGE = "Hola, quiero reclamar mi bono de bienvenida y mis tiros gratis.";

// 2. LINK PARA GUARDAR DATOS (El que creaste recién en Apps Script)
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxPPfu8kRSjkqlmgG1PRPFqAf444wZZiu7-dUhlemAfw7-0Ao1z6xEvvOTk-e3hbTEOrw/exec';

// --- ELEMENTOS DEL DOM ---
const btn = document.getElementById('cta-button');
const btnText = document.getElementById('btn-text');
const bonusElement = document.getElementById('bonus-text'); 
const spinsElement = document.getElementById('spins-text'); 

// --- FUNCIÓN: ENVIAR DATOS AL EXCEL (Sistema de Rastreo) ---
function trackToExcel(accion) {
    if (!WEBHOOK_URL.includes('script.google.com')) return; // Seguridad si está vacío

    // Detectar origen (UTM) y dispositivo
    const urlParams = new URLSearchParams(window.location.search);
    const fuente = urlParams.get('utm_source') || document.referrer || 'Directo';
    const esMovil = /iPhone|Android/i.test(navigator.userAgent);
    
    const datos = {
        fuente: fuente,
        dispositivo: esMovil ? 'Móvil' : 'PC',
        accion: accion
    };

    fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', // Vital para que funcione sin errores de navegador
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    }).catch(err => console.log('Tracker error', err));
}

// --- EVENTO CLIC EN BOTÓN (WhatsApp + GA4 + Excel) ---
btn.addEventListener("click", (e) => {
    e.preventDefault(); // Pausamos un segundo para traquear
    const url = btn.href;

    // 1. Enviar evento a Google Analytics 4
    if (typeof gtag === "function") {
        gtag("event", "click_whatsapp", {
            event_category: "lead",
            event_label: "cta_whatsapp",
            page_location: window.location.href
        });
    }

    // 2. Guardar el clic en el Excel del cliente
    trackToExcel('CLIC WHATSAPP ✅');

    // 3. Redirigir a WhatsApp (con pequeña demora para asegurar envío)
    setTimeout(() => { window.location.href = url; }, 500);
});

// --- LÓGICA DE CARGA DE DATOS (Precio/Teléfono) ---
async function updateContent() {
    try {
        console.log("Consultando datos...");
        
        // Registrar la VISITA apenas carga la página
        trackToExcel('Visita Web');

        const uniqueUrl = `${SHEET_URL}&t=${new Date().getTime()}`;
        const response = await fetch(uniqueUrl);
        if (!response.ok) throw new Error("Error de red");

        const data = await response.text();
        const rows = data.split('\n');

        // 1. TELÉFONO
        let rawPhone = rows[0] || '';
        let cleanNumber = rawPhone.replace(/\D/g, ''); 
        if (!cleanNumber || cleanNumber.length < 8) cleanNumber = FALLBACK_NUMBER;
        setButtonLink(cleanNumber);

        // 2. BONO (Con formato de puntos)
        let rawAmount = rows[1] ? rows[1].trim() : '';
        let cleanAmount = rawAmount.replace(/\D/g, ''); 
        if (cleanAmount.length > 0) {
            // Formatear: 10000 -> 10.000
            let formatted = new Intl.NumberFormat('es-AR').format(cleanAmount);
            bonusElement.innerText = `$${formatted} ARS`;
        } else {
            bonusElement.innerText = FALLBACK_BONUS;
        }

        // 3. GIROS
        let rawSpins = rows[2] ? rows[2].trim() : '';
        let cleanSpins = rawSpins.replace(/\D/g, ''); 
        if (cleanSpins.length > 0) {
            spinsElement.innerText = cleanSpins;
        } else {
            spinsElement.innerText = FALLBACK_SPINS;
        }

    } catch (error) {
        console.warn("Usando default", error);
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

// Iniciar todo
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
