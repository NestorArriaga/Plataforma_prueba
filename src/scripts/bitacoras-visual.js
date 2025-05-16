// ================================
// BITÁCORAS NëWEMPY — PARTE 1: Mostrar tarjetas de bitácoras
// ================================

function mostrarBitacoras(data) {
    const contenedor = document.querySelector("#bloque-bitacoras .grid");
    if (!contenedor || !Array.isArray(data)) return;

    contenedor.innerHTML = ""; // Limpiar antes de renderizar nuevas

    data.forEach((bitacora, index) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3 transition hover:shadow-md";

        tarjeta.innerHTML = `
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="font-medium text-gray-900">Tramo ${bitacora.Tramo}</span>
                <span class="text-green-600 font-semibold">✔ Activa</span>
            </div>

            <div class="text-sm space-y-1">
                <p><span class="font-semibold text-gray-700">Responsable:</span> ${bitacora.Responsable}</p>
                <p><span class="font-semibold text-gray-700">Fecha:</span> ${bitacora.Fecha}</p>
                <p><span class="font-semibold text-gray-700">Fase:</span> ${bitacora.Fase}</p>
                <p><span class="font-semibold text-gray-700">Observaciones:</span> ${bitacora.Observaciones}</p>
            </div>

            <div class="flex items-center justify-end">
                <a href="#" 
                   class="text-sm text-blue-600 hover:underline"
                   onclick='mostrarDetalleBitacora(${JSON.stringify(bitacora)})'>
                   Ver detalles
                </a>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    // Mostrar sección si estaba oculta
    document.getElementById("bloque-bitacoras").classList.remove("hidden");
}
// ================================
// BITÁCORAS NëWEMPY — PARTE 2: Mostrar detalle individual
// ================================

function mostrarDetalleBitacora(bitacora) {
    const bloque = document.getElementById("bloque-detalle-bitacora");
    if (!bloque) return;

    // Insertar los valores en el DOM
    bloque.querySelector("h2").textContent = `Bitácora: Tramo ${bitacora.Tramo || "-"}`;
    bloque.querySelector("p.text-sm.text-gray-500").textContent = `Detalles completos de la bitácora registrada.`;

    const campos = {
        Tramo: bitacora.Tramo,
        Fase: bitacora.Fase,
        Densidad: bitacora.Densidad || "—",
        Responsable: bitacora.Responsable,
        Observaciones: bitacora.Observaciones || "—"
    };

    const items = bloque.querySelectorAll(".grid > div");
    items.forEach(div => {
        const label = div.querySelector("p.text-gray-500");
        const valor = div.querySelector("p.font-medium");
        if (label && valor && campos[label.textContent.trim()]) {
            valor.textContent = campos[label.textContent.trim()];
        }
    });

    // Mostrar sección
    bloque.classList.remove("hidden");

    // Scroll a vista
    bloque.scrollIntoView({ behavior: "smooth" });

    // Botón cerrar
    const btnCerrar = document.getElementById("cerrar-bitacora");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            bloque.classList.add("hidden");
        });
    }
}
// ================================
// BITÁCORAS NëWEMPY — PARTE 3: Mostrar tabla de bitácoras
// ================================

function mostrarTablaBitacoras(data) {
    const tbody = document.getElementById("tabla-bitacoras");
    if (!tbody) return;

    // Limpiar contenido previo
    tbody.innerHTML = "";

    // Iterar sobre las bitácoras
    data.forEach((bitacora, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td class="px-4 py-3 font-medium">${bitacora.Tramo || "-"}</td>
            <td class="px-4 py-3">${bitacora.Responsable || "-"}</td>
            <td class="px-4 py-3">${bitacora.Fecha || "-"}</td>
            <td class="px-4 py-3">${bitacora.Fase || "-"}</td>
            <td class="px-4 py-3">${bitacora.Observaciones || "-"}</td>
            <td class="px-4 py-3 text-center">
                <a href="#" class="text-blue-600 text-sm hover:underline" onclick='mostrarDetalleBitacora(${JSON.stringify(bitacora)})'>Ver detalle</a>
            </td>
        `;

        tbody.appendChild(fila);
    });
}
// ================================
// BITÁCORAS NëWEMPY — PARTE 4: Filtros y búsqueda
// ================================

