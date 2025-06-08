import { useState, useEffect } from "react";
import api from "../api";

export default function ServerForm({ onSave, editing, clearEdit }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [rentUntil, setRentUntil] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setUrl(editing.url);
      setRentUntil(editing.rent_until.slice(0, 10));
    }
  }, [editing]);

  const submit = async () => {
    if (editing) {
      await api.put(`/servers/${editing.id}`, null, {
        params: { name, url, rent_until: rentUntil }
      });
      clearEdit();
    } else {
      await api.post("/servers/", null, {
        params: { name, url, rent_until: rentUntil }
      });
    }
    setName(""); setUrl(""); setRentUntil("");
    onSave();
  };

  return (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="font-bold">{editing ? "Редактировать" : "Добавить сервер"}</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Название"
        className="w-full my-1 p-2 border rounded" />
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Ссылка"
        className="w-full my-1 p-2 border rounded" />
      <input type="date" value={rentUntil} onChange={e => setRentUntil(e.target.value)}
        className="w-full my-1 p-2 border rounded" />
      <button onClick={submit} className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
        {editing ? "Сохранить" : "Добавить"}
      </button>
    </div>
  );
}