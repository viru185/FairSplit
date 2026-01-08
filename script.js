// HARD-CODED UNIT PRICE
const UNIT_PRICE = 12; // ₹ per unit

function generateInputs() {
    const count = document.getElementById("peopleCount").value;
    const container = document.getElementById("peopleInputs");
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <label>Person ${i} - Days Stayed</label>
            <input type="number" class="days" min="1">
        `;
    }
}

function calculate() {
    const units = document.getElementById("units").value;
    let bill = document.getElementById("bill").value;

    if (!bill && units) {
        bill = units * UNIT_PRICE;
    }

    if (!bill) {
        alert("Enter either units or total bill");
        return;
    }

    const daysInputs = document.querySelectorAll(".days");
    let totalPersonDays = 0;
    let days = [];

    daysInputs.forEach(input => {
        const value = Number(input.value);
        days.push(value);
        totalPersonDays += value;
    });

    const costPerDay = bill / totalPersonDays;
    let output = `<h3>Total Bill: ₹${bill}</h3>`;

    days.forEach((d, i) => {
        output += `<p>Person ${i + 1}: ₹${(d * costPerDay).toFixed(2)}</p>`;
    });

    document.getElementById("result").innerHTML = output;
}
