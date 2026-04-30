const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const authStatus = document.getElementById("authStatus");
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

const API_BASE_URL = "https://todo-ai-backend-zx9w.onrender.com";
const isSupabaseConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
const isSupabaseLoaded = Boolean(window.supabase);
const supabaseClient = isSupabaseConfigured && isSupabaseLoaded
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingIndex = null;

function renderUser(user) {
  if (user) {
    authStatus.textContent = "当前用户：" + user.email;
    signOutButton.style.display = "inline-block";
    return;
  }

  if (!isSupabaseConfigured) {
    authStatus.textContent = "请先配置 Supabase";
  } else if (!isSupabaseLoaded) {
    authStatus.textContent = "Supabase 加载失败";
  } else {
    authStatus.textContent = "未登录";
  }

  signOutButton.style.display = "none";
}

function setAuthLoading(isLoading) {
  signUpButton.disabled = isLoading;
  signInButton.disabled = isLoading;
  signOutButton.disabled = isLoading;
}

function getAuthInput() {
  return {
    email: authEmail.value.trim(),
    password: authPassword.value
  };
}

function validateAuthInput(email, password) {
  if (!email || !password) {
    authStatus.textContent = "请输入邮箱和密码";
    return false;
  }

  return true;
}

async function signUp() {
  if (!supabaseClient) {
    authStatus.textContent = "请先配置 Supabase";
    return;
  }

  const { email, password } = getAuthInput();

  if (!validateAuthInput(email, password)) {
    return;
  }

  setAuthLoading(true);
  authStatus.textContent = "注册中...";

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    renderUser(data.user);
  } catch (error) {
    authStatus.textContent = error.message;
  } finally {
    setAuthLoading(false);
  }
}

async function signIn() {
  if (!supabaseClient) {
    authStatus.textContent = "请先配置 Supabase";
    return;
  }

  const { email, password } = getAuthInput();

  if (!validateAuthInput(email, password)) {
    return;
  }

  setAuthLoading(true);
  authStatus.textContent = "登录中...";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    renderUser(data.user);
  } catch (error) {
    authStatus.textContent = error.message;
  } finally {
    setAuthLoading(false);
  }
}

async function signOut() {
  if (!supabaseClient) {
    return;
  }

  setAuthLoading(true);
  authStatus.textContent = "退出中...";

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    renderUser(null);
  } catch (error) {
    authStatus.textContent = error.message;
  } finally {
    setAuthLoading(false);
  }
}

async function initAuth() {
  renderUser(null);

  if (!supabaseClient) {
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  renderUser(data.session?.user || null);

  supabaseClient.auth.onAuthStateChange(function (event, session) {
    renderUser(session?.user || null);
  });
}

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

signUpButton.addEventListener("click", function () {
  signUp();
});

signInButton.addEventListener("click", function () {
  signIn();
});

signOutButton.addEventListener("click", function () {
  signOut();
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
initAuth();
