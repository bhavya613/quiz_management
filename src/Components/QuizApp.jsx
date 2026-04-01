import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:9000";

// ── Fonts ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap";
document.head.appendChild(fontLink);

// ── Global CSS ─────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f;
    --surface: #13131c;
    --surface2: #1c1c2a;
    --border: #2a2a3d;
    --accent: #7c6dfa;
    --accent2: #fa6d9a;
    --text: #e8e8f0;
    --muted: #6b6b85;
    --success: #4dffa0;
    --error: #ff6d6d;
    --radius: 12px;
  }
  body { background: var(--bg); color: var(--text); font-family: "Syne", sans-serif; min-height: 100vh; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes scaleIn { from { transform:scale(.92); opacity:0; } to { transform:scale(1); opacity:1; } }
  .fade-up { animation: fadeUp .45s cubic-bezier(.22,.68,0,1.2) both; }
  .stagger-1 { animation-delay:.05s; }
  .stagger-2 { animation-delay:.1s; }
  .stagger-3 { animation-delay:.15s; }
  .stagger-4 { animation-delay:.2s; }
  input, textarea, select {
    background: var(--surface2); border: 1.5px solid var(--border); color: var(--text);
    border-radius: var(--radius); padding: 10px 14px; font-family: inherit; font-size: 14px;
    outline: none; transition: border .2s;
  }
  input:focus, textarea:focus { border-color: var(--accent); }
  button { cursor: pointer; font-family: inherit; }
`;
document.head.appendChild(style);

// ── Helpers ────────────────────────────────────────────────────────────────
const api = async (path, opts) => {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
};

// ── Reusable Components ────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", disabled, style: s }) => {
  const styles = {
    primary: {
      background: "var(--accent)", color: "#fff", border: "none",
      padding: "10px 22px", borderRadius: "8px", fontWeight: 700, fontSize: 14,
      transition: "opacity .2s, transform .15s", opacity: disabled ? .5 : 1,
    },
    secondary: {
      background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)",
      padding: "10px 22px", borderRadius: "8px", fontWeight: 700, fontSize: 14,
      transition: "background .2s",
    },
    ghost: {
      background: "transparent", color: "var(--muted)", border: "none",
      padding: "8px 14px", borderRadius: "8px", fontWeight: 600, fontSize: 13,
    },
    danger: {
      background: "var(--error)", color: "#fff", border: "none",
      padding: "10px 22px", borderRadius: "8px", fontWeight: 700, fontSize: 14,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles[variant], cursor: disabled ? "not-allowed" : "pointer", ...s }}
      onMouseEnter={e => { if (!disabled && variant === "primary") e.target.style.opacity = ".85"; }}
      onMouseLeave={e => { if (!disabled && variant === "primary") e.target.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style: s, className }) => (
  <div
    className={className}
    style={{
      background: "var(--surface)", border: "1.5px solid var(--border)",
      borderRadius: 16, padding: 24, ...s,
    }}
  >
    {children}
  </div>
);

const Tag = ({ children, color = "var(--accent)" }) => (
  <span style={{
    background: color + "20", color, fontSize: 11, fontFamily: "DM Mono, monospace",
    padding: "3px 10px", borderRadius: 99, fontWeight: 500, letterSpacing: "0.04em",
  }}>
    {children}
  </span>
);

const Spinner = () => (
  <div style={{
    width: 22, height: 22, border: "2.5px solid var(--border)",
    borderTop: "2.5px solid var(--accent)", borderRadius: "50%",
    animation: "spin .7s linear infinite", margin: "0 auto",
  }} />
);

const Toast = ({ msg, type }) => (
  msg ? (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      background: type === "success" ? "var(--success)" : "var(--error)",
      color: "#0a0a0f", padding: "12px 22px", borderRadius: 10,
      fontWeight: 700, fontSize: 14, animation: "scaleIn .25s ease both",
      boxShadow: "0 8px 32px rgba(0,0,0,.4)",
    }}>
      {msg}
    </div>
  ) : null
);

const NavBar = ({ page, setPage }) => {
  const links = [
    { id: "home", label: "Quizzes" },
    { id: "create-quiz", label: "Create Quiz" },
    { id: "add-question", label: "Add Question" },
  ];
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 40px", borderBottom: "1.5px solid var(--border)",
      background: "var(--surface)", position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>⚡</div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.02em" }}>QuizFlow</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => setPage(l.id)}
            style={{
              background: page === l.id ? "var(--accent)" : "transparent",
              color: page === l.id ? "#fff" : "var(--muted)",
              border: "none", padding: "8px 18px", borderRadius: 8,
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              transition: "all .2s", fontFamily: "inherit",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ── Pages ──────────────────────────────────────────────────────────────────

/* HOME — list quizzes */
const HomePage = ({ setPage, setActiveQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/quiz/all")
      .then(setQuizzes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Tag>All Quizzes</Tag>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1 }}>
          Pick a Quiz<br />
          <span style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent2))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>& Test Yourself</span>
        </h1>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}><Spinner /></div>
      ) : quizzes.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧩</div>
          <div style={{ color: "var(--muted)", fontWeight: 600 }}>No quizzes yet. Create one!</div>
        </Card>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {quizzes.map((q, i) => (
            <Card
              key={q.id}
              className={`fade-up stagger-${Math.min(i + 1, 4)}`}
              style={{
                cursor: "pointer", transition: "border-color .2s, transform .2s",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent)15, var(--accent2)15)",
              }} />
              <div style={{ marginBottom: 8 }}>
                <Tag color="var(--accent2)">ID #{q.id}</Tag>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{q.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                {q.description || "No description provided."}
              </p>
              <Btn
                onClick={() => { setActiveQuiz(q); setPage("take-quiz"); }}
                style={{ width: "100%" }}
              >
                Start Quiz →
              </Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* CREATE QUIZ */
const CreateQuizPage = ({ toast }) => {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast("Title is required", "error");
    setLoading(true);
    try {
      await api("/quiz/create", { method: "POST", body: JSON.stringify(form) });
      toast("Quiz created! 🎉", "success");
      setForm({ title: "", description: "" });
    } catch {
      toast("Failed to create quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <Tag>New Quiz</Tag>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", marginTop: 8 }}>
          Create a Quiz
        </h1>
      </div>
      <Card className="fade-up stagger-1">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>Title *</label>
            <input
              style={{ width: "100%" }}
              placeholder="e.g. JavaScript Basics"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>Description</label>
            <textarea
              style={{ width: "100%", minHeight: 90, resize: "vertical" }}
              placeholder="A brief description of the quiz..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <Btn onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Creating..." : "Create Quiz"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};

/* ADD QUESTION */
const AddQuestionPage = ({ toast }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    questionTitle: "", option1: "", option2: "", option3: "", option4: "",
    correctAnswer: "", quizId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api("/quiz/all").then(setQuizzes); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    const required = ["questionTitle", "option1", "option2", "correctAnswer", "quizId"];
    if (required.some(k => !form[k])) return toast("Fill all required fields", "error");
    setLoading(true);
    try {
      await api("/question/add", {
        method: "POST",
        body: JSON.stringify({ ...form, quizId: parseInt(form.quizId) }),
      });
      toast("Question added! ✅", "success");
      setForm({ questionTitle: "", option1: "", option2: "", option3: "", option4: "", correctAnswer: "", quizId: form.quizId });
    } catch {
      toast("Failed to add question", "error");
    } finally {
      setLoading(false);
    }
  };

  const optionFields = [
    { key: "option1", label: "Option A *" },
    { key: "option2", label: "Option B *" },
    { key: "option3", label: "Option C" },
    { key: "option4", label: "Option D" },
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <Tag>Questions</Tag>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", marginTop: 8 }}>
          Add a Question
        </h1>
      </div>
      <Card className="fade-up stagger-1">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>Quiz *</label>
            <select style={{ width: "100%" }} value={form.quizId} onChange={set("quizId")}>
              <option value="">— Select a quiz —</option>
              {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Question *</label>
            <textarea
              style={{ width: "100%", minHeight: 72, resize: "vertical" }}
              placeholder="Type the question here..."
              value={form.questionTitle}
              onChange={set("questionTitle")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {optionFields.map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  style={{ width: "100%" }}
                  placeholder={label.replace(" *", "")}
                  value={form[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
          </div>

          <div>
            <label style={labelStyle}>Correct Answer *</label>
            <select style={{ width: "100%" }} value={form.correctAnswer} onChange={set("correctAnswer")}>
              <option value="">— Select correct answer —</option>
              {[form.option1, form.option2, form.option3, form.option4]
                .filter(Boolean)
                .map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
          </div>

          <Btn onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Saving..." : "Add Question"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};

const labelStyle = {
  fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block",
  marginBottom: 6, letterSpacing: ".06em", textTransform: "uppercase",
};

/* TAKE QUIZ */
const TakeQuizPage = ({ quiz, setPage, toast }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api(`/quiz/questions/${quiz.id}`)
      .then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => { toast("Failed to load questions", "error"); setLoading(false); });
  }, [quiz.id, toast]);

  const handleSelect = (qId, option) => {
    setAnswers(p => ({ ...p, [qId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length)
      return toast("Answer all questions first", "error");
    setSubmitting(true);
    try {
      const responses = Object.entries(answers).map(([id, response]) => ({
        id: parseInt(id), response,
      }));
      const s = await api("/quiz/submit", { method: "POST", body: JSON.stringify(responses) });
      setScore(s);
    } catch {
      toast("Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}><Spinner /></div>
  );

  if (score !== null) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚";
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <Card className="fade-up" style={{ padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{grade}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Quiz Complete!</h2>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>{quiz.title}</p>
          <div style={{
            fontSize: 64, fontWeight: 800,
            background: "linear-gradient(90deg, var(--accent), var(--accent2))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1, marginBottom: 6,
          }}>
            {score}/{questions.length}
          </div>
          <div style={{
            fontSize: 14, color: "var(--muted)", fontFamily: "DM Mono, monospace",
            marginBottom: 32,
          }}>
            {pct}% correct
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Btn onClick={() => { setScore(null); setAnswers({}); setCurrent(0); }}>
              Retake
            </Btn>
            <Btn variant="secondary" onClick={() => setPage("home")}>
              All Quizzes
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
      <Card>
        <div style={{ padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
          <p style={{ color: "var(--muted)", fontWeight: 600, marginBottom: 20 }}>
            No questions added to this quiz yet.
          </p>
          <Btn variant="secondary" onClick={() => setPage("home")}>Go Back</Btn>
        </div>
      </Card>
    </div>
  );

  const q = questions[current];
  const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
  const answered = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Tag>{quiz.title}</Tag>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
            Question {current + 1} of {questions.length}
          </h2>
        </div>
        <Btn variant="ghost" onClick={() => setPage("home")}>✕ Exit</Btn>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, background: "var(--surface2)", borderRadius: 99, marginBottom: 28, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${((current + 1) / questions.length) * 100}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent2))",
          borderRadius: 99, transition: "width .4s ease",
        }} />
      </div>

      {/* Question Card */}
      <Card className="fade-up" key={current} style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 24 }}>
          {q.questionTitle}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt, i) => {
            const selected = answers[q.id] === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(q.id, opt)}
                style={{
                  background: selected ? "var(--accent)18" : "var(--surface2)",
                  border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  color: selected ? "var(--accent)" : "var(--text)",
                  borderRadius: 10, padding: "12px 16px",
                  textAlign: "left", fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 12,
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = "var(--accent)80"; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: selected ? "var(--accent)" : "var(--border)",
                  color: selected ? "#fff" : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>
                  {["A", "B", "C", "D"][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <Btn variant="secondary" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>
          ← Prev
        </Btn>
        <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "DM Mono, monospace" }}>
          {answered}/{questions.length} answered
        </span>
        {current < questions.length - 1 ? (
          <Btn onClick={() => setCurrent(c => c + 1)}>Next →</Btn>
        ) : (
          <Btn onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Btn>
        )}
      </div>
    </div>
  );
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");

  const toast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <NavBar page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} setActiveQuiz={setActiveQuiz} />}
      {page === "create-quiz" && <CreateQuizPage toast={toast} />}
      {page === "add-question" && <AddQuestionPage toast={toast} />}
      {page === "take-quiz" && activeQuiz && (
        <TakeQuizPage quiz={activeQuiz} setPage={setPage} toast={toast} />
      )}
      <Toast msg={toastMsg} type={toastType} />
    </div>
  );
}
