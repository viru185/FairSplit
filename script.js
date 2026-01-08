// CONFIG
const UNIT_PRICE = 12; // currency per unit
const CURRENCY = "₹";

// DOM
const peopleList = document.getElementById("peopleList");
const addPersonBtn = document.getElementById("addPerson");
const resetBtn = document.getElementById("reset");
const exportBtn = document.getElementById("export");
const shareBtn = document.getElementById("shareWhatsApp");
const resultEl = document.getElementById("result");
const unitsEl = document.getElementById("units");
const billEl = document.getElementById("bill");
const startMonthEl = document.getElementById("startMonth");
const monthSpanEl = document.getElementById("monthSpan");

// Update unit price in HTML
document
    .querySelectorAll(".unit-price")
    .forEach((el) => (el.textContent = `₹${UNIT_PRICE}/unit`));

let lastPlainText = "";
let _suppress = false;

// Helpers
function createPerson(name = "", days = 1) {
    const idx = Date.now().toString(36);
    const el = document.createElement("div");
    el.className = "person";
    el.dataset.id = idx;
    el.innerHTML = `
    <input type="text" class="pname" placeholder="Name (optional)" value="${escapeHtml(
        name
    )}" />
    <input type="number" class="days" min="1" value="${days}" aria-label="Days stayed" />
    <button type="button" class="remove" title="Remove">✕</button>
  `;

    const daysInput = el.querySelector(".days");
    const removeBtn = el.querySelector(".remove");

    removeBtn.addEventListener("click", () => el.remove());

    // Wheel to increase/decrease days
    daysInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const max = getTotalDaysInSpan();
        const step = e.deltaY < 0 ? 1 : -1;
        let v = Number(daysInput.value || 0) + step;
        v = Math.max(1, Math.min(max, v));
        daysInput.value = v;
        compute();
    });

    // Clamp on input
    daysInput.addEventListener("input", () => {
        const max = getTotalDaysInSpan();
        let v = Math.max(1, Math.min(max, Number(daysInput.value) || 1));
        daysInput.value = v;
    });

    return el;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function daysInMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
}

function getTotalDaysInSpan() {
    const start = startMonthEl.value;
    const span = Math.max(1, Number(monthSpanEl.value) || 1);
    if (!start) {
        // default to current month
        const now = new Date();
        let total = 0;
        for (let i = 0; i < span; i++) {
            total += daysInMonth(now.getFullYear(), now.getMonth() + i);
        }
        return total;
    }
    const [y, m] = start.split("-").map(Number);
    let total = 0;
    for (let i = 0; i < span; i++) {
        const monthIndex = m - 1 + i; // zero-based
        const year = y + Math.floor(monthIndex / 12);
        const mon = monthIndex % 12;
        total += daysInMonth(year, mon);
    }
    return total;
}

// Actions
function addPerson(name = "", days = 1) {
    peopleList.appendChild(createPerson(name, days));
    // update max days for the newly created input
    updateDaysMax();
    peopleList.querySelector(".person:last-child .pname").focus();
}

function updateDaysMax() {
    const max = getTotalDaysInSpan();
    document.querySelectorAll(".person .days").forEach((el) => {
        el.max = max;
        if (Number(el.value) > max) el.value = max;
    });
}

