// ================================
// VISOR NËWEMPY — PARTE 1: Inicialización de Leaflet
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
        console.warn("No se encontró el contenedor del mapa (#map)");
        return;
    }

    // Crear el mapa centrado en México
    const map = L.map("map", {
        center: [22.155, -100.985],
        zoom: 13,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: true,
    });

    // Capa base satelital (Esri)
    const esriSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, etc.",
        maxZoom: 19
    }).addTo(map);

    // Capa alternativa (OpenStreetMap)
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    });

    // Control de capas
    const baseMaps = {
        "Satélite": esriSat,
        "Calles": osm
    };
    L.control.layers(baseMaps).addTo(map);

    // Estilizar contenedor
    mapContainer.style.borderRadius = "1rem";
    mapContainer.style.overflow = "hidden";
    mapContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.4)";

    // Guardar mapa como variable global
    window.NEWMAP = map;
});

// ================================
// VISOR NËWEMPY — PARTE 2: Carga de archivos KMZ y GeoJSON
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("upload-input");
    const map = window.NEWMAP; // Referencia al mapa global

    if (!input || !map) return;

    input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();
        const reader = new FileReader();

        if (ext === "geojson") {
            reader.onload = (event) => {
                const geojson = JSON.parse(event.target.result);
                const layer = L.geoJSON(geojson, {
                    style: {
                        color: "#38bdf8",
                        weight: 3,
                        fillColor: "#86efac",
                        fillOpacity: 0.5,
                    },
                }).addTo(map);
                map.fitBounds(layer.getBounds());
            };
            reader.readAsText(file);

        } else if (ext === "kmz") {
            reader.onload = async (event) => {
                const jszip = await JSZip.loadAsync(event.target.result);
                const kmlFile = Object.values(jszip.files).find(f => f.name.endsWith(".kml"));

                if (!kmlFile) return alert("El archivo KMZ no contiene un KML válido.");

                const kmlText = await kmlFile.async("text");
                const kmlDom = new DOMParser().parseFromString(kmlText, "text/xml");
                const kmlLayer = new L.KML(kmlDom);
                map.addLayer(kmlLayer);
                map.fitBounds(kmlLayer.getBounds());
            };
            reader.readAsArrayBuffer(file);

        } else {
            alert("Formato no compatible. Usa un archivo .geojson o .kmz");
        }
    });
});

// ================================
// VISOR NËWEMPY — PARTE 3: Llenar resumen informativo
// ================================

function llenarResumenTramo(geojsonLayer) {
    if (!geojsonLayer || !geojsonLayer.getLayers || geojsonLayer.getLayers().length === 0) {
        console.warn("⚠️ No se detectaron entidades en el polígono cargado.");
        return;
    }

    const layer = geojsonLayer.getLayers()[0];
    const propiedades = layer.feature?.properties || {};

    // Referencias a los elementos del DOM
    const campoTramo = document.querySelector("[data-campo='tramo']");
    const campoFase = document.querySelector("[data-campo='fase']");
    const campoDensidad = document.querySelector("[data-campo='densidad']");
    const campoVegetacion = document.querySelector("[data-campo='vegetacion']");
    const campoFecha = document.querySelector("[data-campo='fecha']");
    const campoResponsable = document.querySelector("[data-campo='responsable']");

    // Asignar valores a los campos (si existen)
    if (campoTramo) campoTramo.textContent = propiedades.Tramo || "-";
    if (campoFase) campoFase.textContent = propiedades.Fase || "-";
    if (campoDensidad) campoDensidad.textContent = propiedades.Densidad || "-";
    if (campoVegetacion) campoVegetacion.textContent = propiedades.Vegetacion || "-";
    if (campoFecha) campoFecha.textContent = propiedades.Fecha || "-";
    if (campoResponsable) campoResponsable.textContent = propiedades.Responsable || "-";

    console.log("✅ Resumen de tramo actualizado con atributos:", propiedades);
}

// Esta función debe ser llamada justo después de cargar el GeoJSON
// Ejemplo de uso en el manejador del archivo:
// llenarResumenTramo(capaCargada);

// NOTA: Asegúrate de tener data attributes en el HTML como:
// <p class="font-medium text-white" data-campo="tramo">1</p>

