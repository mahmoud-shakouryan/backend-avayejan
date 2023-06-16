import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    paysSoFar: { type: Number, default: 0 },
    paidVidIds: [Number],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