function resetForm() {
    unitsEl.value = "";
    billEl.value = "";
    peopleList.innerHTML = "";
    resultEl.innerHTML = "";
    // set default month to current
    const now = new Date();
    monthSpanEl.value = 1;
    startMonthEl.value = `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
    addPerson("Person 1");
}

function compute() {
    const units = Number(unitsEl.value);
    let bill = Number(billEl.value);

    if (!bill && units) bill = units * UNIT_PRICE;
    if (!units && bill) {
        // derive units from bill
        unitsEl.value = (bill / UNIT_PRICE).toFixed(2);
    }

    const personEls = Array.from(document.querySelectorAll(".person"));
    if (!bill || personEls.length === 0) {
        resultEl.innerHTML = `<div class="muted">Enter a bill (or units) and add at least one person.</div>`;
        return;
    }

    const people = personEls.map((el, i) => {
        const name =
            el.querySelector(".pname").value.trim() || `Person ${i + 1}`;
        const days = Math.max(1, Number(el.querySelector(".days").value) || 1);
        return { name, days };
    });

    const totalDays = people.reduce((s, p) => s + p.days, 0);
    const costPerDay = bill / totalDays;

    // Build result (html)
    let html = `<div class="row"><strong>Total Bill</strong><strong>${CURRENCY}${bill.toFixed(
        2
    )}</strong></div>`;
    let lines = [
        `Total Bill: ${CURRENCY}${bill.toFixed(2)}`,
        `Billing period days: ${getTotalDaysInSpan()}`,
    ];

    people.forEach((p) => {
        const share = p.days * costPerDay;
        html += `<div class="row"><span>${escapeHtml(
            p.name
        )}</span><span>${CURRENCY}${share.toFixed(2)}</span></div>`;
        lines.push(
            `${p.name}: ${CURRENCY}${share.toFixed(2)} (${p.days} days)`
        );
    });

    lastPlainText = lines.join("\n");
    resultEl.innerHTML = html;
}

// Copy result to clipboard (multi-line)
async function copyResult() {
    if (!lastPlainText) return;
    try {
        await navigator.clipboard.writeText(lastPlainText);
        exportBtn.textContent = "Copied!";
        setTimeout(() => (exportBtn.textContent = "Copy Result"), 1400);
    } catch (e) {
        exportBtn.textContent = "Failed";
        setTimeout(() => (exportBtn.textContent = "Copy Result"), 1400);
    }
}

function shareToWhatsApp() {
    if (!lastPlainText) return;
    const encoded = encodeURIComponent(lastPlainText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
}

// Bidirectional units/bill sync
unitsEl.addEventListener("input", () => {
    if (_suppress) return;
    const v = Number(unitsEl.value);
    if (v > 0) {
        _suppress = true;
        billEl.value = (v * UNIT_PRICE).toFixed(2);
        _suppress = false;
    } else {
        _suppress = true;
        billEl.value = "";
        _suppress = false;
    }
    debounceCompute();
});

billEl.addEventListener("input", () => {
    if (_suppress) return;
    const v = Number(billEl.value);
    if (v > 0) {
        _suppress = true;
        unitsEl.value = (v / UNIT_PRICE).toFixed(2);
        _suppress = false;
    } else {
        _suppress = true;
        unitsEl.value = "";
        _suppress = false;
    }
    debounceCompute();
});

// Update days max when month inputs change
[startMonthEl, monthSpanEl].forEach((el) =>
    el.addEventListener("change", () => {
        updateDaysMax();
        debounceCompute();
    })
);

// Init handlers
addPersonBtn.addEventListener("click", () => addPerson());
resetBtn.addEventListener("click", resetForm);
exportBtn.addEventListener("click", copyResult);
shareBtn && shareBtn.addEventListener("click", shareToWhatsApp);

// Wheel support for units, bill, monthSpan
function addWheelSupport(input, computeFn = debounceCompute) {
    input.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = e.deltaY < 0 ? 1 : -1;
        let v = Number(input.value || 0) + step;
        if (input.min) v = Math.max(Number(input.min), v);
        if (input.max) v = Math.min(Number(input.max), v);
        input.value = v || "";
        computeFn();
    });
}

// Allow Enter to add a person when focused on last name
peopleList.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addPerson();
    }
});

// Add wheel support to number inputs
addWheelSupport(unitsEl);
addWheelSupport(billEl);
addWheelSupport(monthSpanEl);

// Start with one person and sensible defaults
resetForm();
updateDaysMax();

// Small enhancement: compute when bill or units change after a pause (debounce)
let _t;
function debounceCompute() {
    clearTimeout(_t);
    _t = setTimeout(() => {
        if (document.querySelectorAll(".person").length) compute();
    }, 400);
}
