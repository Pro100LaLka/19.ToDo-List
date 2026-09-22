const taskList = document.querySelector(".tasks-list");
const taskInput = document.querySelector(".task-input");
const taskAdd = document.querySelector(".task-add");
const markAll = document.querySelector(".mark-all");
const deleteAll = document.querySelector(".delete-all");
const taskDeleteDialog = document.querySelector(".task-delete-confirmation");
const deleteAllDialog = document.querySelector(".delete-all-confirmation");

let taskToDelete = null;
let animationTimeout;

const localStorageManager = {
  loadLocalStorage: function () {
    const tasks = JSON.parse(localStorage.getItem("tasks-old"));
    if (tasks === null) return;

    if (tasks.length !== 0) {
      tasks.forEach((task) => {
        taskList.innerHTML += `<li class="task${task.isComplete ? " complete" : ""}"><span class="task-complete${task.isComplete ? " checked" : ""}" role="checkbox" aria-checked="${task.isComplete ? "true" : "false"}" tabindex="0"></span><span class="task-text"></span><button class="task-edit"><i class="fa-solid fa-pen-to-square"></i></button><button class="task-delete"><i class="task-delete-icon fa-regular fa-trash-can"></i></button></li>`;
        taskList.lastElementChild.querySelector(".task-text").textContent =
          task.text;
      });
    }
  },

  addTaskToLocalStorage: function (taskText, isComplete) {
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks-old"));
    localStorageTasks.push({ text: taskText, isComplete: isComplete });
    localStorage.setItem("tasks-old", JSON.stringify(localStorageTasks));
  },

  removeTaskFromLocalStorage: function (index) {
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks-old"));
    localStorageTasks.splice(index, 1);
    localStorage.setItem("tasks-old", JSON.stringify(localStorageTasks));
  },

  updateTaskStatusInLocalStorage: function (index) {
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks-old"));
    localStorageTasks[index].isComplete = !localStorageTasks[index].isComplete;
    localStorage.setItem("tasks-old", JSON.stringify(localStorageTasks));
  },

  updateTaskTextInLocalStorage: function (index, newText) {
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks-old"));
    localStorageTasks[index].text = newText;
    localStorage.setItem("tasks-old", JSON.stringify(localStorageTasks));
  },
};

if (localStorage.getItem("tasks-old") === null)
  localStorage.setItem("tasks-old", JSON.stringify([]));

localStorageManager.loadLocalStorage();

function toggleTask(target) {
  const toggleBtn = target.querySelector(".task-complete");
  const isChecked = toggleBtn.getAttribute("aria-checked") === "true";

  toggleBtn.setAttribute("aria-checked", String(!isChecked));
  toggleBtn.classList.toggle("checked");
  target.classList.toggle("complete");

  target.classList.add("animate");
  target.addEventListener(
    "animationend",
    () => {
      target.classList.remove("animate");
    },
    { once: true },
  );

  markAll.textContent = "Mark All";
}

// joke feature ------------------------------------------------
const jokeKeywords = ["P3TRI", "DRAKE"];
function removeJoke() {
  taskInput.style.color = "black";
  taskInput.value = "";
  taskInput.removeEventListener("focus", removeJoke);
}
function handleJoke() {
  for (const keyword of jokeKeywords) {
    if (taskInput.value.toLowerCase().includes(keyword.toLowerCase())) {
      taskInput.value = `${keyword} IS NOT ALLOWED HERE!`;
      taskInput.style.color = "red";
      taskInput.blur();
      taskInput.addEventListener("focus", removeJoke);
      return true;
    }
  }
}
// joke feature ------------------------------------------------

function addTask() {
  // joke feature
  if (handleJoke()) return;
  //joke feature

  if (taskInput.value.length != 0) {
    taskList.innerHTML += `<li class="task"><span class="task-complete" role="checkbox" aria-checked="false" tabindex="0"></span><span class="task-text"></span><button class="task-edit"><i class="fa-solid fa-pen-to-square"></i></button><button class="task-delete"><i class="task-delete-icon fa-regular fa-trash-can"></i></button></li>`;
    taskList.lastElementChild.querySelector(".task-text").textContent =
      taskInput.value;
    localStorageManager.addTaskToLocalStorage(taskInput.value, false);
    taskInput.value = "";
    markAll.textContent = "Mark All";
  }

  taskInput.focus();
}

