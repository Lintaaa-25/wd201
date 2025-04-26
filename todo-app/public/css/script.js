async function updateTodo(id) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  await fetch(`/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _csrf: csrfToken }),
  });
  window.location.reload();
}

async function deleteTodo(id) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  await fetch(`/todos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _csrf: csrfToken }),
  });
  window.location.reload();
}