// ================================
// VISOR NËWEMPY — PARTE 4: Procesamiento y despliegue de archivos geoespaciales
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const inputPoligono = document.getElementById("input-poligono");

    if (!inputPoligono) {
        console.warn("No se encontró el input de carga de polígonos");
        return;
    }

    inputPoligono.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();

        if (ext === "geojson") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const geojson = JSON.parse(e.target.result);
                renderGeoJSON(geojson);
            };
            reader.readAsText(file);
        } else if (ext === "kml" || ext === "kmz") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const parser = new DOMParser();
                const kml = parser.parseFromString(text, "application/xml");
                const converted = toGeoJSON.kml(kml);
                renderGeoJSON(converted);
            };
            reader.readAsText(file);
        } else {
            alert("⚠️ Formato no compatible. Usa .geojson o .kmz");
        }
    });
});

// ================================
// FUNCIONES DE RENDERIZADO
// ================================

function renderGeoJSON(geojson) {
    if (!window.NEWMAP) return;

    const capa = L.geoJSON(geojson, {
        style: {
            color: "#4ade80",
            weight: 3,
            fillOpacity: 0.2
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`Tramo: ${feature.properties?.name || "Sin nombre"}`);
        }
    }).addTo(window.NEWMAP);

    window.NEWMAP.fitBounds(capa.getBounds());
}
// ================================
// VISOR NËWEMPY — PARTE 5.1: Lectura y renderizado de polígono cargado
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("upload-input");
    if (!input) return;

    input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();

        if (ext === "geojson") {
            handleGeoJSON(file);
        } else if (ext === "kmz") {
            handleKMZ(file);
        } else {
            alert("Formato no soportado. Usa un archivo .geojson o .kmz");
        }
    });
});

// ================================
// Función para manejar archivos GeoJSON
// ================================
function handleGeoJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            const capa = L.geoJSON(json, {
                style: {
                    color: "#22c55e",
                    weight: 2,
                    fillColor: "#bbf7d0",
                    fillOpacity: 0.5,
                },
            }).addTo(NEWMAP);

            NEWMAP.fitBounds(capa.getBounds(), { padding: [20, 20] });
        } catch (error) {
            alert("Error al procesar el archivo GeoJSON");
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// ================================
// Función para manejar archivos KMZ
// ================================
async function handleKMZ(file) {
    try {
        const zip = await JSZip.loadAsync(file);
        const kmlFile = Object.keys(zip.files).find((name) => name.endsWith(".kml"));

        if (!kmlFile) {
            alert("No se encontró ningún archivo .kml dentro del .kmz");
            return;
        }

        const kmlText = await zip.files[kmlFile].async("text");
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, "text/xml");
        const layer = new L.KML(kmlDoc);

        NEWMAP.addLayer(layer);
        NEWMAP.fitBounds(layer.getBounds(), { padding: [20, 20] });
    } catch (error) {
        alert("Error al procesar el archivo KMZ");
        console.error(error);
    }
}
// ================================
// VISOR NËWEMPY — PARTE 5.2: Mostrar resumen del tramo cargado
// ================================

