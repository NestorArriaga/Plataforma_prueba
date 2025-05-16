// =============================================
// BITÁCORAS NëWEMPY — BLOQUE 1: Lectura y validación
// =============================================

// Esperar a que el DOM esté listo
window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input-bitacora");
    if (!input) return;

    input.addEventListener("change", handleFileUpload);
});

// Función principal para leer y validar archivo
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isXLSX = fileName.endsWith(".xlsx");

    if (!isCSV && !isXLSX) {
        alert("El formato no es válido. Por favor sube un archivo .csv o .xlsx");
        return;
    }

    if (isCSV) {
        const text = await file.text();
        const parsed = parseCSV(text);
        validarEstructura(parsed);
    } else {
        const data = await readXLSX(file);
        validarEstructura(data);
    }
}

// =============================================
// Función: leer archivos .xlsx con SheetJS (XLSX.js)
// =============================================
async function readXLSX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            resolve(json);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// =============================================
// Función: parsear CSV simple
// =============================================
function parseCSV(text) {
    const [headerLine, ...lines] = text.split("\n");
    const headers = headerLine.split(",").map(h => h.trim());
    return lines.map(line => {
        const values = line.split(",").map(v => v.trim());
        const entry = {};
        headers.forEach((key, i) => entry[key] = values[i] || "");
        return entry;
    });
}

// =============================================
// Función: Validar que el archivo tenga estructura correcta
// =============================================
function validarEstructura(data) {
    const camposEsperados = ["Tramo", "Responsable", "Fecha", "Fase", "Observaciones"];
    const errores = [];

    if (!data || !Array.isArray(data) || data.length === 0) {
        alert("El archivo está vacío o no se pudo leer.");
        return;
    }

    const columnasArchivo = Object.keys(data[0]);
    camposEsperados.forEach(campo => {
        if (!columnasArchivo.includes(campo)) {
            errores.push(`Falta la columna obligatoria: ${campo}`);
        }
    });

    if (errores.length > 0) {
        alert("Error en la estructura del archivo:\n" + errores.join("\n"));
        return;
    }

    // Si todo está bien, avanzar al siguiente bloque
    mostrarBitacoras(data);
    mostrarTablaBitacoras(data);
    poblarFiltros(data);
    inicializarFiltros(data); // <-- esta línea nueva
}

// ================================
// BITÁCORAS NëWEMPY — PARTE 2: Lectura de archivos CSV/XLSX
// ================================

async function procesarExcel(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    mostrarResultados(json);
}

async function procesarCSV(file) {
    const text = await file.text();
    const rows = text.split("\n").map(row => row.split(","));

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = row[i] ? row[i].trim() : "";
        });
        return obj;
    });

    mostrarResultados(data);
}
// =============================================
// BITÁCORAS NëWEMPY — BLOQUE 3: Mostrar resultados visuales
// =============================================

function mostrarResultadosCarga(data) {
    const seccionResultados = document.getElementById("bloque-resultados");
    if (!seccionResultados) return;

    seccionResultados.classList.remove("hidden");

    // Mostrar tarjetas
    mostrarBitacoras(data);

    // Mostrar tabla
    mostrarTablaBitacoras(data);

    // Llenar filtros dinámicamente
    poblarFiltros(data);
}
    // Mostrar la sección si estaba oculta
    seccionResultados.classList.remove("hidden");

    // Simular progreso con 215 registros actualizados y 3 errores ficticios
    const progreso = seccionResultados.querySelector("div[style]");
    if (progreso) progreso.style.width = "92%";

    // Renderizar errores (ejemplo estático, luego será dinámico)
    const tablaErrores = seccionResultados.querySelector("tbody");
    if (tablaErrores) {
        tablaErrores.innerHTML = ""; // Limpiar

        const erroresSimulados = [
            { fila: 3, mensaje: "Formato de fecha inválido" },
            { fila: 18, mensaje: "Usuario no encontrado" },
            { fila: 24, mensaje: "Dato requerido ausente" }
        ];

        erroresSimulados.forEach(error => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td class="px-4 py-3 font-mono text-gray-800">${error.fila}</td>
                <td class="px-4 py-3">${error.mensaje}</td>
                <td class="px-4 py-3 text-center text-red-500 font-bold">✕</td>
            `;
            tablaErrores.appendChild(fila);
        });
}
// =============================================
// BITÁCORAS NëWEMPY — BLOQUE 4: Generar tarjetas
// =============================================

function mostrarBitacoras(data) {
    const contenedor = document.querySelector("#bloque-bitacoras .grid");
    if (!contenedor) return;

    // Limpiar tarjetas anteriores
    contenedor.innerHTML = "";

    // Generar una tarjeta por cada entrada
    data.forEach((bitacora, index) => {
        const card = document.createElement("div");
        card.className = "bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3 transition hover:shadow-md";

        card.innerHTML = `
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="font-medium text-gray-900">Tramo ${bitacora.Tramo || index + 1}</span>
                <span class="text-green-600 font-semibold">✔ Activa</span>
            </div>

            <div class="text-sm space-y-1">
                <p><span class="font-semibold text-gray-700">Responsable:</span> ${bitacora.Responsable || "—"}</p>
                <p><span class="font-semibold text-gray-700">Fecha:</span> ${bitacora.Fecha || "—"}</p>
                <p><span class="font-semibold text-gray-700">Fase:</span> ${bitacora.Fase || "—"}</p>
                <p><span class="font-semibold text-gray-700">Observaciones:</span> ${bitacora.Observaciones || "—"}</p>
            </div>

            <div class="flex items-center justify-end">
                <button class="btn-detalle text-sm text-blue-600 hover:underline" data-index="${index}">
                    Ver detalles
                </button>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // Mostrar la sección si está oculta
    const bloque = document.getElementById("bloque-bitacoras");
    if (bloque) bloque.classList.remove("hidden");
}
// =============================================
// BLOQUE 5 — Ver detalle de una bitácora
// =============================================

function mostrarDetalleBitacora(bitacora) {
    const bloqueDetalle = document.getElementById("bloque-detalle-bitacora");
    if (!bloqueDetalle) return;

    // Llenar campos del detalle
    bloqueDetalle.querySelector("h2").textContent = `Bitácora: Tramo ${bitacora.Tramo}`;
    bloqueDetalle.querySelectorAll("p.font-medium")[0].textContent = bitacora.Tramo || "-";
    bloqueDetalle.querySelectorAll("p.font-medium")[1].textContent = bitacora.Fase || "-";
    bloqueDetalle.querySelectorAll("p.font-medium")[2].textContent = bitacora.Densidad || "-";
    bloqueDetalle.querySelectorAll("p.font-medium")[3].textContent = bitacora.Responsable || "-";
    bloqueDetalle.querySelectorAll("p.font-medium")[4].textContent = bitacora.Observaciones || "-";

    // Mostrar el bloque
    bloqueDetalle.classList.remove("hidden");

    // Evento para cerrar
    const botonCerrar = document.getElementById("cerrar-bitacora");
    if (botonCerrar) {
        botonCerrar.onclick = () => {
            bloqueDetalle.classList.add("hidden");
        };
    }
}
