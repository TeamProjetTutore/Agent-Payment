import { useEffect, useState } from "react";
import { getAgents, createAgent, deleteAgent, updateAgent } from "../services/agents.js";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", salary: "" });
  const [editingId, setEditingId] = useState(null);

  function loadAgents() {
    getAgents().then((res) => setAgents(res.data));
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
        ...form,
        salary: parseFloat(form.salary) || 0
    };

    if (editingId) {
        updateAgent(editingId, data).then(() => {
            setForm({ name: "", role: "", salary: "" });
            setEditingId(null);
            loadAgents();
        });
    } else {
        createAgent(data).then(() => {
            setForm({ name: "", role: "", salary: "" });
            loadAgents();
        });
    }
  }

  function handleEdit(agent) {
      setForm({ name: agent.name, role: agent.role, salary: agent.salary });
      setEditingId(agent.id);
  }

  function handleCancelEdit() {
      setForm({ name: "", role: "", salary: "" });
      setEditingId(null);
  }

  function handleDelete(id) {
    if (confirm("Delete this agent?")) {
      deleteAgent(id).then(loadAgents);
    }
  }

  return (
    <>
      <h2>Agents</h2>

      {/* CREATE / EDIT FORM */}
      <form className="form-inline" onSubmit={handleSubmit} style={{ marginBottom: "20px", justifyContent: "center" }}>
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
        <input
          id="salary"
          name="salary"
          type="number"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          required
        />
        <button type="submit" className="btn" style={{ backgroundColor: "#1e3c72", color: "white" }}>
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
            <button type="button" className="btn" onClick={handleCancelEdit} style={{ marginLeft: "10px", backgroundColor: "#6c757d", color: "white" }}>
                Cancel
            </button>
        )}
      </form>

      {/* LIST */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.role}</td>
                <td>${a.salary?.toLocaleString() || 0}</td>
                <td>
                  <button className="btn btn-edit" onClick={() => handleEdit(a)} style={{ marginRight: "10px" }}>
                      <span className="desktop-only">Edit</span>
                      <FaEdit className="mobile-only" />
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(a.id)}>
                      <span className="desktop-only">Delete</span>
                      <FaTrash className="mobile-only" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
