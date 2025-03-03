document.addEventListener("DOMContentLoaded", fetchEntries);

// Function to add an entry to the table
function addEntryToTable(entry_id, qr_code) {
    let table = document.getElementById("qrTable");
    let row = document.createElement("tr");

    let idCell = document.createElement("td");
    idCell.textContent = entry_id;
    row.appendChild(idCell);

    let qrCell = document.createElement("td");
    let img = document.createElement("img");
    img.src = qr_code;
    img.width = 100;
    img.onload = () => console.log("Image loaded:", qr_code); // Debugging
    qrCell.appendChild(img);
    row.appendChild(qrCell);

    let deleteCell = document.createElement("td");
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function () { deleteEntry(entry_id, row); };
    deleteCell.appendChild(deleteBtn);
    row.appendChild(deleteCell);

    table.appendChild(row);
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
        let qrBase64 = reader.result.split(',')[1]; // Remove metadata

        console.log("New QR Image (Base64):", qrBase64.substring(0, 100)); // Debugging

        try {
            let response = await fetch('/add_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry_id: idInput, qr_code: qrBase64 }) // Ensure correct format
            });

            let result = await response.json();
            if (response.ok) {
                addEntryToTable(idInput, `data:image/png;base64,${qrBase64}`); // Correct format
                alert("Entry added successfully!");
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
        tableBody.innerHTML = "";  // Ensure table clears before adding new entries

        entries.forEach(entry => {
            addEntryToTable(entry.entry_id, entry.qr_code);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}



// Function to delete an entry
async function deleteEntry(entry_id, row) {
    try {
        let response = await fetch(`/delete_entry/${entry_id}`, { method: 'DELETE' });
        let result = await response.json();
        
        if (response.ok) {
            row.remove();
        } else {
            alert("Failed to delete entry: " + result.message);
        }
    } catch (error) {
        alert("Network error: " + error);
    }
}
