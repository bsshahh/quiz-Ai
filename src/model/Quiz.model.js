import mongoose from "mongoose";
import questionSchema from "./Question.model.js";

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  gradeLevel: {
    type: Number,
    required: true
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },

  maxScore: {
    type: Number,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  questions: [
    questionSchema
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Quiz", quizSchema);
