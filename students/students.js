const addStudentBtn = document.getElementById("add-student");
const closeBtn = document.querySelector(".close");
const studentForm = document.getElementById("student-form");
const tbody = document.querySelector("tbody");
const modalTitle = document.getElementById("modal-title");

const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

let editingRow = null;

// Open modal for adding a student
addStudentBtn.addEventListener("click", () => {
    editingRow = null;
    modalTitle.textContent = "Add Student";
    studentForm.reset();
    document.getElementById("Add-edit-modal").style.display = "flex";
});

document.getElementById("close-edit-modal").addEventListener("click", () => {
    document.getElementById("Add-edit-modal").style.display = "none";
});

document.getElementById("close-delete-modal").addEventListener("click", () => {
    document.getElementById("delete-confirm-modal").style.display = "none";
});

document.querySelector(".close-btn").addEventListener("click", () => {
    document.querySelector(".modal").style.display = "none";
});

cancelDeleteBtn.addEventListener("click", () => {
    deleteConfirmModal.style.display = "none";
});

// Handle form submission (Add or Edit)
studentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const group = studentForm.querySelector("input[name='group']").value;
    const firstName = studentForm.querySelector("input[name='first-name']").value;
    const lastName = studentForm.querySelector("input[name='last-name']").value;
    const gender = studentForm.querySelector("select[name='gender']").value;
    const birthday = studentForm.querySelector("input[name='birthday']").value;

    if (group && firstName && lastName && gender && birthday) {
        if (editingRow) {
            // Update existing row
            editingRow.innerHTML = createRowContent(group, firstName, lastName, gender, birthday);
            editingRow = null;
        } else {
            // Create new row
            const row = document.createElement("tr");
            row.innerHTML = createRowContent(group, firstName, lastName, gender, birthday);
            tbody.appendChild(row);

            row.querySelector('.student-checkbox').addEventListener('change', SetChecked);
            SetChecked();
        }

        document.getElementById("Add-edit-modal").style.display = "none";
        studentForm.reset();
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to generate table row content
function createRowContent(group, firstName, lastName, gender, birthday) {
    const rowContent = `
        <td>
            <input type="checkbox" aria-label="Select student" class="student-checkbox">
        </td>
        <td>${group}</td>
        <td>${firstName} ${lastName}</td>
        <td>${gender}</td>
        <td>${birthday}</td>
        <td><span class="status ${firstName === "Sofiia" ? "online" : "offline"}"></span></td>
        <td> 
            <button class="edit-btn"><img src="../assets/edit-icon.png" alt="Edit"></button>
            <button class="delete-btn"><img src="../assets/remove-icon.png" alt="Remove"></button>
        </td>
    `;
    return rowContent;
}

// Delete and Edit event listeners
tbody.addEventListener("click", (e) => {

    if (e.target.closest(".delete-btn")) {

        if (selected.length > 0) {
            const studentNames = Array.from(selected).map(tr => {
                const cells = tr.querySelectorAll('td');
                return `${cells[2].textContent}`;
            });

            const nameList = studentNames.join(', ');

            const confirmMessage = document.querySelector("#delete-confirm-modal p");
            confirmMessage.textContent = `Are you sure you want to delete the following students: ${nameList}?`;
        }
        else {
            selected.push(e.target.closest("tr"));

            const cells = selected[0].querySelectorAll("td");
            const name = cells[2].textContent;

            const confirmMessage = document.querySelector("#delete-confirm-modal p");
            confirmMessage.textContent = `Are you sure you want to delete student ${name}?`;
        }

        deleteConfirmModal.style.display = "flex";
    }

    if (e.target.closest(".edit-btn")) {
        editingRow = e.target.closest("tr");

        const cells = editingRow.querySelectorAll("td");
        const nameParts = cells[2].textContent.split(" ");

        document.getElementById("group").value = cells[1].textContent;
        document.getElementById("first-name").value = nameParts[0];
        document.getElementById("last-name").value = nameParts[1];
        document.getElementById("gender").value = cells[3].textContent;
        document.getElementById("birthday").value = cells[4].textContent;

        const saveButton = document.querySelector(".create-btn");
        saveButton.textContent = "Save";
        modalTitle.textContent = "Edit Student";
        document.getElementById("Add-edit-modal").style.display = "flex";
    }
});

let selected = [];


function SetChecked() {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    selected = [];
    let allChecked = true;

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            selected.push(checkbox.closest('tr'));
        }
        else {
            allChecked = false;
        }
    });

    const selectAllCheckBox = document.getElementById('select-all');
    selectAllCheckBox.checked = allChecked;
    console.log(selected);
    updateActions();
}

// Confirm deletion
confirmDeleteBtn.addEventListener("click", () => {
    if (selected.length > 0) {
        selected.forEach(row => row.remove());
        selected = []; 
    }
    deleteConfirmModal.style.display = "none";
});

// Select all students
document.getElementById("select-all").addEventListener("change", function () {
    document.querySelectorAll("tbody input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = this.checked;
    });

    SetChecked();
});



function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const selectAll = document.getElementById('select-all').checked;
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });
}

function updateActions() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const editButtons = document.querySelectorAll('.edit-btn');

    editButtons.forEach(button => {
        if (selected.length === 1 || selected.length === 0) {
            button.disabled = false;
            button.classList.remove("disabled");
        } else {
            button.disabled = true;
            button.classList.add("disabled");
        }
    });
}


// Mock data function
function renderTable() {
    const row = document.createElement("tr");
    row.innerHTML = createRowContent("PZ-22", "Sofiia", "Kuhivchak", "Female", "2005-10-10");
    tbody.appendChild(row);
}

renderTable();

document.querySelectorAll('.student-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', SetChecked);
});