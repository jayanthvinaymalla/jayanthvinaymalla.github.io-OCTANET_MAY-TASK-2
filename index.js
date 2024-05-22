document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const loginBtn = document.getElementById('login');
    const logoutBtn = document.getElementById('logout');

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isAuthenticated = false;

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.toggle('complete', task.complete);
            li.draggable = isAuthenticated;
            li.dataset.index = index;
            li.innerHTML = `
                <span>${task.text} <small>(${task.date} ${task.time})</small></span>
                <div>
                    <button onclick="toggleComplete(${index})" ${!isAuthenticated ? 'disabled' : ''}>${task.complete ? 'Undo' : 'Complete'}</button>
                    <button onclick="deleteTask(${index})" ${!isAuthenticated ? 'disabled' : ''}>Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });

        addDragAndDropListeners();
    }

    window.toggleComplete = function(index) {
        if (!isAuthenticated) return;
        tasks[index].complete = !tasks[index].complete;
        saveTasks();
        renderTasks();
    }

    window.deleteTask = function(index) {
        if (!isAuthenticated) return;
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const taskDate = dateInput.value;
        const taskTime = timeInput.value;
        if (taskText && taskDate && taskTime && isAuthenticated) {
            tasks.push({ text: taskText, date: taskDate, time: taskTime, complete: false });
            taskInput.value = '';
            dateInput.value = '';
            timeInput.value = '';
            saveTasks();
            renderTasks();
        }
    });

    loginBtn.addEventListener('click', () => {
        isAuthenticated = true;
        toggleAuthState();
    });

    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false;
        toggleAuthState();
    });

    function toggleAuthState() {
        loginBtn.hidden = isAuthenticated;
        logoutBtn.hidden = !isAuthenticated;
        taskInput.disabled = !isAuthenticated;
        dateInput.disabled = !isAuthenticated;
        timeInput.disabled = !isAuthenticated;
        addTaskBtn.disabled = !isAuthenticated;
        renderTasks();
    }

    function addDragAndDropListeners() {
        const draggables = document.querySelectorAll('#task-list li');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                if (isAuthenticated) draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                if (isAuthenticated) draggable.classList.remove('dragging');
            });
        });

        taskList.addEventListener('dragover', e => {
            if (!isAuthenticated) return;
            e.preventDefault();
            const afterElement = getDragAfterElement(taskList, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) {
                taskList.appendChild(dragging);
            } else {
                taskList.insertBefore(dragging, afterElement);
            }
        });

        taskList.addEventListener('drop', () => {
            if (!isAuthenticated) return;
            const updatedTasks = [];
            taskList.querySelectorAll('li').forEach(li => {
                const index = li.dataset.index;
                updatedTasks.push(tasks[index]);
            });
            tasks.length = 0;
            tasks.push(...updatedTasks);
            saveTasks();
            renderTasks();
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    renderTasks();
    toggleAuthState();
});