function mostrarResumenTramo(geojson) {
    const resumenContainer = document.querySelector("#map").closest("main").querySelector("section:nth-of-type(3)");
    if (!resumenContainer) return;

    // Extraer propiedades (toma la primera feature como referencia)
    const feature = geojson.features?.[0];
    const props = feature?.properties || {};

    // Función auxiliar para mostrar valor o guion
    const get = (key, def = "-") => props[key] || def;

    resumenContainer.querySelector("div").innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm text-gray-300 mb-4">
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Tramo</p>
                <p class="font-medium text-white">${get("Tramo")}</p>
            </div>
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Fase</p>
                <p class="font-medium text-white">${get("Fase")}</p>
            </div>
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Densidad</p>
                <p class="font-medium text-white">${get("Densidad")}</p>
            </div>
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Vegetación</p>
                <p class="font-medium text-white">${get("Vegetacion")}</p>
            </div>
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Última bitácora</p>
                <p class="font-medium text-white">${get("Ultima")}</p>
            </div>
            <div>
                <p class="text-gray-400 uppercase text-[10px] font-bold">Responsable</p>
                <p class="font-medium text-white">${get("Responsable")}</p>
            </div>
        </div>
    `;
}

// Llamada desde el flujo principal (Parte 5.1)
// Dentro de cargarGeoJSON(geojson) → al final agregar:
// mostrarResumenTramo(geojson);

// ================================
// VISOR NËWEMPY — PARTE 6: Extracción flexible de atributos desde KML/KMZ
// ================================

function extraerMetadatosDesdeKML(layer) {
    const feature = layer.feature;
    if (!feature || !feature.properties) return null;

    const props = feature.properties;
    const resumen = {
        tramo: props.name || props.Tramo || props.tramo || "-",
        fase: props.Fase || props.fase || "Sin definir",
        densidad: props.Densidad || props.densidad || "No especificada",
        vegetacion: props.Vegetacion || props.vegetación || "Desconocida",
        ultimaBitacora: props.Fecha || props.fecha || "-",
        responsable: props.Responsable || props.responsable || "-",
    };

    return resumen;
}

function actualizarResumenTramo(data) {
    const set = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.innerText = valor || "-";
    };

    set("resumen-tramo", data.tramo);
    set("resumen-fase", data.fase);
    set("resumen-densidad", data.densidad);
    set("resumen-vegetacion", data.vegetacion);
    set("resumen-fecha", data.ultimaBitacora);
    set("resumen-responsable", data.responsable);
}

function limpiarResumenTramo() {
    actualizarResumenTramo({
        tramo: "-",
        fase: "-",
        densidad: "-",
        vegetacion: "-",
        ultimaBitacora: "-",
        responsable: "-",
    });
}

// Vinculación automática al cargar polígonos
if (window.ULTIMO_POLIGONO_KML instanceof L.GeoJSON) {
    const resumen = extraerMetadatosDesdeKML(window.ULTIMO_POLIGONO_KML);
    if (resumen) actualizarResumenTramo(resumen);
    else limpiarResumenTramo();
} else {
    limpiarResumenTramo();
}

// ================================
// VISOR NËWEMPY — PARTE 7: Guardar tramo en localStorage
// ================================

function guardarTramoEnLocal(feature, layer) {
    try {
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        const props = feature.properties || {};

        const resumen = {
            tramo: props.nombre || "Tramo sin nombre",
            fase: props.fase || "-",
            densidad: props.densidad || "-",
            vegetacion: props.vegetacion || "-",
            fecha: props.fecha || "-",
            responsable: props.responsable || "-",
            center
        };

        // Guardar como JSON en localStorage
        localStorage.setItem("ultimoTramoCargado", JSON.stringify(resumen));

        console.log("✅ Tramo guardado localmente:", resumen);
    } catch (e) {
        console.warn("⚠️ No se pudo guardar el tramo:", e);
    }
}
// ================================
// VISOR NËWEMPY — PARTE 7B: Mostrar tramo guardado si existe
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const raw = localStorage.getItem("ultimoTramoCargado");
    if (!raw) return;

    try {
        const tramo = JSON.parse(raw);
        const resumen = document.querySelectorAll(".grid > div");

        resumen[0].querySelector("p.font-medium").innerText = tramo.tramo || "-";
        resumen[1].querySelector("p.font-medium").innerText = tramo.fase || "-";
        resumen[2].querySelector("p.font-medium").innerText = tramo.densidad || "-";
        resumen[3].querySelector("p.font-medium").innerText = tramo.vegetacion || "-";
        resumen[4].querySelector("p.font-medium").innerText = tramo.fecha || "-";
        resumen[5].querySelector("p.font-medium").innerText = tramo.responsable || "-";

        console.log("📌 Tramo restaurado desde memoria local:", tramo);
    } catch (err) {
        console.error("❌ Error al restaurar tramo:", err);
    }
});
// ================================
// VISOR NËWEMPY — PARTE 8: Botón para limpiar tramo guardado
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const btnReiniciar = document.getElementById("reiniciar-tramo");
    if (!btnReiniciar) return;

    btnReiniciar.addEventListener("click", () => {
        localStorage.removeItem("ultimoTramoCargado");
        alert("El visor ha sido reiniciado. Vuelve a cargar un archivo.");
        location.reload();
    });
});