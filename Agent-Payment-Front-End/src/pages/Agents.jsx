import { useEffect, useState } from "react";
import { getAgents, createAgent, deleteAgent } from "../services/agents";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ name: "", role: "" });

  function loadAgents() {
    getAgents().then((res) => setAgents(res.data));
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    createAgent(form).then(() => {
      setForm({ name: "", role: "" });
      loadAgents();
    });
  }

  function handleDelete(id) {
    if (confirm("Delete this agent?")) {
      deleteAgent(id).then(loadAgents);
    }
  }

  return (
    <>
      <h2>Agents</h2>

      {/* CREATE */}
      <form className="form-inline" onSubmit={handleSubmit}>
        <input
          id="name"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          id="role"
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        />
        <button>Add</button>
      </form>

      {/* LIST */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.role}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(a.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
