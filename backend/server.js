import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "data.json");

const app = express();
app.use(cors());
app.use(express.json());

const readData = async () => {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
};

const writeData = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
};

app.get("/quiz/all", async (req, res) => {
  const data = await readData();
  res.json(data.quizzes);
});

app.post("/quiz/create", async (req, res) => {
  const { title, description = "" } = req.body;
  if (!title || !title.toString().trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const data = await readData();
  const newQuiz = {
    id: data.nextQuizId++,
    title: title.toString().trim(),
    description: description.toString().trim(),
    createdAt: new Date().toISOString(),
  };
  data.quizzes.push(newQuiz);
  await writeData(data);
  res.json(newQuiz);
});

app.post("/question/add", async (req, res) => {
  const { quizId, questionTitle, option1, option2, option3 = "", option4 = "", correctAnswer } = req.body;
  if (!quizId || !questionTitle || !option1 || !option2 || !correctAnswer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const data = await readData();
  const quiz = data.quizzes.find((q) => q.id === Number(quizId));
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const question = {
    id: data.nextQuestionId++,
    quizId: Number(quizId),
    questionTitle: questionTitle.toString().trim(),
    option1: option1.toString().trim(),
    option2: option2.toString().trim(),
    option3: option3.toString().trim(),
    option4: option4.toString().trim(),
    correctAnswer: correctAnswer.toString().trim(),
  };

  data.questions.push(question);
  await writeData(data);
  res.json(question);
});

app.get("/quiz/questions/:quizId", async (req, res) => {
  const quizId = Number(req.params.quizId);
  const data = await readData();
  const quiz = data.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }
  const questions = data.questions.filter((q) => q.quizId === quizId);
  res.json(questions);
});

app.post("/quiz/submit", async (req, res) => {
  const responses = Array.isArray(req.body) ? req.body : [];
  const data = await readData();
  const questionMap = new Map(data.questions.map((q) => [q.id, q.correctAnswer]));
  const score = responses.reduce((sum, item) => {
    const answer = questionMap.get(Number(item.id));
    return sum + (answer === item.response ? 1 : 0);
  }, 0);
  res.json(score);
});

app.get("/leaderboard", async (req, res) => {
  const data = await readData();
  const sorted = [...data.leaderboard].sort((a, b) => b.score - a.score);
  res.json(sorted.slice(0, 20));
});

const port = process.env.PORT || 9001;
app.listen(port, () => {
  console.log(`Quiz backend listening on http://localhost:${port}`);
});
