async function updateTodo(id, currentCompleted) {
  try {
    const response = await fetch(`/todos/${id}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !currentCompleted }), // Send the toggled status
    });

    if (!response.ok) {
      console.error("Failed to toggle todo status:", response.status);
      return;
    }

    const updatedTodo = await response.json();
    console.log("Todo updated:", updatedTodo);
    window.location.reload(); // Reload to reflect the change
  } catch (err) {
    console.error("Error toggling todo:", err);
  }
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
    await fetch(`/todos/${id}`, {
      method: "PUT",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !completed }), // Toggle the status
    });
    window.location.reload();
  }
