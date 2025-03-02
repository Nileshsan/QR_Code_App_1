document.addEventListener("DOMContentLoaded", fetchEntries);

// Function to add an entry to the table
function addEntryToTable(entry_id, qr_code) {
    let table = document.getElementById("qrTable");
    let row = table.insertRow();

    let idCell = row.insertCell(0);
    idCell.textContent = entry_id;

    let qrCell = row.insertCell(1);
    let img = document.createElement("img");
    img.src = qr_code;
    img.width = 100;
    qrCell.appendChild(img);

    let deleteCell = row.insertCell(2);
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function () { deleteEntry(entry_id, row); };
    deleteCell.appendChild(deleteBtn);
}

// Function to add an entry
async function addEntry() {
    let idInput = document.getElementById("idInput").value;
    let qrInput = document.getElementById("qrInput").files[0];

    if (!idInput || !qrInput) {
        alert("Please enter an ID and select an image!");
        return;
    }

    let reader = new FileReader();
    reader.onloadend = async function () {
        let qrBase64 = reader.result;

        try {
            let response = await fetch('/add_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry_id: idInput, qr_code: qrBase64 })
            });

            let result = await response.json();
            if (response.ok) {
                addEntryToTable(idInput, qrBase64);
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            alert("Network error: " + error);
        }
    };

    reader.readAsDataURL(qrInput);
}

// Fetch and display entries
async function fetchEntries() {
    try {
        const response = await fetch('/get_entries');
        const entries = await response.json();

        let tableBody = document.getElementById("qrTable");
        tableBody.innerHTML = "";

        entries.forEach(entry => {
            addEntryToTable(entry.entry_id, entry.qr_code);
        });
    } catch (error) {
        alert("Error fetching data: " + error);
    }
}

// Function to delete an entry
async function deleteEntry(entry_id, row) {
    try {
        let response = await fetch(`/delete_entry/${entry_id}`, { method: 'DELETE' });
        if (response.ok) {
            row.remove();
        } else {
            alert("Failed to delete entry.");
        }
    } catch (error) {
        alert("Network error: " + error);
    }
}
