import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, email, password });
    await user.save();
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
};