window.addEventListener("DOMContentLoaded", () => {
    const inputBusqueda = document.getElementById("filtro-busqueda");
    const selectResponsable = document.getElementById("filtro-responsable");
    const selectFase = document.getElementById("filtro-fase");

    if (!inputBusqueda || !selectResponsable || !selectFase) return;

    // Eventos
    inputBusqueda.addEventListener("input", aplicarFiltros);
    selectResponsable.addEventListener("change", aplicarFiltros);
    selectFase.addEventListener("change", aplicarFiltros);
});

function aplicarFiltros() {
    const texto = document.getElementById("filtro-busqueda").value.toLowerCase();
    const responsable = document.getElementById("filtro-responsable").value;
    const fase = document.getElementById("filtro-fase").value;

    const filtradas = BITACORAS_CARGADAS.filter((b) => {
        const coincideResponsable = !responsable || b.Responsable === responsable;
        const coincideFase = !fase || b.Fase === fase;

        const textoLibre = (
            (b.Tramo || "").toLowerCase().includes(texto) ||
            (b.Fecha || "").toLowerCase().includes(texto) ||
            (b.Observaciones || "").toLowerCase().includes(texto)
        );

        return coincideResponsable && coincideFase && textoLibre;
    });

    mostrarTablaBitacoras(filtradas);
}
// ================================
// BITÁCORAS NëWEMPY — PARTE 5: Poblado dinámico de filtros
// ================================

function poblarFiltros(data) {
    const selectResponsable = document.getElementById("filtro-responsable");
    const selectFase = document.getElementById("filtro-fase");

    if (!selectResponsable || !selectFase) return;

    // Limpiar valores anteriores (dejando el "Todos")
    selectResponsable.innerHTML = '<option value="">Todos</option>';
    selectFase.innerHTML = '<option value="">Todas</option>';

    // Extraer valores únicos
    const responsables = [...new Set(data.map(b => b.Responsable).filter(Boolean))];
    const fases = [...new Set(data.map(b => b.Fase).filter(Boolean))];

    // Insertar opciones
    responsables.forEach(nombre => {
        const opt = document.createElement("option");
        opt.value = nombre;
        opt.textContent = nombre;
        selectResponsable.appendChild(opt);
    });

    fases.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        selectFase.appendChild(opt);
    });
}
// =============================================
// FILTRADO DINÁMICO DE LA TABLA DE BITÁCORAS
// =============================================
function inicializarFiltros(dataOriginal) {
    const inputBusqueda = document.getElementById("filtro-busqueda");
    const selectResponsable = document.getElementById("filtro-responsable");
    const selectFase = document.getElementById("filtro-fase");

    const aplicarFiltros = () => {
        const texto = inputBusqueda.value.toLowerCase();
        const responsable = selectResponsable.value;
        const fase = selectFase.value;

        const filtradas = dataOriginal.filter(b => {
            const coincideTexto =
                b["Tramo"].toString().toLowerCase().includes(texto) ||
                b["Fecha"].toLowerCase().includes(texto) ||
                b["Observaciones"].toLowerCase().includes(texto);

            const coincideResponsable =
                !responsable || b["Responsable"] === responsable;

            const coincideFase =
                !fase || b["Fase"] === fase;

            return coincideTexto && coincideResponsable && coincideFase;
        });

        mostrarTablaBitacoras(filtradas);
    };

    inputBusqueda.addEventListener("input", aplicarFiltros);
    selectResponsable.addEventListener("change", aplicarFiltros);
    selectFase.addEventListener("change", aplicarFiltros);
}
// =============================================
// VER DETALLE DE UNA BITÁCORA INDIVIDUAL
// =============================================
function mostrarDetalleBitacora(bitacora) {
    const seccionDetalle = document.getElementById("bloque-detalle-bitacora");
    if (!seccionDetalle) return;

    seccionDetalle.querySelector("h2").textContent = `Bitácora: Tramo ${bitacora["Tramo"]}`;
    seccionDetalle.querySelector('[title="Cerrar detalle"]').onclick = () => {
        seccionDetalle.classList.add("hidden");
    };

    const campos = {
        tramo: bitacora["Tramo"],
        fase: bitacora["Fase"],
        densidad: bitacora["Densidad"] || "—",
        responsable: bitacora["Responsable"],
        observaciones: bitacora["Observaciones"],
    };

    const detalles = seccionDetalle.querySelectorAll("div.grid p.font-medium");
    detalles[0].textContent = campos.tramo;
    detalles[1].textContent = campos.fase;
    detalles[2].textContent = campos.densidad;
    detalles[3].textContent = campos.responsable;
    detalles[4].textContent = campos.observaciones;

    seccionDetalle.scrollIntoView({ behavior: "smooth" });
    seccionDetalle.classList.remove("hidden");
}
// ==============================
// BITÁCORAS NëWEMPY — Filtros dinámicos
// ==============================

