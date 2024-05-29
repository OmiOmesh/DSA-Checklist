let tasks = [];
let editIndex = -1;
let tableIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    populateTableDropdown();
});

function AddData() {
    const taskName = document.getElementById('name').value;
    const taskURL = document.getElementById('source').value;
    const selectedTable = document.getElementById('existingTables').value;

    if (taskName === "") {
        alert("Task name is required");
        return;
    }

    const targetTableIndex = selectedTable !== '' ? parseInt(selectedTable) : tableIndex;

    if (tasks[targetTableIndex].tasks.some(task => task.name === taskName)) {
        alert("Task name must be unique within the table. Please choose a different name.");
        return;
    }

    const task = {
        name: taskName,
        url: taskURL,
        completed: false
    };

    if (tasks[targetTableIndex].tasks.length < 10000) {
        tasks[targetTableIndex].tasks.push(task);
        saveTasks();
        renderTasks();
    } else {
        alert("Task limit reached. Cannot add more than 10,000 tasks.");
    }

    document.getElementById('name').value = "";
    document.getElementById('source').value = "";
}

function renderTasks() {
    const tablesContainer = document.getElementById('tablesContainer');
    tablesContainer.innerHTML = '';

    tasks.forEach((table, tIndex) => {
        const tableHeadingContainer = document.createElement('div');
        tableHeadingContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3');
        
        const tableHeading = document.createElement('h3');
        tableHeading.textContent = table.name || `Table ${tIndex + 1}`;
        tableHeading.contentEditable = true;
        tableHeading.addEventListener('blur', function() {
            table.name = tableHeading.textContent;
            saveTasks();
        });
        tableHeadingContainer.appendChild(tableHeading);

        const deleteTableButton = document.createElement('button');
        deleteTableButton.textContent = 'Delete Table';
        deleteTableButton.classList.add('btn', 'btn-danger');
        deleteTableButton.addEventListener('click', function() {
            deleteTable(tIndex);
        });
        tableHeadingContainer.appendChild(deleteTableButton);

        tablesContainer.appendChild(tableHeadingContainer);

        const tableElement = document.createElement('table');
        tableElement.classList.add('table', 'table-bordered');
        tableElement.id = `crudTable${tIndex}`;

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Serial Number</th>
                <th>Task Name</th>
                <th>Status</th>
                <th>URL</th>
                <th>Actions</th>
            </tr>
        `;
        tableElement.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.tasks.forEach((task, index) => {
            const row = document.createElement('tr');

            const serialCell = document.createElement('td');
            serialCell.textContent = index + 1;
            row.appendChild(serialCell);

            const taskCell = document.createElement('td');
            taskCell.textContent = task.name;
            row.appendChild(taskCell);

            const statusCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', function() {
                task.completed = checkbox.checked;
                saveTasks();
            });
            statusCell.appendChild(checkbox);
            row.appendChild(statusCell);

            const urlCell = document.createElement('td');
            if (task.url) {
                const link = document.createElement('a');
                link.href = task.url;
                link.textContent = task.url;
                link.target = '_blank';
                urlCell.appendChild(link);
            }
            row.appendChild(urlCell);

            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2');
            editButton.addEventListener('click', function() {
                editTask(index, tIndex);
            });
            actionCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'me-2');
            deleteButton.addEventListener('click', function() {
                deleteTask(index, tIndex);
            });
            actionCell.appendChild(deleteButton);

            const upButton = document.createElement('button');
            upButton.textContent = 'Up';
            upButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'me-2');
            upButton.addEventListener('click', function() {
                moveTask(index, tIndex, -1);
            });
            actionCell.appendChild(upButton);

            const downButton = document.createElement('button');
            downButton.textContent = 'Down';
            downButton.classList.add('btn', 'btn-secondary', 'btn-sm');
            downButton.addEventListener('click', function() {
                moveTask(index, tIndex, 1);
            });
            actionCell.appendChild(downButton);

            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

        tableElement.appendChild(tbody);
        tablesContainer.appendChild(tableElement);
    });

    populateTableDropdown();
}

function editTask(index, tIndex) {
    document.getElementById('name').value = tasks[tIndex].tasks[index].name;
    document.getElementById('source').value = tasks[tIndex].tasks[index].url;

    document.getElementById('Submit').style.display = 'none';
    document.getElementById('Update').style.display = 'block';

    editIndex = index;
    tableIndex = tIndex;
}

function UpdateData() {
    const taskName = document.getElementById('name').value;
    const taskURL = document.getElementById('source').value;

    if (taskName === "") {
        alert("Task name is required");
        return;
    }

    if (tasks[tableIndex].tasks.some((task, index) => task.name === taskName && index !== editIndex)) {
        alert("Task name must be unique within the table. Please choose a different name.");
        return;
    }

    tasks[tableIndex].tasks[editIndex].name = taskName;
    tasks[tableIndex].tasks[editIndex].url = taskURL;

    saveTasks();
    renderTasks();

    document.getElementById('name').value = "";
    document.getElementById('source').value = "";

    document.getElementById('Submit').style.display = 'block';
    document.getElementById('Update').style.display = 'none';

    editIndex = -1;
}

function deleteTask(index, tIndex) {
    const confirmDelete = confirm("Do you really want to delete this task?");
    if (confirmDelete) {
        tasks[tIndex].tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

function deleteTable(tIndex) {
    const confirmDelete = confirm("Do you really want to delete this table?");
    if (confirmDelete) {
        tasks.splice(tIndex, 1);
        saveTasks();
        renderTasks();
    }
}

function CreateNewTable() {
    const tableName = document.getElementById('tableName').value || `Table ${tasks.length + 1}`;

    // Check if the table name already exists
    if (tasks.some(table => table.name === tableName)) {
        alert("Table name must be unique. Please choose a different name.");
        return;
    }

    tasks.push({ name: tableName, tasks: [] });
    tableIndex = tasks.length - 1;
    renderTasks();
    document.getElementById('tableName').value = "";
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    tasks = savedTasks ? JSON.parse(savedTasks) : [{ name: '', tasks: [] }];
    renderTasks();
}

function populateTableDropdown() {
    const existingTablesDropdown = document.getElementById('existingTables');
    existingTablesDropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Table to Add Task';
    existingTablesDropdown.appendChild(defaultOption);

    tasks.forEach((table, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = table.name || `Table ${index + 1}`;
        existingTablesDropdown.appendChild(option);
    });
}

function moveTask(taskIndex, tableIndex, direction) {
    const table = tasks[tableIndex];
    const newIndex = taskIndex + direction;

    if (newIndex < 0 || newIndex >= table.tasks.length) {
        return;
    }

    const taskToMove = table.tasks.splice(taskIndex, 1)[0];
    table.tasks.splice(newIndex, 0, taskToMove);
    
    saveTasks();
    renderTasks();
}
