const SUPABASE_URL = "https://qsqchuatnyclqrmrabgc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ME3zi1_-kWgEWovE1QO8bw_Pmz_AgHc";

const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const userMenuButton = document.getElementById("userMenuButton");
const authModal = document.getElementById("authModal");
const closeAuthButton = document.getElementById("closeAuthButton");
const authForm = document.getElementById("authForm");
const authStatus = document.getElementById("authStatus");
const userPanel = document.getElementById("userPanel");
const currentUserText = document.getElementById("currentUserText");
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const aiButton = document.getElementById("aiButton");
const aiError = document.getElementById("aiError");
const todoNotice = document.getElementById("todoNotice");
const taskList = document.getElementById("taskList");
const allButton = document.getElementById("allButton");
const activeButton = document.getElementById("activeButton");
const completedButton = document.getElementById("completedButton");
const clearButton = document.getElementById("clearButton");
const countText = document.getElementById("countText");

const API_BASE_URL = "https://todo-ai-backend-zx9w.onrender.com";
const API_ACCESS_KEY = "123456";
const isSupabaseConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
const isSupabaseLoaded = Boolean(window.supabase);
const supabaseClient = isSupabaseConfigured && isSupabaseLoaded
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let tasks = [];
let currentFilter = "all";
let editingIndex = null;
let currentUser = null;

function getUserDisplayName(user) {
  return user.email.split("@")[0];
}

function openAuthModal() {
  authModal.classList.add("open");
  authModal.setAttribute("aria-hidden", "false");
  authEmail.focus();
}

function closeAuthModal() {
  authModal.classList.remove("open");
  authModal.setAttribute("aria-hidden", "true");
}

function renderUser(user) {
  currentUser = user;

  if (user) {
    userMenuButton.textContent = getUserDisplayName(user);
    currentUserText.textContent = "当前用户：" + user.email;
    authForm.style.display = "none";
    userPanel.classList.add("open");
    authStatus.textContent = "";
    return;
  }

  userMenuButton.textContent = "登录";
  currentUserText.textContent = "";
  authForm.style.display = "block";
  userPanel.classList.remove("open");

  if (!isSupabaseConfigured) {
    authStatus.textContent = "请先配置 Supabase";
  } else if (!isSupabaseLoaded) {
    authStatus.textContent = "Supabase 加载失败";
  } else {
    authStatus.textContent = "未登录";
  }
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

    if (data.session?.user) {
      renderUser(data.session.user);
      await loadTodos();
      closeAuthModal();
    } else {
      authStatus.textContent = "注册成功，请检查邮箱验证后登录";
    }
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
    await loadTodos();
    closeAuthModal();
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
    tasks = [];
    editingIndex = null;
    showTasks();
    setTodoNotice("请先登录后使用待办");
  } catch (error) {
    authStatus.textContent = error.message;
  } finally {
    setAuthLoading(false);
  }
}

