document.addEventListener('DOMContentLoaded', function() {
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
      window.location.reload();
    });
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const todoId = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;

      await fetch(`/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrf
        }
      });
      window.location.reload();
    });
  });
});
