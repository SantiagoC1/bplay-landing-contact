// --- CONFIGURACIÓN ---

// 1. PEGA AQUÍ EL ENLACE .CSV DE GOOGLE SHEETS
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv'; 

// --- CONFIGURACIÓN ---
const FALLBACK_NUMBER = '5491100000000'; 
const FALLBACK_BONUS = '$14.000'; // Valor por defecto si falla todo
const MESSAGE = "Hola, quiero reclamar mi bono de bienvenida.";

// --- ELEMENTOS DEL DOM ---
const btn = document.getElementById('cta-button');
const btnText = document.getElementById('btn-text');
const bonusElement = document.getElementById('bonus-text'); 

async function updateContent() {
    try {
        console.log("Consultando datos...");
        // Truco anti-caché para que actualice al instante
        const uniqueUrl = `${SHEET_URL}&t=${new Date().getTime()}`;
        
        const response = await fetch(uniqueUrl);
        if (!response.ok) throw new Error("Error de red");

        const data = await response.text();
        const rows = data.split('\n');

        // --- 1. PROCESAR TELÉFONO (Celda A1) ---
        let rawPhone = rows[0] || '';
        let cleanNumber = rawPhone.replace(/\D/g, ''); 
        
        if (!cleanNumber || cleanNumber.length < 8) {
            cleanNumber = FALLBACK_NUMBER;
        }
        setButtonLink(cleanNumber);

        // --- 2. PROCESAR BONO (Celda A2) ---
        // Tomamos el dato crudo (ej: "20.000" o "50000")
        let rawAmount = rows[1] ? rows[1].trim() : '';
        
        // Limpiamos comillas por si el CSV las trae
        rawAmount = rawAmount.replace(/^"|"$/g, '');

        if (rawAmount.length > 0) {
            // AQUÍ ESTÁ EL CAMBIO: Agregamos '$' y 'ARS' automáticamente
            bonusElement.innerText = `$${rawAmount} ARS`;
            console.log("Bono actualizado a:", `$${rawAmount} ARS`);
        }

    } catch (error) {
        console.warn("Error obteniendo datos, usando valores por defecto.");
        setButtonLink(FALLBACK_NUMBER);
        bonusElement.innerText = FALLBACK_BONUS;
    }
}

function setButtonLink(number) {
    const finalUrl = `https://wa.me/${number}?text=${encodeURIComponent(MESSAGE)}`;
    btn.href = finalUrl;
    btnText.innerText = "RECLAMAR MI BONO";
    btn.classList.add('active'); 
}

// Ejecutar al iniciar
updateContent();