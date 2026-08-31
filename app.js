(() => {
  const STORAGE_RECORDS = "repartos.records.v1";
  const STORAGE_RATES = "repartos.rates.v1";

  const DEFAULT_RATES = {
    effectiveDate: "2026-08-01",
    brackets: [
      { min: 0, max: 50, amount: 131100 },
      { min: 51, max: 100, amount: 150760 },
      { min: 101, max: 150, amount: 170430 },
      { min: 151, max: 200, amount: 203100 },
      { min: 201, max: 251, amount: 222780 }
    ]
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  let records = loadJSON(STORAGE_RECORDS, []);
  let rates = loadJSON(STORAGE_RATES, DEFAULT_RATES);
  let deferredInstallPrompt = null;

  let lastMessage = "";

  const CHAMBA_MESSAGES = [
    "💪 Bien ahí, máquina. Otro día adentro.",
    "🔥 Sumando kilómetros, maravilla.",
    "🚚 Jornada cumplida, máquina.",
    "💰 Otro poquito más para la quincena.",
    "📦 Paquetes entregados. Chamba registrada.",
    "😎 Qué nivel, maravilla.",
    "🫡 Cumpliste con la misión de hoy, máquina.",
    "🔥 Un día más haciendo que pase.",
    "💸 Eso también suma, máquina.",
    "🚗 Kilómetros hechos. Ahora a descansar, maravilla.",
    "❤️ Orgullosa de vos, maravilla.",
    "🫶 Todo esfuerzo suma, máquina.",
    "❤️ Una jornada menos para llegar a lo que queremos.",
    "😘 Bien ahí, mi maravilla."
  ];

  // Citas clásicas breves. La redacción puede variar según la traducción.
  const STOIC_MESSAGES = [
    "🏛️ Marco Aurelio: “Tienes poder sobre tu mente, no sobre los acontecimientos externos.”",
    "🏛️ Marco Aurelio: “La mejor venganza es no ser como quien causó el daño.”",
    "🏛️ Marco Aurelio: “El alma se tiñe del color de sus pensamientos.”",
    "🏛️ Epicteto: “No son las cosas las que nos perturban, sino nuestros juicios sobre ellas.”",
    "🏛️ Epicteto: “Primero dite a ti mismo quién quieres ser; luego haz lo que tengas que hacer.”",
    "🏛️ Epicteto: “Ningún hombre es libre si no es dueño de sí mismo.”",
    "🏛️ Séneca: “No es que tengamos poco tiempo, sino que perdemos mucho.”",
    "🏛️ Séneca: “Sufrimos más a menudo en la imaginación que en la realidad.”",
    "🏛️ Séneca: “La suerte es lo que sucede cuando la preparación encuentra la oportunidad.”"
  ];

  const SPECIAL_REWARD_MESSAGE =
    "🏆 Premio desbloqueado: hoy te ganaste sexo anal, máquina.";


  function randomFrom(list) {
    if (!list.length) return "";
    let candidates = list.filter(item => item !== lastMessage);
    if (!candidates.length) candidates = list;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastMessage = picked;
    return picked;
  }

  function currentStreak() {
    if (!records.length) return 0;
    const unique = [...new Set(records.map(r => r.date))].sort();
    if (!unique.length) return 0;
    let streak = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      const curr = parseDate(unique[i]);
      const prev = parseDate(unique[i - 1]);
      const diff = Math.round((curr - prev) / 86400000);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }

  function getCelebrationMessage(record) {
    const group = getPaymentInfo(record.date);
    const groupRecords = records.filter(r => getPaymentInfo(r.date).key === group.key);
    const total = groupRecords.reduce((sum, r) => sum + r.amount, 0);
    const streak = currentStreak();

    if (record.km >= 201) {
      return "🚀 Más de 200 km. Hoy la rompiste, maravilla.";
    }

    if (streak >= 5) {
      return `🔥 ${streak} días seguidos, máquina. La constancia está haciendo lo suyo.`;
    }

    if (total >= 1000000) {
      return "🤑 Pasaste el millón en esta quincena. Qué máquina.";
    }

    if (total >= 500000) {
      return "💰 Medio palo acumulado. Mirá cómo suma, maravilla.";
    }

    // Premio ultra raro: aproximadamente 1% de probabilidad.
    if (Math.random() < 0.01) {
      return SPECIAL_REWARD_MESSAGE;
    }

    // 1 de cada 4 mensajes normales será una cita estoica.
    return Math.random() < 0.25 ? randomFrom(STOIC_MESSAGES) : randomFrom(CHAMBA_MESSAGES);
  }

  function showCelebration(message) {
    const box = document.querySelector("#celebration");
    if (!box) return;
    box.textContent = message;
    box.classList.remove("hidden");
    box.classList.remove("celebration-pop");
    void box.offsetWidth;
    box.classList.add("celebration-pop");

    clearTimeout(showCelebration.timer);
    showCelebration.timer = setTimeout(() => {
      box.classList.add("hidden");
    }, 6500);
  }

  function loadJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
  }

  function saveRates() {
    localStorage.setItem(STORAGE_RATES, JSON.stringify(rates));
  }

  function parseDate(value) {
    const [y,m,d] = value.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function isoDate(date) {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
  }

  function fmtDate(value) {
    return new Intl.DateTimeFormat("es-AR", {
      timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric"
    }).format(parseDate(value));
  }

  function fmtMoney(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency", currency: "ARS", maximumFractionDigits: 0
    }).format(value);
  }

  function monthName(monthIndex) {
    return new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(2026, monthIndex, 1)));
  }

  function getBracket(km) {
    return rates.brackets.find(b => km >= b.min && km <= b.max) || null;
  }

  function getPaymentInfo(workDate) {
    const d = parseDate(workDate);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const next = new Date(Date.UTC(y, m + 1, 1));
    const nextYear = next.getUTCFullYear();
    const nextMonth = next.getUTCMonth();

    if (day <= 15) {
      return {
        key: `${y}-${String(m + 1).padStart(2, "0")}-H1`,
        workLabel: `1 al 15 de ${monthName(m)} de ${y}`,
        payLabel: `5 al 10 de ${monthName(nextMonth)} de ${nextYear}`,
        sortDate: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-05`
      };
    }

    return {
      key: `${y}-${String(m + 1).padStart(2, "0")}-H2`,
      workLabel: `16 al ${new Date(Date.UTC(y, m + 1, 0)).getUTCDate()} de ${monthName(m)} de ${y}`,
      payLabel: `20 al 25 de ${monthName(nextMonth)} de ${nextYear}`,
      sortDate: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-20`
    };
  }

  function groups() {
    const map = new Map();
    for (const record of records) {
      const info = getPaymentInfo(record.date);
      if (!map.has(info.key)) map.set(info.key, { ...info, records: [] });
      map.get(info.key).records.push(record);
    }
    return [...map.values()]
      .map(g => ({
        ...g,
        records: g.records.sort((a,b) => a.date.localeCompare(b.date)),
        total: g.records.reduce((s,r) => s + r.amount, 0),
        km: g.records.reduce((s,r) => s + r.km, 0)
      }))
      .sort((a,b) => a.sortDate.localeCompare(b.sortDate));
  }

  function findNextPaymentGroup() {
    const gs = groups();
    if (!gs.length) return null;

    const today = new Date();
    const todayIso = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    return gs.find(g => g.sortDate >= todayIso) || gs[gs.length - 1];
  }

  function renderDashboard() {
    const group = findNextPaymentGroup();
    const list = $("#currentRows");
    list.innerHTML = "";

    if (!group) {
      $("#nextPaymentWindow").textContent = "Sin días cargados";
      $("#nextPaymentPeriod").textContent = "";
      $("#nextPaymentAmount").textContent = fmtMoney(0);
      $("#daysCount").textContent = "0";
      $("#kmCount").textContent = "0";
      list.innerHTML = '<div class="empty">Todavía no hay días cargados.</div>';
      return;
    }

    $("#nextPaymentWindow").textContent = group.payLabel;
    $("#nextPaymentPeriod").textContent = `Trabajo: ${group.workLabel}`;
    $("#nextPaymentAmount").textContent = fmtMoney(group.total);
    $("#daysCount").textContent = String(group.records.length);
    $("#kmCount").textContent = String(group.km);

    for (const record of group.records) {
      list.appendChild(buildRecordRow(record));
    }
  }

  function buildRecordRow(record) {
    const node = $("#recordTemplate").content.firstElementChild.cloneNode(true);
    node.dataset.id = record.id;
    node.querySelector(".record-date").textContent = fmtDate(record.date);
    node.querySelector(".record-km").textContent = `${record.km} km`;
    node.querySelector(".record-amount").textContent = fmtMoney(record.amount);

    node.querySelector(".edit-btn").addEventListener("click", () => startEdit(record.id));
    node.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm(`¿Borrar el registro del ${fmtDate(record.date)}?`)) {
        records = records.filter(r => r.id !== record.id);
        saveState();
        renderAll();
      }
    });
    return node;
  }

  function renderHistory() {
    const container = $("#historyList");
    container.innerHTML = "";
    const gs = groups().sort((a,b) => b.sortDate.localeCompare(a.sortDate));

    if (!gs.length) {
      container.innerHTML = '<div class="empty">El historial aparecerá cuando cargues días trabajados.</div>';
      return;
    }

    for (const g of gs) {
      const details = document.createElement("details");
      details.className = "history-card";
      const rows = g.records.map(r => `
        <div class="record-row">
          <div>
            <strong>${fmtDate(r.date)}</strong>
            <p class="muted">${r.km} km</p>
          </div>
          <div class="record-actions">
            <strong>${fmtMoney(r.amount)}</strong>
            <button
              class="icon-btn danger history-delete-btn"
              type="button"
              data-record-id="${r.id}"
              aria-label="Borrar registro del ${fmtDate(r.date)}"
            >Borrar</button>
          </div>
        </div>
      `).join("");

      details.innerHTML = `
        <summary>
          <div>
            <h3>${g.payLabel}</h3>
            <p class="small muted">Trabajo: ${g.workLabel}</p>
          </div>
          <div class="history-total">${fmtMoney(g.total)}</div>
        </summary>
        <div class="history-meta">
          <span>${g.records.length} días</span>
          <span>${g.km} km</span>
        </div>
        <div class="history-details">${rows}</div>
      `;
      container.appendChild(details);
    }
  }

  function renderRatesEditor() {
    $("#ratesEffectiveDate").value = rates.effectiveDate;
    const editor = $("#ratesEditor");
    editor.innerHTML = "";

    rates.brackets.forEach((b, index) => {
      const row = document.createElement("div");
      row.className = "rate-row";
      row.innerHTML = `
        <label>Rango de km
          <input value="${b.min}-${b.max}" disabled />
        </label>
        <label>Importe
          <input data-rate-index="${index}" type="number" min="0" step="1" value="${b.amount}" />
        </label>
      `;
      editor.appendChild(row);
    });
  }

  function updatePreview() {
    const km = Number($("#workKm").value);
    const preview = $("#ratePreview");

    if ($("#workKm").value === "") {
      preview.textContent = "Ingresá los kilómetros para ver cuánto corresponde.";
      return;
    }

    if (!Number.isFinite(km) || km < 0) {
      preview.textContent = "Ingresá una cantidad válida de kilómetros.";
      return;
    }

    const bracket = getBracket(km);
    if (!bracket) {
      preview.textContent = `No hay una tarifa configurada para ${km} km.`;
      return;
    }

    preview.textContent = `${km} km → ${fmtMoney(bracket.amount)}`;
  }

  function resetForm() {
    $("#workForm").reset();
    $("#editId").value = "";
    $("#saveBtn").textContent = "Guardar día";
    $("#cancelEditBtn").classList.add("hidden");
    $("#workDate").value = todayLocalISO();
    $("#formMessage").textContent = "";
    updatePreview();
  }

  function startEdit(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;

    $("#editId").value = record.id;
    $("#workDate").value = record.date;
    $("#workKm").value = record.km;
    $("#saveBtn").textContent = "Guardar cambios";
    $("#cancelEditBtn").classList.remove("hidden");
    updatePreview();
    showTab("inicio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function todayLocalISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function renderAll() {
    renderDashboard();
    renderHistory();
    renderRatesEditor();
  }

  function showTab(name) {
    $$(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
    $$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === `tab-${name}`));
  }

  $$(".tab").forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));

  $("#workKm").addEventListener("input", updatePreview);
  $("#cancelEditBtn").addEventListener("click", resetForm);

  $("#historyList").addEventListener("click", (event) => {
    const button = event.target.closest(".history-delete-btn");
    if (!button) return;

    const id = button.dataset.recordId;
    const record = records.find(r => r.id === id);
    if (!record) return;

    if (confirm(`¿Borrar el registro del ${fmtDate(record.date)}?`)) {
      records = records.filter(r => r.id !== id);
      saveState();
      renderAll();
    }
  });

  $("#workForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#editId").value;
    const date = $("#workDate").value;
    const km = Number($("#workKm").value);
    const bracket = getBracket(km);

    if (!date || !Number.isFinite(km) || km < 0 || !bracket) {
      $("#formMessage").textContent = "Revisá la fecha y los kilómetros. No hay una tarifa válida para ese valor.";
      return;
    }

    let savedRecord = null;

    if (id) {
      const existing = records.find(r => r.id === id);
      if (existing) {
        existing.date = date;
        existing.km = km;
        existing.amount = bracket.amount;
      }
      $("#formMessage").textContent = "Cambios guardados.";
    } else {
      savedRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        date,
        km,
        amount: bracket.amount
      };
      records.push(savedRecord);
      $("#formMessage").textContent = "Día guardado.";
    }

    saveState();
    renderDashboard();
    renderHistory();

    const msg = $("#formMessage").textContent;
    resetForm();
    $("#formMessage").textContent = msg;

    if (savedRecord) {
      showCelebration(getCelebrationMessage(savedRecord));
    }
  });

  $("#saveRatesBtn").addEventListener("click", () => {
    const effectiveDate = $("#ratesEffectiveDate").value;
    const inputs = $$("[data-rate-index]");
    const newBrackets = rates.brackets.map((b, index) => {
      const amount = Number(inputs[index].value);
      return { ...b, amount };
    });

    if (!effectiveDate || newBrackets.some(b => !Number.isFinite(b.amount) || b.amount < 0)) {
      $("#ratesMessage").textContent = "Revisá la fecha y los importes.";
      return;
    }

    rates = { effectiveDate, brackets: newBrackets };
    saveRates();
    $("#ratesMessage").textContent = "Tarifas guardadas.";

    // Recalcula todos los registros usando la tabla actual.
    records = records.map(r => {
      const b = getBracket(r.km);
      return b ? { ...r, amount: b.amount } : r;
    });
    saveState();
    renderDashboard();
    renderHistory();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $("#installBtn").classList.remove("hidden");
  });

  $("#installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $("#installBtn").classList.add("hidden");
  });
$("#workDate").value = todayLocalISO();
  renderAll();
  updatePreview();
})();
