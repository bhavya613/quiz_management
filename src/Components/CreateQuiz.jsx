import React, { useState } from "react";
import { createQuiz } from "../services/api";

const CreateQuiz = () => {
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setMessage("Please enter a quiz title.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await createQuiz({ title: form.title.trim(), description: form.description.trim() });
      setMessage("Quiz created successfully. You can now add questions.");
      setForm({ title: "", description: "" });
    } catch (error) {
      console.error(error);
      setMessage("Unable to create quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="quiz-screen">
      <div className="card">
        <div className="section-head">
          <span className="eyebrow">Create quiz</span>
          <h2>Make a new quiz</h2>
        </div>

        <div className="form-grid">
          <label>
            Quiz title
            <input
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Enter quiz title"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Optional quiz description"
            />
          </label>

          <div className="actions-row" style={{ marginTop: 0 }}>
            <button className="button-solid" type="button" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create quiz"}
            </button>
          </div>

          {message && <div className="message-box">{message}</div>}
        </div>
      </div>
    </section>
  );
};

export default CreateQuiz;
