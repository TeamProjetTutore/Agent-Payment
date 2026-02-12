import { useEffect, useState } from "react";
import { getPayments, createPayment } from "../services/payments";
import { getAgents } from "../services/agents";

export default function Payments() {

  const [payments, setPayments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    agent_id: "",
    amount: "",
    status: "Paid",
  });

  // 🔹 LOAD DATA
  async function loadData() {
    setLoading(true);

    try {
      const paymentsRes = await getPayments();
      const paymentsData = paymentsRes?.data;

      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      } else if (Array.isArray(paymentsData?.data)) {
        setPayments(paymentsData.data);
      } else if (Array.isArray(paymentsData?.payments)) {
        setPayments(paymentsData.payments);
      } else {
        console.warn("⚠️ Payments structure unexpected:", paymentsData);
        setPayments([]);
      }

      const agentsRes = await getAgents();
      const agentsData = agentsRes?.data;

      if (Array.isArray(agentsData)) {
        setAgents(agentsData);
      } else if (Array.isArray(agentsData?.data)) {
        setAgents(agentsData.data);
      } else {
        console.warn("⚠️ Agents structure unexpected:", agentsData);
        setAgents([]);
      }

    } catch (error) {
      console.error("❌ Error loading data:", error);
      setPayments([]);
      setAgents([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 SUBMIT
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await createPayment({
        ...form,
        amount: Number(form.amount),
      });

      setForm({
        agent_id: "",
        amount: "",
        status: "Paid",
      });

      loadData();
    } catch (error) {
      console.error("❌ Error creating payment:", error);
    }
  }

  return (
    <>
      <h2>Payments</h2>

      {/* CREATE FORM */}
      <form className="form-inline" onSubmit={handleSubmit}>
        <select
          value={form.agent_id}
          onChange={(e) =>
            setForm({ ...form, agent_id: e.target.value })
          }
          required
        >
          <option value="">Select Agent</option>
          {(Array.isArray(agents) ? agents : []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          required
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <button type="submit">Add</button>
      </form>

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : (Array.isArray(payments) && payments.length > 0) ? (
            payments.map((p) => (
              <tr key={p.id}>
                <td>
                  {agents.find(a => a.id === p.agent_id)?.name || p.agent_id}
                </td>
                <td>{p.amount}</td>
                <td>{p.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No payments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
