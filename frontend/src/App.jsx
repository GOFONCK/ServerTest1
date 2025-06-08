import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [rentUntil, setRentUntil] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editRentUntil, setEditRentUntil] = useState("");

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 20000);
    return () => clearInterval(interval);
  }, []);

  async function fetchServers() {
    try {
      const res = await axios.get("http://localhost:8000/servers/");
      setServers(res.data);
    } catch (e) {
      console.error("Ошибка при загрузке серверов:", e);
    }
  }

  async function addServer() {
    if (!name || !url || !rentUntil) {
      alert("Заполните все поля");
      return;
    }
    try {
      await axios.post("http://localhost:8000/servers/", {
        name,
        url,
        rent_until: rentUntil,
      });
      setName("");
      setUrl("");
      setRentUntil("");
      fetchServers();
    } catch (e) {
      alert("Ошибка при добавлении сервера");
      console.error(e);
    }
  }

  async function deleteServer(id) {
    if (!window.confirm("Удалить этот сервер?")) return;
    try {
      await axios.delete(`http://localhost:8000/servers/${id}`);
      fetchServers();
    } catch (e) {
      alert("Ошибка при удалении сервера");
      console.error(e);
    }
  }

  function startEdit(server) {
    setEditId(server.id);
    setEditName(server.name);
    setEditUrl(server.url);
    setEditRentUntil(server.rent_until);
  }

  async function saveEdit() {
    if (!editName || !editUrl || !editRentUntil) {
      alert("Заполните все поля");
      return;
    }
    try {
      await axios.put(`http://localhost:8000/servers/${editId}`, {
        name: editName,
        url: editUrl,
        rent_until: editRentUntil,
      });
      setEditId(null);
      fetchServers();
    } catch (e) {
      alert("Ошибка при обновлении сервера");
      console.error(e);
    }
  }

  function cancelEdit() {
    setEditId(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Мониторинг серверов</h1>

      <div
        style={{
          padding: 20,
          marginBottom: 40,
          borderRadius: 8,
          backgroundColor: "#f7f9fc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: 20, color: "#333" }}>Добавить сервер</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <input
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <input
            placeholder="URL сервера"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              flex: "1 1 300px",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <input
            type="date"
            placeholder="Дата окончания аренды"
            value={rentUntil}
            onChange={(e) => setRentUntil(e.target.value)}
            style={{
              flex: "0 0 180px",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <button
            onClick={addServer}
            style={{
              padding: "10px 24px",
              backgroundColor: "#007bff",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              flex: "0 0 120px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
          >
            Добавить
          </button>
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ backgroundColor: "#007bff", color: "white" }}>
          <tr>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Название</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>URL</th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>Аренда до</th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>Статус</th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {servers.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#666" }}>
                Серверы не найдены
              </td>
            </tr>
          )}
          {servers.map((s) => (
            <tr
              key={s.id}
              style={{
                backgroundColor: s.is_active ? "#e6ffe6" : "#ffe6e6",
                borderBottom: "1px solid #ddd",
              }}
            >
              {editId === s.id ? (
                <>
                  <td style={{ padding: 10 }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 14,
                      }}
                    />
                  </td>
                  <td style={{ padding: 10 }}>
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 14,
                      }}
                    />
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    <input
                      type="date"
                      value={editRentUntil}
                      onChange={(e) => setEditRentUntil(e.target.value)}
                      style={{
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 14,
                        width: "100%",
                      }}
                    />
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    {s.is_active ? "🟢 Активен" : "🔴 Неактивен"}
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    <button
                      onClick={saveEdit}
                      style={{
                        marginRight: 8,
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Отмена
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: 12 }}>{s.name}</td>
                  <td style={{ padding: 12 }}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {s.url}
                    </a>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>{s.rent_until}</td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      fontWeight: "bold",
                      color: s.is_active ? "#198754" : "#dc3545",
                    }}
                  >
                    {s.is_active ? "🟢 Активен" : "🔴 Неактивен"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => startEdit(s)}
                      style={{
                        marginRight: 8,
                        padding: "6px 12px",
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteServer(s.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
