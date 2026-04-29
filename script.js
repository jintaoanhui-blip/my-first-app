const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showTasks() {
  taskList.innerHTML = "";

  tasks.forEach(function (task, index) {
    const taskItem = document.createElement("li");

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    const taskSpan = document.createElement("span");
    taskSpan.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "删除";

    taskSpan.addEventListener("click", function () {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      showTasks();
    });

    deleteButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      saveTasks();
      showTasks();
    });

    taskItem.appendChild(taskSpan);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });
}

addButton.addEventListener("click", function () {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    return;
  }

  tasks.push({
    text: taskText,
    completed: false
  });

  saveTasks();
  showTasks();
  taskInput.value = "";
});

showTasks();