async function initAuth() {
  renderUser(null);

  if (!supabaseClient) {
    tasks = [];
    showTasks();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  renderUser(data.session?.user || null);
  await loadTodos();

  supabaseClient.auth.onAuthStateChange(async function (event, session) {
    renderUser(session?.user || null);
    await loadTodos();
  });
}

function setTodoNotice(message) {
  todoNotice.textContent = message;
}

function clearTodoNotice() {
  todoNotice.textContent = "";
}

function requireLoggedIn() {
  if (currentUser) {
    return true;
  }

  tasks = [];
  editingIndex = null;
  showTasks();
  setTodoNotice("请先登录后使用待办");
  return false;
}

async function loadTodos() {
  if (!supabaseClient || !currentUser) {
    tasks = [];
    editingIndex = null;
    showTasks();
    setTodoNotice(currentUser ? "Supabase 暂不可用" : "请先登录后使用待办");
    return;
  }

  const { data, error } = await supabaseClient
    .from("todos")
    .select("id,user_id,text,completed,created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: true });

  if (error) {
    tasks = [];
    editingIndex = null;
    showTasks();
    setTodoNotice("加载待办失败，请检查 Supabase todos 表和 RLS 策略");
    return;
  }

  tasks = data || [];
  editingIndex = null;
  clearTodoNotice();
  showTasks();
}

async function createTodo(text) {
  const { data, error } = await supabaseClient
    .from("todos")
    .insert({
      user_id: currentUser.id,
      text: text,
      completed: false
    })
    .select("id,user_id,text,completed,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function createTodos(todoTexts) {
  const { data, error } = await supabaseClient
    .from("todos")
    .insert(todoTexts.map(function (todoText) {
      return {
        user_id: currentUser.id,
        text: todoText,
        completed: false
      };
    }))
    .select("id,user_id,text,completed,created_at");

  if (error) {
    throw error;
  }

  return data || [];
}

async function updateTodo(id, changes) {
  const { data, error } = await supabaseClient
    .from("todos")
    .update(changes)
    .eq("id", id)
    .eq("user_id", currentUser.id)
    .select("id,user_id,text,completed,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function deleteTodo(id) {
  const { error } = await supabaseClient
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) {
    throw error;
  }
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

      taskTextElement.addEventListener("click", async function () {
        try {
          const updatedTask = await updateTodo(task.id, {
            completed: !task.completed
          });

          tasks[index] = updatedTask;
          clearTodoNotice();
          showTasks();
        } catch (error) {
          setTodoNotice("更新任务失败，请稍后重试");
        }
      });
    }

    const editButton = document.createElement("button");
    editButton.textContent = editingIndex === index ? "保存" : "编辑";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "删除";

    editButton.addEventListener("click", async function () {
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

      try {
        const updatedTask = await updateTodo(task.id, {
          text: newText
        });

        tasks[index] = updatedTask;
        editingIndex = null;
        clearTodoNotice();
        showTasks();
      } catch (error) {
        setTodoNotice("保存任务失败，请稍后重试");
      }
    });

    deleteButton.addEventListener("click", async function () {
      try {
        await deleteTodo(task.id);
        tasks.splice(index, 1);
        editingIndex = null;
        clearTodoNotice();
        showTasks();
      } catch (error) {
        setTodoNotice("删除任务失败，请稍后重试");
      }
    });

    taskItem.appendChild(taskTextElement);
    taskItem.appendChild(editButton);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });
}

async function addTask() {
  if (!requireLoggedIn()) {
    return;
  }

  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("请输入任务内容");
    return;
  }

  addButton.disabled = true;

  try {
    const newTask = await createTodo(taskText);
    tasks.push(newTask);
    clearTodoNotice();
    showTasks();
    taskInput.value = "";
    taskInput.focus();
  } catch (error) {
    setTodoNotice("添加任务失败，请稍后重试");
  } finally {
    addButton.disabled = false;
  }
}

addButton.addEventListener("click", function () {
  addTask();
});

userMenuButton.addEventListener("click", function () {
  openAuthModal();
});

closeAuthButton.addEventListener("click", function () {
  closeAuthModal();
});

authModal.addEventListener("click", function (event) {
  if (event.target === authModal) {
    closeAuthModal();
  }
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
  if (!requireLoggedIn()) {
    return;
  }

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
        "Content-Type": "application/json",
        "x-api-key": API_ACCESS_KEY
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

    const newTasks = await createTodos(data.tasks);

    tasks = tasks.concat(newTasks);
    clearTodoNotice();
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

clearButton.addEventListener("click", async function () {
  if (!requireLoggedIn()) {
    return;
  }

  const isConfirmed = confirm("确定要清空全部任务吗？");

  if (!isConfirmed) {
    return;
  }

  clearButton.disabled = true;

  try {
    const taskIds = tasks.map(function (task) {
      return task.id;
    });

    if (taskIds.length > 0) {
      const { error } = await supabaseClient
        .from("todos")
        .delete()
        .in("id", taskIds)
        .eq("user_id", currentUser.id);

      if (error) {
        throw error;
      }
    }

    tasks = [];
    editingIndex = null;
    clearTodoNotice();
    showTasks();
  } catch (error) {
    setTodoNotice("清空任务失败，请稍后重试");
  } finally {
    clearButton.disabled = false;
  }
});

showTasks();
initAuth();
