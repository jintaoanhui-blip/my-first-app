const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const allButton = document.getElementById("allButton");
const activeButton = document.getElementById("activeButton");
const completedButton = document.getElementById("completedButton");
const countText = document.getElementById("countText");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showTasks() {
  taskList.innerHTML = "";

  const activeCount = tasks.filter(function (task) {
    return !task.completed;
  }).length;

  countText.textContent = "未完成：" + activeCount + " 个";

  tasks.forEach(function (task, index) {
    if (currentFilter === "active" && task.completed) {
      return;
    }

    if (currentFilter === "completed" && !task.completed) {
      return;
    }

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

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("请输入任务内容");
    return;
  }

  tasks.push({
    text: taskText,
    completed: false
  });

  saveTasks();
  showTasks();
  taskInput.value = "";
}

addButton.addEventListener("click", function () {
  addTask();
});

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

allButton.addEventListener("click", function () {
  currentFilter = "all";
  showTasks();
});

activeButton.addEventListener("click", function () {
  currentFilter = "active";
  showTasks();
});

completedButton.addEventListener("click", function () {
  currentFilter = "completed";
  showTasks();
});

showTasks();
