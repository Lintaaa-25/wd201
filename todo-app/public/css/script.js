document.addEventListener('DOMContentLoaded', function() {
  // For updating checkbox status
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const todoId = e.target.dataset.id;
      const completed = e.target.checked;
      const csrf = e.target.dataset.csrf;

      await fetch(`/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrf
        },
        body: JSON.stringify({ completed })
      });
      location.reload();
    });
  });

  // For deleting todos
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const todoId = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;

      const response = await fetch(`/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrf
        }
      });

      if (response.ok) {
        document.getElementById(`todo-${todoId}`).remove(); // Remove todo item from page
      } else {
        alert('Failed to delete the todo item.');
      }
    });
  });
});
