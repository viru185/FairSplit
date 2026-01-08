// CONFIG
const UNIT_PRICE = 12; // currency per unit
const CURRENCY = "₹";

// DOM
const peopleList = document.getElementById("peopleList");
const addPersonBtn = document.getElementById("addPerson");
const calculateBtn = document.getElementById("calculate");
const resetBtn = document.getElementById("reset");
const exportBtn = document.getElementById("export");
const resultEl = document.getElementById("result");
const unitsEl = document.getElementById("units");
const billEl = document.getElementById("bill");

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

    el.querySelector(".remove").addEventListener("click", () => el.remove());
    return el;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Actions
function addPerson(name = "", days = 1) {
    peopleList.appendChild(createPerson(name, days));
    peopleList.querySelector(".person:last-child .pname").focus();
}

function resetForm() {
    unitsEl.value = "";
    billEl.value = "";
    peopleList.innerHTML = "";
    resultEl.innerHTML = "";
    addPerson("Person 1");
}

function compute() {
    const units = Number(unitsEl.value);
    let bill = Number(billEl.value);

    if (!bill && units) bill = units * UNIT_PRICE;

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

    // Build result
    let html = `<div class="row"><strong>Total Bill</strong><strong>${CURRENCY}${bill.toFixed(
        2
    )}</strong></div>`;
    people.forEach((p) => {
        const share = p.days * costPerDay;
        html += `<div class="row"><span>${escapeHtml(
            p.name
        )}</span><span>${CURRENCY}${share.toFixed(2)}</span></div>`;
    });

    resultEl.innerHTML = html;
}

// Copy result to clipboard
async function copyResult() {
    if (!resultEl.textContent.trim()) return;
    try {
        await navigator.clipboard.writeText(resultEl.textContent);
        exportBtn.textContent = "Copied!";
        setTimeout(() => (exportBtn.textContent = "Copy Result"), 1400);
    } catch (e) {
        exportBtn.textContent = "Failed";
        setTimeout(() => (exportBtn.textContent = "Copy Result"), 1400);
    }
}

// Init handlers
addPersonBtn.addEventListener("click", () => addPerson());
resetBtn.addEventListener("click", resetForm);
calculateBtn.addEventListener("click", compute);
exportBtn.addEventListener("click", copyResult);

// Allow Enter to add a person when focused on last name
peopleList.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addPerson();
    }
});

// Start with one person
resetForm();

// Small enhancement: compute when bill or units change after a pause (debounce)
let _t;
[unitsEl, billEl].forEach((el) =>
    el.addEventListener("input", () => {
        clearTimeout(_t);
        _t = setTimeout(() => {
            if (document.querySelectorAll(".person").length) compute();
        }, 700);
    })
);
