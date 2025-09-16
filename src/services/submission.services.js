import Submission from "../model/Submission.model.js";

// Get history with filters
export const getHistoryService = async (filters, userId) => {
  const query = { user: userId };

  if (filters.completedDate) {
    // Single day filter
    const start = new Date(filters.completedDate);
    const end = new Date(filters.completedDate);
    end.setHours(23, 59, 59, 999);

    query.submittedAt = { $gte: start, $lte: end };
  } else if (filters.from && filters.to) {
    // Date range filter
    const start = new Date(filters.from);
    const end = new Date(filters.to);
    end.setHours(23, 59, 59, 999); // include full day

    query.submittedAt = { $gte: start, $lte: end };
  }

  let submissions = await Submission.find(query)
    .populate("quiz")
    .sort({ submittedAt: -1 });

  if (filters.subject) {
    submissions = submissions.filter(
      (s) => s.quiz?.subject?.toLowerCase() === filters.subject.toLowerCase()
    );
  }

  if (filters.grade) {
    submissions = submissions.filter(
      (s) => s.quiz?.gradeLevel == filters.grade
    );
  }

  if (filters.minMarks) {
    submissions = submissions.filter(
      (s) => s.score >= Number(filters.minMarks)
    );
  }

  return submissions;
};
