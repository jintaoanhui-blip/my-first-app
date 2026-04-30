const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const aiButton = document.getElementById("aiButton");
const aiError = document.getElementById("aiError");
const taskList = document.getElementById("taskList");
const allButton = document.getElementById("allButton");
const activeButton = document.getElementById("activeButton");
const completedButton = document.getElementById("completedButton");
const clearButton = document.getElementById("clearButton");
const countText = document.getElementById("countText");

const API_BASE_URL = "https://todo-ai-backend.onrender.com";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingIndex = null;

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

    let taskTextElement;

    if (editingIndex === index) {
      taskTextElement = document.createElement("input");
      taskTextElement.value = task.text;
    } else {
      taskTextElement = document.createElement("span");
      taskTextElement.textContent = task.text;

      taskTextElement.addEventListener("click", function () {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        showTasks();
      });
    }

    const editButton = document.createElement("button");
    editButton.textContent = editingIndex === index ? "保存" : "编辑";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "删除";

    editButton.addEventListener("click", function () {
      if (editingIndex !== index) {
        editingIndex = index;
        showTasks();
        return;
      }

      const newText = taskTextElement.value.trim();

      if (newText === "") {
        alert("请输入任务内容");
        return;
      }

      tasks[index].text = newText;
      editingIndex = null;
      saveTasks();
      showTasks();
    });

    deleteButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      editingIndex = null;
      saveTasks();
      showTasks();
    });

    taskItem.appendChild(taskTextElement);
    taskItem.appendChild(editButton);
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
  taskInput.focus();
}

addButton.addEventListener("click", function () {
  addTask();
});

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

aiButton.addEventListener("click", async function () {
  const goal = taskInput.value.trim();

  if (goal === "") {
    alert("请输入目标");
    return;
  }

  aiError.textContent = "";
  aiError.style.display = "none";
  aiButton.textContent = "AI 拆解中...";
  aiButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/breakdown`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        goal: goal
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();

    if (!Array.isArray(data.tasks)) {
      throw new Error("Tasks is not an array");
    }

    data.tasks.forEach(function (taskText) {
      tasks.push({
        text: taskText,
        completed: false
      });
    });

    saveTasks();
    showTasks();
    taskInput.value = "";
    taskInput.focus();
  } catch (error) {
    aiError.textContent = "AI 拆解失败，请稍后重试。";
    aiError.style.display = "block";
  } finally {
    aiButton.textContent = "AI 拆解任务";
    aiButton.disabled = false;
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

clearButton.addEventListener("click", function () {
  const isConfirmed = confirm("确定要清空全部任务吗？");

  if (!isConfirmed) {
    return;
  }

  tasks = [];
  editingIndex = null;
  saveTasks();
  showTasks();
});

showTasks();
