const taskList = document.querySelector(".tasks-list");
const taskInput = document.querySelector(".task-input");
const taskAdd = document.querySelector(".task-add");
const markAll = document.querySelector(".mark-all");
const deleteAll = document.querySelector(".delete-all");
const taskDeleteDialog = document.querySelector(".task-delete-confirmation");
const deleteAllDialog = document.querySelector(".delete-all-confirmation");

let taskToDelete = null;
let animationTimeout;

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
    taskList.innerHTML += `<li class="task"><span class="task-complete" role="checkbox" aria-checked="false" tabindex="0"></span><span class="task-text"></span><button class="task-delete"><i class="task-delete-icon fa-solid fa-xmark"></i></button></li>`;
    taskList.lastElementChild.querySelector(".task-text").textContent =
      taskInput.value;
    taskInput.value = "";
    markAll.textContent = "Mark All";
  }

  taskInput.focus();
}

taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-complete")) {
    toggleTask(e.target.parentElement);
  }

  if (e.target.classList.contains("task-delete-icon")) {
    taskToDelete = e.target.parentElement.parentElement;

    taskDeleteDialog.showModal();
  }
});

taskDeleteDialog.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-delete-confirmation"))
    taskDeleteDialog.close();
});

taskDeleteDialog.addEventListener("close", () => {
  if (taskDeleteDialog.returnValue === "yes") {
    taskToDelete.classList.add("deleted");
    taskToDelete.style.display = "none";

    if (taskToDelete.nextElementSibling) {
      taskToDelete.nextElementSibling.addEventListener("animationend", () => {
        taskList.removeChild(taskToDelete);

        Array.from(taskList.children).forEach(
          (task) => (task.style.animation = ""),
        );

        taskToDelete = null;
      });
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

  tasks.forEach((task) => {
    if (!allMarked && task.classList.contains("complete")) return;
    toggleTask(task);
  });

  markAll.textContent = allMarked ? "Mark All" : "Unmark All";
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
  }
});
