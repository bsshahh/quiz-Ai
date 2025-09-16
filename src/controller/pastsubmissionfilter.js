import Submission from "../model/Submission.model.js";

export const getUserPastSubmissions = async (userId, subject, limit = 30) => {
  const submissions = await Submission.find({ user: userId })
    .populate("quiz")
    .sort({ submittedAt: -1 });

  const filtered = submissions
    .filter(sub => sub.quiz?.subject?.toLowerCase() === subject.toLowerCase())
    .slice(0, limit);

  if (filtered.length === 0) {
        return submissions.slice(0, limit);
  }

  return filtered;
};