function editTask(task) {
  const previousText = task.querySelector(".task-text").textContent;
  task.innerHTML = `<span class="task-complete" role="checkbox" aria-checked="false" tabindex="0"></span><textarea name="change-field" id="change-field" class="change-field" rows="1"></textarea><button class="save-changes"><i class="fa-solid fa-check-double"></i></button><button class="task-delete"><i class="task-delete-icon fa-regular fa-trash-can"></i></button>`;
  const changeField = task.querySelector(".change-field");

  changeField.focus();
  changeField.value = previousText;
  changeField.style.height = "auto";
  changeField.style.height = changeField.scrollHeight + "px";

  changeField.addEventListener("input", (e) => {
    changeField.style.height = "auto";
    changeField.style.height = changeField.scrollHeight + "px";
  });

  changeField.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") changeField.blur();
  });

  changeField.addEventListener("blur", (e) => {
    const newText = changeField.value;

    if (newText.length === 0) {
      localStorageManager.removeTaskFromLocalStorage(
        Array.from(taskList.children).indexOf(task),
      );
      taskList.removeChild(task);
      return;
    }

    localStorageManager.updateTaskTextInLocalStorage(
      Array.from(taskList.children).indexOf(task),
      newText,
    );

    task.innerHTML = `<span class="task-complete" role="checkbox" aria-checked="false" tabindex="0"></span><span class="task-text"></span><button class="task-edit"><i class="fa-solid fa-pen-to-square"></i></button><button class="task-delete"><i class="task-delete-icon fa-regular fa-trash-can"></i></button>`;
    task.querySelector(".task-text").textContent = newText;
  });
}

taskList.addEventListener("click", (e) => {
  const target = e.target;
  const task = target.closest(".task");
  const classList = target.classList;

  if (classList.contains("task-complete")) {
    toggleTask(task);
    localStorageManager.updateTaskStatusInLocalStorage(
      Array.from(taskList.children).indexOf(task),
    );
    return;
  }

  if (
    target.closest("button") !== null &&
    target.closest("button").classList.contains("task-edit") &&
    !task.classList.contains("complete")
  ) {
    editTask(task);
    return;
  }

  if (
    classList.contains("task-delete-icon") ||
    classList.contains("task-delete")
  ) {
    taskToDelete = task;
    taskDeleteDialog.showModal();
    return;
  }
});

taskDeleteDialog.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-delete-confirmation"))
    taskDeleteDialog.close();
});

function addAnimationend() {
  const nextElement = taskToDelete.nextElementSibling;

  taskList.removeChild(taskToDelete);
  Array.from(taskList.children).forEach((task) => (task.style.animation = ""));

  taskToDelete = null;
  nextElement.removeEventListener("animationend", addAnimationend);
}

taskDeleteDialog.addEventListener("close", () => {
  if (taskDeleteDialog.returnValue === "yes") {
    localStorageManager.removeTaskFromLocalStorage(
      Array.from(taskList.children).indexOf(taskToDelete),
    );

    taskToDelete.classList.add("deleted");
    taskToDelete.style.display = "none";

    if (taskToDelete.nextElementSibling) {
      taskToDelete.nextElementSibling.addEventListener(
        "animationend",
        addAnimationend,
      );
    } else {
      taskList.removeChild(taskToDelete);

      Array.from(taskList.children).forEach(
        (task) => (task.style.animation = ""),
      );

      taskToDelete = null;
    }
  }
});

taskAdd.addEventListener("click", () => addTask());

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

taskInput.addEventListener("input", () => {
  if (taskInput.value.length === taskInput.maxLength) {
    taskInput.style.outline = "2px solid red";
  } else if (taskInput.style.outline !== "none")
    taskInput.style.outline = "none";
});

markAll.addEventListener("click", () => {
  const tasks = Array.from(taskList.children);
  const allMarked = tasks.every((task) => task.classList.contains("complete"));

  if (tasks.length === 0) return;

  tasks.forEach((task) => {
    if (!allMarked && task.classList.contains("complete")) return;
    toggleTask(task);
  });

  markAll.textContent = allMarked ? "Mark All" : "Unmark All";

  const localStorageTasks = JSON.parse(localStorage.getItem("tasks-old"));
  if (!allMarked) {
    localStorageTasks.forEach((task) => (task.isComplete = true));
  } else localStorageTasks.forEach((task) => (task.isComplete = false));
  localStorage.setItem("tasks-old", JSON.stringify(localStorageTasks));
});

deleteAll.addEventListener("click", () => {
  deleteAllDialog.showModal();
  deleteAllDialog.querySelector(".no").focus();
});

deleteAllDialog.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-all-confirmation"))
    deleteAllDialog.close();
});

deleteAllDialog.addEventListener("close", () => {
  if (deleteAllDialog.returnValue === "yes") {
    taskList.innerHTML = "";
    markAll.textContent = "Mark All";

    localStorage.setItem("tasks-old", JSON.stringify([]));
  }
});
