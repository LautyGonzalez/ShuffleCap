(async function () {
    'use strict';

    const JSON_PATH = chrome.runtime.getURL("series_disney_normalized.json");
    let episodiosPorSerie = {};

    async function cargarEpisodios() {
        try {
            const res = await fetch(JSON_PATH);
            episodiosPorSerie = await res.json();
            console.log("📁 JSON cargado con series:", Object.keys(episodiosPorSerie));
        } catch (err) {
            console.error("❌ Error al cargar JSON:", err);
        }
    }

    function detectarSerieActual() {
        const span = document.querySelector(".title-btn .title-field span");
        const nombreDetectado = span?.textContent?.trim();
        if (!nombreDetectado) return null;

        for (const nombreSerie of Object.keys(episodiosPorSerie)) {
            if (nombreSerie.toLowerCase() === nombreDetectado.toLowerCase()) {
                return nombreSerie;
            }
        }
        return null;
    }

    function insertarBoton(nombreSerie) {
        const existente = document.getElementById("btn-random-fg");
        if (!nombreSerie) {
            if (existente) existente.remove();
            console.log("❌ No es una serie conocida, botón eliminado.");
            return;
        }

        const contenedorDerecho = document.querySelector('.controls__footer__wrapper .controls__right');
        if (!contenedorDerecho || existente) return;

        contenedorDerecho.style.position = "relative";

        const btn = document.createElement("button");
        btn.id = "btn-random-fg";
        btn.title = `Ver episodio aleatorio de ${nombreSerie}`;
        btn.innerText = "🎲";

        Object.assign(btn.style, {
            marginLeft: "10px",
            padding: "6px 12px",
            backgroundColor: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: "0.2",
            transition: "opacity 0.3s ease",
            zIndex: "999999",
            pointerEvents: "auto"
        });

        btn.addEventListener("mouseenter", () => btn.style.opacity = "1");
        btn.addEventListener("mouseleave", () => btn.style.opacity = "0.2");

        btn.onclick = () => {
            const lista = episodiosPorSerie[nombreSerie];
            if (lista?.length > 0) {
                const id = lista[Math.floor(Math.random() * lista.length)];
                window.location.href = `https://www.disneyplus.com/en-gb/play/${id}`;
            }
        };

        contenedorDerecho.appendChild(btn);
        console.log(`✅ Botón Random insertado para ${nombreSerie}`);
    }

    await cargarEpisodios();

    const observer = new MutationObserver(() => {
        const serie = detectarSerieActual();
        insertarBoton(serie);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("load", () => {
        setTimeout(() => {
            const serie = detectarSerieActual();
            insertarBoton(serie);
        }, 3000);
    });
})();
