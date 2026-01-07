# 🎰 Bridge Page iGaming - Dinámica con Google Sheets

![Estado](https://img.shields.io/badge/Estado-Producción-success)
![Tecnología](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-blue)

Landing page tipo "Bridge Page" optimizada para campañas de **Meta Ads (Facebook/Instagram)** en el nicho de iGaming/Casinos. 

Diseñada para **maximizar la conversión** y **minimizar bloqueos**, actuando como intermediario seguro entre el anuncio y el contacto de ventas (WhatsApp).

## 🚀 Características Principales

* **📱 Mobile First:** Diseño 100% responsivo pensado para tráfico móvil.
* **🔄 WhatsApp Dinámico (CMS sin base de datos):** El número de destino se controla desde un **Google Sheet**. Permite cambiar de vendedor o chip sin tocar el código ni redesplegar.
* **🛡️ Meta Compliance:** Incluye disclaimers legales, enlaces a políticas y estructura "safe" para evitar baneos de cuentas publicitarias.
* **🎨 UI de Alta Conversión:** Efectos de Glassmorphism, animaciones de pulso en CTA y "Trust Signals" (logos de pago).
* **⚡ Performance:** HTML/CSS/JS puro sin librerías pesadas. Carga instantánea.

## ⚙️ Configuración del Número (Google Sheets)

Este proyecto lee el número de teléfono desde una hoja de cálculo pública para evitar editar el HTML constantemente.

1.  Crea un nuevo **Google Sheet**.
2.  En la celda **A1**, escribe el número de teléfono (Ej: `5491133334444`).
    * *Nota: El sistema limpia automáticamente espacios y símbolos, pero se recomienda usar solo números.*
3.  Ve a **Archivo > Compartir > Publicar en la web**.
4.  En "Vincular", selecciona la hoja correcta y en formato elige **Valores separados por comas (.csv)**.
5.  Copia el enlace generado.
6.  Pega el enlace en el archivo `script.js`:
    ```javascript
    const SHEET_URL = 'TU_ENLACE_DE_GOOGLE_SHEETS_AQUI';
    ```

## 🛠️ Instalación y Despliegue

### Local
1.  Clonar el repositorio:
    ```bash
    git clone [https://github.com/SantiagoC1/bplay-landing-contact.git]
    ```
2.  Abrir `index.html` en tu navegador.

### Despliegue Recomendado (Netlify)
Este proyecto es estático, por lo que se recomienda desplegar en **Netlify** conectado a este repositorio.

1.  Conectar repositorio a Netlify.
2.  Configuración de Build: (Dejar vacío).
3.  Directorio de publicación: `/` (Raíz).

## 📂 Estructura del Proyecto

```text
├── index.html      # Estructura semántica y contenido
├── styles.css      # Estilos, animaciones y responsive design
├── script.js       # Lógica de conexión con API de Google Sheets
└── README.md       # Documentación