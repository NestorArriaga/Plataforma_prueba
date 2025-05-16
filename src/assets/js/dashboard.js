// ===============================
// DASHBOARD NËWEMPY — PARTE 1
// ===============================

// Detecta evento al cargar archivo
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("upload-input");

  if (!input) {
    console.warn("⚠️ No se encontró el input de carga.");
    return;
  }

  input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      handleCSV(file);
    } else if (ext === "xlsx" || ext === "xls") {
      handleXLSX(file);
    } else {
      alert("Formato no soportado. Usa un archivo .csv o .xlsx");
    }
  });
});

// ===============================
// FUNCIONES DE PROCESAMIENTO
// ===============================

function handleCSV(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const data = XLSX.read(text, { type: "string" });
    const sheet = data.SheetNames[0];
    const json = XLSX.utils.sheet_to_json(data.Sheets[sheet]);
    guardarDatos(json);
  };
  reader.readAsText(file);
}

function handleXLSX(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.SheetNames[0];
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: "" });
    guardarDatos(json);
  };
  reader.readAsArrayBuffer(file);
}

// ===============================
// GUARDAR Y CONFIRMAR
// ===============================

function guardarDatos(json) {
  // Limpieza mínima: eliminar filas sin tramo
  const clean = json.filter(row => row["Tramo"] && row["Tramo"] !== "-");

  localStorage.setItem("dashboardData", JSON.stringify(clean));

  console.log("✅ Datos cargados y guardados:", clean);
  alert("✅ Datos cargados correctamente. Puedes verlos reflejados en el dashboard.");
}
// ===============================
// DASHBOARD NËWEMPY — PARTE 2
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("dashboardData");
  if (!stored) return;

  const data = JSON.parse(stored);

  // ==== CALCULOS ====

  const totalJornales = data.reduce((acc, row) => acc + parseFloat(row["No_Jornal"] || 0), 0);
  const tramosUnicos = new Set(data.map(row => row["Tramo"])).size;
  const fechasUnicas = new Set(data.map(row => row["Fecha"])).size;
  const actividadesUnicas = new Set(data.map(row => row["Actividad"])).size;

  // ==== LLENADO DE TARJETAS ====
  document.getElementById("valor-jornales").innerText = totalJornales;
  document.getElementById("valor-tramos").innerText = tramosUnicos;
  document.getElementById("valor-bitacoras").innerText = fechasUnicas;
  document.getElementById("valor-actividades").innerText = actividadesUnicas;

  // ==== LLENADO DE TEXTO CONTEXTUAL ====

  const primeraFila = data[0];

  if (primeraFila) {
    if (document.getElementById("texto-fecha")) {
      document.getElementById("texto-fecha").innerText = primeraFila["Fecha"] || "-";
    }
    if (document.getElementById("texto-tramo")) {
      document.getElementById("texto-tramo").innerText = `Tramo ${primeraFila["Tramo"] || "-"}`;
    }
    if (document.getElementById("texto-ejido")) {
      document.getElementById("texto-ejido").innerText = primeraFila["Ejido"] || "-";
    }
    if (document.getElementById("texto-responsable")) {
      document.getElementById("texto-responsable").innerText = primeraFila["Responsable"] || "-";
    }
  }
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 3
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("dashboardData");
  if (!raw) return;

  const data = JSON.parse(raw);

  // Agrupar avance por tramo
  const avancePorTramo = {};

  data.forEach(row => {
    const tramo = row["Tramo"];
    const avance = parseFloat(row["Avance_metros"]) || 0;

    if (!tramo) return;

    if (!avancePorTramo[tramo]) {
      avancePorTramo[tramo] = 0;
    }

    avancePorTramo[tramo] += avance;
  });

  const categorias = Object.keys(avancePorTramo);
  const valores = Object.values(avancePorTramo);

  // Construcción de gráfica
  const chart = new ApexCharts(document.querySelector("#chart-avance-tramos"), {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
      fontFamily: "Montserrat, Inter, sans-serif",
    },
    series: [{
      name: "Avance (m)",
      data: valores
    }],
    xaxis: {
      categories: categorias,
      title: { text: "Tramo" },
      labels: { style: { fontSize: "12px", colors: "#374151" } }
    },
    yaxis: {
      title: { text: "Metros" },
      labels: { style: { fontSize: "12px", colors: "#374151" } }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "50%",
        distributed: true
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: "12px", colors: ["#1A4D2E"] }
    },
    colors: ["#1A4D2E", "#4ade80", "#86efac", "#bbf7d0"],
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "light",
      y: { formatter: val => `${val} m` }
    }
  });

  chart.render();
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 4
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("dashboardData");
  if (!raw) return;

  const data = JSON.parse(raw);

  // Agrupar por Actividad
  const conteoActividades = {};

  data.forEach(row => {
    const act = row["Actividad"];
    if (!act || act === "-") return;
    conteoActividades[act] = (conteoActividades[act] || 0) + 1;
  });

  const labels = Object.keys(conteoActividades);
  const valores = Object.values(conteoActividades);

  if (labels.length === 0) return; // Prevención

  const chart = new ApexCharts(document.querySelector("#chart-actividades"), {
    chart: {
      type: "donut",
      height: 360,
      fontFamily: "Montserrat, Inter, sans-serif",
    },
    labels: labels,
    series: valores,
    colors: [
      "#1A4D2E", "#4ade80", "#86efac", "#A3E635", "#FACC15", "#FDBA74", "#5D87FF"
    ],
    legend: {
      position: "bottom",
      fontSize: "14px",
      labels: {
        colors: "#374151"
      }
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: function (val) {
          return `${val} actividad(es)`;
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              fontSize: "18px",
              fontWeight: 600,
              color: "#1A4D2E",
              label: "Total",
              formatter: () => valores.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "13px",
        colors: ["#1A4D2E"]
      }
    },
    stroke: {
      width: 1,
      colors: ['#ffffff']
    }
  });

  chart.render();
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 5
// ===============================

