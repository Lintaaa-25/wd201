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

async function toggleTodo(id, completed) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  await fetch(`/todos/${id}/markAsCompleted`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      completed: !completed,  // Toggle the status
      _csrf: csrfToken,       // Include CSRF token
    }),
  });

  window.location.reload(); // Reload the page to reflect the changes
}
