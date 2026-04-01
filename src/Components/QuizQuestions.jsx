import React, { useEffect, useState } from "react";
import { fetchQuestions, submitQuiz } from "../services/api";

const QuizQuestions = ({ quizId, toast, showResult, restart }) => {
  const [questions, setQuestions] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetchQuestions(quizId)
      .then((res) => setQuestions(res.data))
      .catch((err) => {
        console.log(err);
        setQuestions([]);
      });
  }, [quizId]);

  const handleChange = (id, answer) => {
    setResponses((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return [...filtered, { id, response: answer }];
    });
  };

  const questionCount = questions?.length ?? 0;
  const answeredCount = (questions || []).filter((q) => {
    const response = responses.find((r) => r.id === q.id)?.response;
    return typeof response === "string" ? response.trim().length > 0 : response != null;
  }).length;

  const buildOptions = (q) => {
    if (q.questionType === "true-false") {
      return ["True", "False"];
    }

    if (q.questionType === "short-answer") {
      return [q.correctAnswer].filter(Boolean);
    }

    return [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
  };

  const handleSubmit = async () => {
    if (!questions?.length) return;

    const feedback = questions.map((q) => {
      const selected = responses.find((r) => r.id === q.id)?.response || "";
      const correct = q.correctAnswer || "";
      const normalizedSelected = selected?.toString().trim().toLowerCase();
      const normalizedCorrect = correct?.toString().trim().toLowerCase();

      return {
        ...q,
        selected,
        correct,
        isCorrect: normalizedSelected === normalizedCorrect,
      };
    });

    let scoreValue = feedback.filter((item) => item.isCorrect).length;

    try {
      const res = await submitQuiz(responses);
      if (res?.data?.score != null) {
        scoreValue = res.data.score;
      }
    } catch (err) {
      console.error(err);
      toast("Submission failed; showing local result.", "error");
    }

    showResult(scoreValue, feedback);
  };

  return (
    <section className="quiz-screen">
      <div className="card quiz-card">
        <div className="section-head">
          <span className="eyebrow">Question set</span>
          <h2>Quiz Questions</h2>
        </div>

        {questions === null ? (
          <div className="empty-state">
            <p>Loading questions…</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <p>No questions found for this quiz.</p>
          </div>
        ) : (
          questions.map((q, index) => {
            const selected = responses.find((r) => r.id === q.id)?.response;
            const options = buildOptions(q);
            return (
              <div key={q.id} className="question-box">
                <div className="question-meta">
                  <span>Question {index + 1}</span>
                  <strong>{q.questionTitle}</strong>
                </div>
                <div className="options-grid">
                  {q.questionType === "short-answer" ? (
                    <label className="option-row short-answer-row">
                      <span className="short-answer-label">Answer</span>
                      <input
                        className="short-answer-input"
                        type="text"
                        value={selected || ""}
                        placeholder="Type your answer here"
                        onChange={(event) => handleChange(q.id, event.target.value)}
                      />
                    </label>
                  ) : (
                    options.map((opt, i) => (
                      <label key={i} className={`option-row ${selected === opt ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={selected === opt}
                          onChange={() => handleChange(q.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}

        <div className="actions-row">
          <button className="button-ghost" type="button" onClick={restart}>
            Back to quizzes
          </button>
          <button
            className="button-solid"
            type="button"
            onClick={handleSubmit}
            disabled={answeredCount < questionCount}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuizQuestions;