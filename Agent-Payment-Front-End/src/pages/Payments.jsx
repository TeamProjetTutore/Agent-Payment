import { useEffect, useState } from "react";
import { getPayments, createPayment } from "../services/payments";
import { getAgents } from "../services/agents";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    agent_id: "",
    amount: "",
    status: "Paid",
  });

  function loadData() {
    getPayments().then((res) => setPayments(res.data));
    getAgents().then((res) => setAgents(res.data));
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    createPayment(form).then(() => {
      setForm({ agent_id: "", amount: "", status: "Paid" });
      loadData();
    });
  }

  return (
    <>
      <h2>Payments</h2>

      {/* CREATE */}
      <form className="form-inline" onSubmit={handleSubmit}>
        <select
          id="agent_id"
          name="agent_id"
          value={form.agent_id}
          onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
          required
        >
          <option value="">Select Agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        <select
          id="status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Paid</option>
          <option>Pending</option>
        </select>

        <button>Add</button>
      </form>

      {/* LIST */}
      <table className="table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.agent_id}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