// Mostrar mensaje si no hay datos
document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("dashboardData") || "[]");

  if (data.length === 0) {
    const aviso = document.createElement("div");
    aviso.className = "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 text-sm font-medium";
    aviso.innerHTML = `
      <p>No se han cargado datos aún. Por favor, sube un archivo de campo (.csv o .xlsx).</p>
    `;

    const contenedor = document.querySelector("main");
    if (contenedor) {
      contenedor.insertBefore(aviso, contenedor.children[2]); // Justo después del saludo
    }
  }
});

// Crear botón de limpieza (opcional)
document.addEventListener("DOMContentLoaded", () => {
  const limpiarBtn = document.createElement("button");
  limpiarBtn.innerText = "🗑 Reiniciar Dashboard";
  limpiarBtn.className = "mt-4 px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 text-sm transition";
  limpiarBtn.onclick = () => {
    localStorage.removeItem("dashboardData");
    alert("Datos eliminados. Recarga la página y sube un nuevo archivo.");
    location.reload();
  };

  const seccionCarga = document.getElementById("upload-input")?.parentElement;
  if (seccionCarga) {
    seccionCarga.appendChild(limpiarBtn);
  }
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 6
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("dashboardData");
  if (!raw) return;

  const data = JSON.parse(raw);
  const timeline = document.querySelector("ul");

  if (!timeline || !Array.isArray(data)) return;

  // Limpiar elementos estáticos previos
  timeline.innerHTML = "";

  // Ordenar por fecha (si hay)
  const ordenado = data
      .filter(row => row["Fecha"] && row["Tramo"])
      .sort((a, b) => new Date(b["Fecha"]) - new Date(a["Fecha"]))
      .slice(0, 8); // Solo mostrar los últimos 8 movimientos

  if (ordenado.length === 0) {
    timeline.innerHTML = `
      <li class="text-sm text-gray-500 italic">
        No hay registros recientes en el archivo cargado.
      </li>
    `;
    return;
  }

  // Generar cada entrada
  ordenado.forEach(row => {
    const fecha = row["Fecha"] || "-";
    const tramo = row["Tramo"] || "-";
    const actividad = row["Actividad"] || "-";
    const responsable = row["Responsable"] || "Responsable no definido";

    const li = document.createElement("li");
    li.className = "flex items-start gap-4";

    li.innerHTML = `
      <div class="mt-1 text-green-brand">
        <i class="ti ti-check text-base"></i>
      </div>
      <div>
        <p class="text-sm text-gray-700">
          <span class="font-semibold text-gray-brand">${responsable}</span> ejecutó 
          <span class="text-green-brand font-semibold">${actividad}</span> en el tramo 
          <span class="font-semibold">#${tramo}</span>.
        </p>
        <span class="text-xs text-gray-500">${fecha}</span>
      </div>
    `;

    timeline.appendChild(li);
  });
});
// ===============================
// FILTROS — LÍNEA DE TIEMPO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("dashboardData");
  if (!raw) return;

  const data = JSON.parse(raw);
  const timeline = document.querySelector("ul");

  const tramoSelect = document.getElementById("filtro-tramo");
  const actividadSelect = document.getElementById("filtro-actividad");
  const responsableSelect = document.getElementById("filtro-responsable");

  if (!timeline || !tramoSelect || !actividadSelect || !responsableSelect) return;

  // Rellenar selectores
  const tramos = [...new Set(data.map(d => d["Tramo"]).filter(Boolean))];
  const actividades = [...new Set(data.map(d => d["Actividad"]).filter(Boolean))];
  const responsables = [...new Set(data.map(d => d["Responsable"]).filter(Boolean))];

  tramos.forEach(val => {
    tramoSelect.innerHTML += `<option value="${val}">${val}</option>`;
  });
  actividades.forEach(val => {
    actividadSelect.innerHTML += `<option value="${val}">${val}</option>`;
  });
  responsables.forEach(val => {
    responsableSelect.innerHTML += `<option value="${val}">${val}</option>`;
  });

  // Función para renderizar línea de tiempo filtrada
  function renderLineaTiempo() {
    const tramo = tramoSelect.value;
    const actividad = actividadSelect.value;
    const responsable = responsableSelect.value;

    const filtrados = data.filter(row => {
      const cumpleTramo = tramo === "" || row["Tramo"] == tramo;
      const cumpleAct = actividad === "" || row["Actividad"] == actividad;
      const cumpleResp = responsable === "" || row["Responsable"] == responsable;
      return cumpleTramo && cumpleAct && cumpleResp;
    });

    const ordenados = filtrados
        .filter(row => row["Fecha"])
        .sort((a, b) => new Date(b["Fecha"]) - new Date(a["Fecha"]))
        .slice(0, 8);

    timeline.innerHTML = "";

    if (ordenados.length === 0) {
      timeline.innerHTML = `
        <li class="text-sm text-gray-500 italic">
          No hay registros para este filtro.
        </li>
      `;
      return;
    }

    ordenados.forEach(row => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-4";

      li.innerHTML = `
        <div class="mt-1 text-green-brand">
          <i class="ti ti-check text-base"></i>
        </div>
        <div>
          <p class="text-sm text-gray-700">
            <span class="font-semibold text-gray-brand">${row["Responsable"]}</span> ejecutó 
            <span class="text-green-brand font-semibold">${row["Actividad"]}</span> en el tramo 
            <span class="font-semibold">#${row["Tramo"]}</span>.
          </p>
          <span class="text-xs text-gray-500">${row["Fecha"]}</span>
        </div>
      `;
      timeline.appendChild(li);
    });
  }

  // Escuchar cambios en filtros
  [tramoSelect, actividadSelect, responsableSelect].forEach(select => {
    select.addEventListener("change", renderLineaTiempo);
  });

  renderLineaTiempo(); // Mostrar por default
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 7
// ===============================

// Simulación de sesión activa con localStorage
// ⚠️ Esto será reemplazado luego por Supabase u otro sistema
document.addEventListener("DOMContentLoaded", () => {
  const sesionActiva = localStorage.getItem("usuarioAutenticado");

  const loginSidebarItem = document.querySelector('a[href*="authentication-login"]');
  const userPlaceholder = document.getElementById("user-area-placeholder");

  if (sesionActiva && sesionActiva !== "false") {
    // Ocultar login si hay sesión
    if (loginSidebarItem) loginSidebarItem.style.display = "none";

    // Reemplazar placeholder de usuario
    if (userPlaceholder) {
      userPlaceholder.innerHTML = `
        <i class="ti ti-user-circle text-2xl text-green-brand"></i>
        <span class="font-semibold">Procoro Díaz</span>
      `;
    }
  } else {
    // Si no hay sesión, mostrar texto predeterminado
    if (userPlaceholder) {
      userPlaceholder.innerHTML = `
        <i class="ti ti-user text-xl text-gray-400"></i>
        Usuario no autenticado
      `;
    }
  }

  // Puedes activar sesión desde consola para probar:
  // localStorage.setItem("usuarioAutenticado", "true");

  // Y borrarla así:
  // localStorage.removeItem("usuarioAutenticado");
});
// ===============================
// DASHBOARD NËWEMPY — PARTE 8
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("dashboardData") || "[]");
  const contenedor = document.querySelector("main");
  if (!contenedor) return;

  // Crear tarjeta de cierre
  const tarjetaFinal = document.createElement("section");
  tarjetaFinal.className = "mt-16 mb-24";

  tarjetaFinal.innerHTML = `
    <div class="bg-green-400/20 border-l-4 border-green-brand rounded-2xl shadow p-6 flex items-start gap-4">

      <div class="bg-green-brand/80 text-white p-3 rounded-full">
        <i class="ti ti-leaf text-xl"></i>
      </div>

      <div class="flex-1">
        <h3 class="text-lg font-semibold text-green-brand mb-2">
          ¡Gracias por tu labor!
        </h3>
        <p class="text-sm text-gray-700 leading-relaxed">
          Cada dato que registras ayuda a construir un territorio más resiliente y verde. 
          El seguimiento de tramos, bitácoras y actividades es clave para garantizar la calidad de nuestras reforestaciones.
        </p>
        <p class="text-sm text-gray-500 mt-3 italic">
          Última actualización: <span class="font-medium text-green-brand">${new Date().toLocaleDateString()}</span>
        </p>
      </div>

    </div>
  `;

  contenedor.appendChild(tarjetaFinal);
});