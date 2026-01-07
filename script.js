// --- CONFIGURACIÓN ---

// 1. PEGA AQUÍ EL ENLACE .CSV DE GOOGLE SHEETS
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9bsTOs6nCbKAd0ROAK_8DXhqYFvr_lbG4HGDj-C7A_yhXc0qntOgVqSX4HuoIjkrytENkee-2Iec7/pub?gid=0&single=true&output=csv'; 

// 2. NÚMERO DE RESPALDO (Por si falla todo)
const FALLBACK_NUMBER = '5491100000000'; 

// 3. MENSAJE PREDETERMINADO
const MESSAGE = "Hola, quiero reclamar mi bono de bienvenida.";

// --- LÓGICA DEL PROGRAMA ---
const btn = document.getElementById('cta-button');
const btnText = document.getElementById('btn-text');

async function updatePhoneNumber() {
    try {
        console.log("Consultando número...");
        
        // Agregamos un timestamp para evitar que el navegador guarde caché vieja
        const uniqueUrl = `${SHEET_URL}&t=${new Date().getTime()}`;
        
        const response = await fetch(uniqueUrl);
        
        if (!response.ok) throw new Error("Error de red al conectar con Google Sheets");

        const data = await response.text();
        
        // Tomamos el contenido de la primera celda (A1)
        let rawContent = data.split('\n')[0];

        // --- MAGIA DE LIMPIEZA ---
        // Esta línea elimina TODO lo que no sea un número (letras, espacios, +, -, ())
        let cleanNumber = rawContent.replace(/\D/g, ''); 
        
        console.log("Número crudo:", rawContent);
        console.log("Número limpio:", cleanNumber);

        // Validación: Si después de limpiar quedan menos de 8 números, algo está mal
        if (!cleanNumber || cleanNumber.length < 8) {
            throw new Error("El número en el Excel no es válido");
        }

        setButtonLink(cleanNumber);

    } catch (error) {
        console.warn("Hubo un problema, usando número de respaldo:", error);
        setButtonLink(FALLBACK_NUMBER);
    }
}

function setButtonLink(number) {
    // Construir enlace de WhatsApp
    const finalUrl = `https://wa.me/${number}?text=${encodeURIComponent(MESSAGE)}`;
    
    // Actualizar botón en el DOM
    btn.href = finalUrl;
    btnText.innerText = "RECLAMAR MI BONO";
    
    // Habilitar el botón visualmente
    btn.classList.add('active'); 
}

// Ejecutar la función apenas cargue el script
updatePhoneNumber();