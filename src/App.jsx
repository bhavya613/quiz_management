import React, { useState } from "react";
import QuizList from "./Components/QuizList";
import QuizQuestions from "./Components/QuizQuestions";
import AddQuestion from "./Components/AddQuestion";
import CreateQuiz from "./Components/CreateQuiz";
import Leaderboard from "./Components/Leaderboard";
import Result from "./Components/Result";
import "./App.css";

function App() {
  const [quizId, setQuizId] = useState(null);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState("home");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const toast = (message, type = "success") => {
    setToastMsg(message);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const resetQuiz = () => {
    setQuizId(null);
    setResult(null);
    setPage("home");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div className="brand-copy">
            <h1>QuizFlow</h1>
            <p>Fast, polished quizzes for quick learning.</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`button-ghost ${page === "home" ? "active" : ""}`}
            onClick={() => setPage("home")}
          >
            Browse quizzes
          </button>
          <button
            className={`button-ghost ${page === "add-question" ? "active" : ""}`}
            onClick={() => setPage("add-question")}
          >
            Add question
          </button>
          <button
            className={`button-ghost ${page === "create-quiz" ? "active" : ""}`}
            onClick={() => setPage("create-quiz")}
          >
            Create quiz
          </button>
          <button
            className={`button-ghost ${page === "leaderboard" ? "active" : ""}`}
            onClick={() => setPage("leaderboard")}
          >
            Leaderboard
          </button>
        </div>
      </header>

      <main className="page-content">
        {!quizId && !result && page === "home" && <QuizList startQuiz={setQuizId} />}
        {page === "add-question" && <AddQuestion />}
        {page === "create-quiz" && <CreateQuiz />}
        {page === "leaderboard" && <Leaderboard />}
        {quizId && !result && (
          <QuizQuestions
            quizId={quizId}
            toast={toast}
            showResult={(score, review) => setResult({ score, review })}
            restart={() => setQuizId(null)}
          />
        )}
        {result && <Result result={result} restart={resetQuiz} />}
      </main>
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          padding: "12px 18px",
          borderRadius: 14,
          background: toastType === "success" ? "#4dffa0" : "#ff6d6d",
          color: "#0a0a0f",
          fontWeight: 700,
          boxShadow: "0 24px 40px rgba(0,0,0,0.25)",
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default App;