let datosBitacorasOriginales = [];

// Esta función se llama justo después de mostrar las tarjetas
function inicializarFiltros(data) {
    datosBitacorasOriginales = data;

    poblarOpcionesFiltro(data, "filtro-responsable", "Responsable");
    poblarOpcionesFiltro(data, "filtro-fase", "Fase");

    document.getElementById("filtro-responsable").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-fase").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-busqueda").addEventListener("input", aplicarFiltros);

    aplicarFiltros(); // mostrar todo al inicio
}

// Agrega opciones únicas al select
function poblarOpcionesFiltro(data, idSelect, campo) {
    const select = document.getElementById(idSelect);
    const valoresUnicos = [...new Set(data.map(d => d[campo]).filter(Boolean))];
    select.innerHTML = `<option value="">Todos</option>`;
    valoresUnicos.forEach(valor => {
        const opt = document.createElement("option");
        opt.value = valor;
        opt.textContent = valor;
        select.appendChild(opt);
    });
}

// Aplica todos los filtros
function aplicarFiltros() {
    const responsable = document.getElementById("filtro-responsable").value.toLowerCase();
    const fase = document.getElementById("filtro-fase").value.toLowerCase();
    const busqueda = document.getElementById("filtro-busqueda").value.toLowerCase();

    const filtrados = datosBitacorasOriginales.filter(b => {
        const coincideResponsable = !responsable || (b.Responsable || "").toLowerCase().includes(responsable);
        const coincideFase = !fase || (b.Fase || "").toLowerCase().includes(fase);
        const coincideBusqueda =
            (b.Tramo || "").toString().toLowerCase().includes(busqueda) ||
            (b.Fecha || "").toLowerCase().includes(busqueda) ||
            (b.Observaciones || "").toLowerCase().includes(busqueda);

        return coincideResponsable && coincideFase && coincideBusqueda;
    });

    mostrarTablaBitacorasFiltrada(filtrados);
}

// Renderiza la tabla filtrada
function mostrarTablaBitacorasFiltrada(lista) {
    const tbody = document.getElementById("tabla-bitacoras");
    tbody.innerHTML = "";

    lista.forEach(b => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="px-4 py-3 font-medium">${b.Tramo}</td>
            <td class="px-4 py-3">${b.Responsable}</td>
            <td class="px-4 py-3">${b.Fecha}</td>
            <td class="px-4 py-3">${b.Fase}</td>
            <td class="px-4 py-3">${b.Observaciones}</td>
            <td class="px-4 py-3 text-center">
                <a href="#" class="text-blue-600 text-sm hover:underline" onclick='mostrarDetalleBitacora(${JSON.stringify(
            b
        )})'>Ver detalle</a>
            </td>
        `;
        tbody.appendChild(fila);
    });
}