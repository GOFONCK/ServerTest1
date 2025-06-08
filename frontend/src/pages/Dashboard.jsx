import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [servers, setServers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", url: "", rent_until: "" });
  const [newServer, setNewServer] = useState({ name: "", url: "", rent_until: "" });

  const fetchServers = async () => {
    const res = await api.get("/servers/");
    setServers(res.data);
  };

  const deleteServer = async (id) => {
    await api.delete(`/servers/${id}`);
    fetchServers();
  };

  const startEdit = (server) => {
    setEditId(server.id);
    setEditData({
      name: server.name,
      url: server.url,
      rent_until: server.rent_until,
    });
  };

  const saveEdit = async () => {
    await api.put(`/servers/${editId}`, null, {
      params: editData,
    });
    setEditId(null);
    fetchServers();
  };

  const addServer = async () => {
    if (!newServer.name || !newServer.url || !newServer.rent_until) {
      alert("Заполните все поля для нового сервера");
      return;
    }
    await api.post("/servers/", null, { params: newServer });
    setNewServer({ name: "", url: "", rent_until: "" });
    fetchServers();
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 10000); // автообновление
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Мониторинг серверов</h1>

      {/* Форма добавления */}
      <div className="mb-8 p-4 border rounded shadow bg-white">
        <h2 className="text-xl mb-4">Добавить новый сервер</h2>
        <input
          type="text"
          placeholder="Название"
          value={newServer.name}
          onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="text"
          placeholder="URL"
          value={newServer.url}
          onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="text"
          placeholder="Аренда до (например, 2026-05-31)"
          value={newServer.rent_until}
          onChange={(e) => setNewServer({ ...newServer, rent_until: e.target.value })}
          className="border p-2 w-full mb-4 rounded"
        />
        <button
          onClick={addServer}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Добавить сервер
        </button>
      </div>

      {/* Список серверов */}
      <div className="space-y-4">
        {servers.map((s) => (
          <div key={s.id} className="border p-4 rounded shadow bg-white">
            {editId === s.id ? (
              <div className="space-y-2">
                <input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="border p-2 w-full rounded"
                  placeholder="Название"
                />
                <input
                  value={editData.url}
                  onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                  className="border p-2 w-full rounded"
                  placeholder="URL"
                />
                <input
                  value={editData.rent_until}
                  onChange={(e) => setEditData({ ...editData, rent_until: e.target.value })}
                  className="border p-2 w-full rounded"
                  placeholder="Аренда до"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="bg-green-500 text-white px-4 py-2 rounded">
                    Сохранить
                  </button>
                  <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-4 py-2 rounded">
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="text-sm">{s.url}</div>
                <div>Аренда до: {s.rent_until}</div>
                <div className="mt-1">
                  Статус: {s.is_active ? "🟢 Активен" : "🔴 Неактивен"}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => startEdit(s)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => deleteServer(s.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
