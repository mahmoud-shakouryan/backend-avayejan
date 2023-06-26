import express from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import validator from "express-validator";

const { check, validationResult, body } = validator;

const userRouter = express.Router();

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "ایمیل در سیستم پیدا نشد" });
    } else if (user) {
      if (req.body.password.length > 20) {
        return res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          paidVidIds: user.paidVidIds,
          token: req.body.password,
        });
      } else {
        const token = jwt.sign(
          { _id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET || "somethingsupersupersecret",
          { expiresIn: "30d" }
        );
        if (bcrypt.compareSync(req.body.password, user.password)) {
          return res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            paidVidIds: user.paidVidIds,
            token: token,
          });
        } else if (!bcrypt.compareSync(req.body.password, user.password)) {
          return res.status(401).send({ message: "پسوورد اشتباه است" });
        }
      }
    }
  })
);

userRouter.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("لطفا ایمیل معتبر وارد کنید")
      .custom(async (value, { req }) => {
        const user = await User.find({ email: req.body.email });
        console.log("user signup >>>>>>>>>>>>>>>>>>>>>>>>>>>", user);
        if (user.length > 0) {
          throw new Error("email exists!");
        }
      })
      .withMessage("این ایمیل یکبار ثبت شده است"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("پسوورد باید حداقل دارای 5 کاراکتر باشد")
      .isAlphanumeric()
      .withMessage("پسوورد باید فقط شامل اعداد و حروف باشد"),
    body("confirm")
      .custom((value, { req }) => {
        if (req.body.password !== req.body.confirmPassword) {
          throw new Error("Passwords don't match");
        } else {
          return true;
        }
      })
      .withMessage("پسووردها همخوانی ندارند"),
  ],
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ message: errors.array()[0].msg });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();
    const token = jwt.sign(
      {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
      process.env.JWT_SECRET || "somethingsupersupersecret",
      { expiresIn: "30d" }
    );
    res.send({
      _id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      token: token,
    });
  })
);

export default userRouter;
