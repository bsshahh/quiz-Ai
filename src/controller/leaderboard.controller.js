
import Submission from "../model/Submission.model.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { subject, gradeLevel, limit = 10 } = req.query;

    // Build query for submissions
    let query = {};
    if (subject) query["quiz.subject"] = subject;
    if (gradeLevel) query["quiz.gradeLevel"] = Number(gradeLevel);

    // Aggregate leaderboard
    const leaderboard = await Submission.aggregate([
      // 1. Join Quiz data
      {
        $lookup: {
          from: "quizzes", 
          localField: "quiz",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },

      // 2. Match filters (subject/grade)
      { $match: query },

      // 3. Group by user, pick their highest score
      {
        $group: {
          _id: "$user",
          bestScore: { $max: "$score" },
          attempts: { $sum: 1 },
          lastAttempt: { $max: "$submittedAt" },
        },
      },


      // 4. Project clean fields
      // {
      //   $project: {
      //     user: "$_id",
      //     bestScore: 1,
      //     attempts: 1,
      //     lastAttempt: 1,
      //     _id: 0,
      //   },
      // },

      // 5. Sort descending by best score
      { $sort: { bestScore: -1, lastAttempt: 1 } },

      // 6. Limit to top N
      { $limit: parseInt(limit) },
    ]);

    // 7. Populate user info
    const populated = await Submission.populate(leaderboard, {
      path: "_id",
      model: "User",
      select: "username email",
    });

    res.json(populated);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
