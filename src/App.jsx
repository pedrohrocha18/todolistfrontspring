import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [completed, setCompleted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  function handleCreateOrUpdate(e) {
    e.preventDefault();

    const payload = {
      title,
      description,
      completed,
    };

    // EDITAR
    if (editingId) {
      fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((updatedTask) => {
          setTasks(
            tasks.map((task) =>
              task.id === editingId ? updatedTask : task
            )
          );
          resetForm();
        });
      return;
    }

    // CRIAR
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks([...tasks, newTask]);
        resetForm();
      });
  }

  function handleEdit(task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setCompleted(task.completed);
  }

  function toggleCompleted(task) {
    fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        completed: !task.completed,
      }),
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks(
          tasks.map((t) => (t.id === task.id ? updatedTask : t))
        );
      });
  }

  function handleDelete(id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(() => {
      setTasks(tasks.filter((task) => task.id !== id));
    });
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCompleted(false);
    setEditingId(null);
  }

  return (
    <div className="container">
      <h1>📝 Todo List</h1>

      <form onSubmit={handleCreateOrUpdate} className="form">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button type="submit">
          {editingId ? "Salvar alterações" : "Adicionar"}
        </button>

        {editingId && (
          <button type="button" className="cancel" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task ${task.completed ? "done" : ""}`}
          >
            <div className="task-left">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleCompleted(task)}
                />
                <span className="checkmark"></span>
              </label>

              <div className="task-text">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>
            </div>

            <div className="actions">
              <button onClick={() => handleEdit(task)}>✏️</button>
              <button onClick={() => handleDelete(task.id)}>❌</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
