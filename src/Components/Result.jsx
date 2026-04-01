import React from "react";

const Result = ({ result, restart }) => {
  const score = result?.score ?? 0;
  const review = result?.review ?? [];
  const wrongAnswers = review.filter((item) => !item.isCorrect);

  return (
    <section className="quiz-screen">
      <div className="card result-card">
        <div className="section-head">
          <span className="eyebrow">Result</span>
          <h2>Quiz Complete</h2>
        </div>

        <div className="score-badge">{score}</div>
        <p className="score-copy">Nice work! Review your answers below.</p>

        {wrongAnswers.length > 0 ? (
          <div className="review-grid">
            {wrongAnswers.map((item) => (
              <div key={item.id} className="review-card incorrect">
                <div className="question-meta">
                  <span>{item.questionTitle}</span>
                </div>
                <div className="review-row">
                  <strong>Your answer:</strong>
                  <span>{item.selected || "No answer"}</span>
                </div>
                <div className="review-row">
                  <strong>Correct answer:</strong>
                  <span>{item.correct || "Unknown"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>All answers were correct. Great job!</p>
          </div>
        )}

        <button className="button-solid" onClick={restart}>
          Return to quizzes
        </button>
      </div>
    </section>
  );
};

export default Result;