import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(() => alert("Erro ao carregar tarefas"))
      .finally(() => setLoading(false));
  }, []);

  function handleCreateOrUpdate(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description,
      completed,
    };

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
        })
        .catch(() => alert("Erro ao atualizar tarefa"))
        .finally(() => setSaving(false));
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks([...tasks, newTask]);
        resetForm();
      })
      .catch(() => alert("Erro ao criar tarefa"))
      .finally(() => setSaving(false));
  }

  function handleEdit(task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setCompleted(task.completed);
  }

  function toggleCompleted(task) {
    setSaving(true);

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
      })
      .catch(() => alert("Erro ao alterar status"))
      .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    setSaving(true);

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch(() => alert("Erro ao deletar tarefa"))
      .finally(() => setSaving(false));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCompleted(false);
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Carregando aplicação...</p>
      </div>
    );
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
          disabled={saving}
        />

        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={saving}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Salvando..."
            : editingId
            ? "Salvar alterações"
            : "Adicionar"}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel"
            onClick={resetForm}
            disabled={saving}
          >
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
                  disabled={saving}
                />
                <span className="checkmark"></span>
              </label>

              <div className="task-text">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>
            </div>

            <div className="actions">
              <button onClick={() => handleEdit(task)} disabled={saving}>
                ✏️
              </button>
              <button onClick={() => handleDelete(task.id)} disabled={saving}>
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
