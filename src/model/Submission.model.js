import mongoose from "mongoose";


const responseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userResponse: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const submissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  responses: [responseSchema],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  suggestions: {
    type: [String], 
    default: []
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});
submissionSchema.index(
  { quiz: 1, user: 1, submittedAt: 1 },
  { unique: true }
);
export default mongoose.model("Submission", submissionSchema);
