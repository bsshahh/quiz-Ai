import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendResultEmail = async (to, username, quizTitle, score, maxScore) => {
  const mailOptions = {
    from: `"Quiz App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Quiz Results for ${quizTitle}`,
    html: `
      <h2>Hi ${username},</h2>
      <p>You have completed the quiz: <b>${quizTitle}</b></p>
      <p><b>Score:</b> ${score} / ${maxScore}</p>
      <br/>
      <p>AI Quiz Platform</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Result email sent to", to);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};
