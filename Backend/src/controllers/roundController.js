import Round from "../models/Round.js";

export const deleteAllRounds = async (req, res) => {
  try {
    await Round.deleteMany({});
    res.json({ message: "All rounds deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};