import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },

  options: [
    {
      type: String
    }
  ],

  answer: {
    type: String
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  

  subject: {
    type: String
  },

  gradeLevel: {
    type: Number
  }
});

export default questionSchema;
