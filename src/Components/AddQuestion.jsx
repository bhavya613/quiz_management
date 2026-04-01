import React, { useEffect, useState } from "react";
import { fetchQuizzes, fetchQuestions, addQuestion, deleteQuestion } from "../services/api";

const questionTypes = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Single Answer" },
];

const AddQuestion = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [form, setForm] = useState({
    quizId: "",
    questionTitle: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
  });

  const loadQuestions = async (quizId) => {
    if (!quizId) {
      setQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    try {
      const res = await fetchQuestions(parseInt(quizId, 10));
      setQuestions(res.data);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuizzes()
      .then(res => setQuizzes(res.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoadingQuizzes(false));
  }, []);

  useEffect(() => {
    loadQuestions(form.quizId);
  }, [form.quizId]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setForm({
      quizId: "",
      questionTitle: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
    });
    setQuestionType("multiple-choice");
  };

  const handleDeleteQuestion = async (questionId) => {
    setSaving(true);
    setMessage(null);

    try {
      await deleteQuestion(questionId);
      setMessage("Question deleted successfully.");
      await loadQuestions(form.quizId);
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete question. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!form.quizId) return setMessage("Select a quiz first.");
    if (!form.questionTitle.trim()) return setMessage("Enter the question text.");

    if (questionType === "multiple-choice") {
      if (!form.option1 || !form.option2 || !form.correctAnswer) {
        return setMessage("Provide at least two options and choose the correct answer.");
      }
    }

    if (questionType === "true-false") {
      if (!form.correctAnswer) {
        return setMessage("Choose the correct true/false answer.");
      }
    }

    if (questionType === "short-answer" && !form.correctAnswer.trim()) {
      return setMessage("Enter the correct answer for the short-answer question.");
    }

    setSaving(true);
    setMessage(null);

    try {
      await addQuestion({
        quizId: parseInt(form.quizId, 10),
        questionTitle: form.questionTitle,
        questionType,
        option1: questionType === "multiple-choice" ? form.option1 : undefined,
        option2: questionType === "multiple-choice" ? form.option2 : undefined,
        option3: questionType === "multiple-choice" ? form.option3 : undefined,
        option4: questionType === "multiple-choice" ? form.option4 : undefined,
        correctAnswer: form.correctAnswer,
      });
      setMessage("Question added successfully.");
      clearForm();
      await loadQuestions(form.quizId);
    } catch (error) {
      console.error(error);
      setMessage("Failed to add question. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="quiz-screen">
      <div className="card">
        <div className="section-head">
          <span className="eyebrow">Add Question</span>
          <h2>Create a new quiz question</h2>
        </div>

        {loadingQuizzes ? (
          <p className="empty-state">Loading quizzes…</p>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <p>No quizzes found. Create a quiz in the backend first.</p>
          </div>
        ) : (
          <div className="form-grid">
            <label>
              Quiz
              <select value={form.quizId} onChange={setField("quizId")}>
                <option value="">Select quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>
            </label>

            <label>
              Question type
              <select value={questionType} onChange={(event) => setQuestionType(event.target.value)}>
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>

            <label>
              Question text
              <textarea
                value={form.questionTitle}
                onChange={setField("questionTitle")}
                placeholder="Enter the question statement"
              />
            </label>

            {questionType === "multiple-choice" && (
              <>
                <label>
                  Option 1
                  <input value={form.option1} onChange={setField("option1")} placeholder="First answer option" />
                </label>
                <label>
                  Option 2
                  <input value={form.option2} onChange={setField("option2")} placeholder="Second answer option" />
                </label>
                <label>
                  Option 3
                  <input value={form.option3} onChange={setField("option3")} placeholder="Optional third option" />
                </label>
                <label>
                  Option 4
                  <input value={form.option4} onChange={setField("option4")} placeholder="Optional fourth option" />
                </label>
                <label>
                  Correct answer
                  <select value={form.correctAnswer} onChange={setField("correctAnswer")}> 
                    <option value="">Pick the correct answer</option>
                    {[form.option1, form.option2, form.option3, form.option4]
                      .filter(Boolean)
                      .map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                  </select>
                </label>
              </>
            )}

            {questionType === "true-false" && (
              <label>
                Correct answer
                <select value={form.correctAnswer} onChange={setField("correctAnswer")}> 
                  <option value="">Choose correct answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </label>
            )}

            {questionType === "short-answer" && (
              <label>
                Correct answer
                <input value={form.correctAnswer} onChange={setField("correctAnswer")} placeholder="Enter the correct answer" />
              </label>
            )}

            <div className="actions-row" style={{ marginTop: 0 }}>
              <button className="button-solid" type="button" onClick={handleAddQuestion} disabled={saving}>
                {saving ? "Saving…" : "Save Question"}
              </button>
            </div>

            {message && <div className="message-box">{message}</div>}

            {form.quizId && (
              <div className="existing-questions" style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 14, color: "var(--text)" }}>Existing questions</h3>
                {loadingQuestions ? (
                  <div className="empty-state">
                    <p>Loading questions…</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="empty-state">
                    <p>No questions found for this quiz.</p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="question-row" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      marginBottom: 12,
                    }}>
                      <div>
                        <strong style={{ display: "block", color: "var(--text)", marginBottom: 6 }}>{q.questionTitle}</strong>
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>
                          {q.questionType === "short-answer" ? "Single answer" : q.questionType === "true-false" ? "True / False" : "Multiple choice"}
                        </span>
                      </div>
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AddQuestion;
