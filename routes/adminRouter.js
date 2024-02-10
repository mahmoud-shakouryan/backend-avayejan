import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.js";
import Payment from "../models/payment.js";

const adminRouter = express.Router();

const getFilteredUsers = async (initialTime, endTime, purchased) => {
  const query = {
    $or: [
      {
        createdAt: {
          $gte: initialTime,
          $lte: endTime,
        },
      },
      {
        updatedAt: {
          $gte: initialTime,
          $lte: endTime,
        },
      },
    ],
  };
  purchased ? (query.paidVidIds = { $exists: true, $gt: [] }) : null;
  const users = User.find(query);
  return users;
};

adminRouter.get(
  "/users",
  expressAsyncHandler(async (req, res, next) => {
    const timeRange = req.query.timeRange;
    const buyRange = req.query.buyRange;
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (timeRange) {
      case "all":
        if (buyRange === "purchased_and_not_purchased") {
          // const users = await User.find({Shimazatdarvish@gmail.com});
          // return res.status(200).send(users);
          const user = await User.find({
            email: "dd@dd.com",
          });
          // user[0].paysSoFar = 690000;
          user[0].paidVidIds.push(17);
          const updatedUser = await user[0].save();
          console.log(updatedUser);
        } else if (buyRange === "only_purchased_ones") {
          const users = await User.find({
            paidVidIds: { $exists: true, $gt: [] },
          });
          res.status(200).send(users);
        } else if (buyRange === "null") {
          const users = await User.find();
          return res.status(200).send(users);
        }
        break;
      case "last_month":
        if (buyRange === "purchased_and_not_purchased") {
          const users = await getFilteredUsers(last30Days, today, false);
          return res.status(200).send(users);
        } else if (buyRange === "only_purchased_ones") {
          const users = await getFilteredUsers(last30Days, today, true);
          return res.status(200).send(users);
        } else if (buyRange === "null") {
          const users = await getFilteredUsers(last30Days, today, false);
          return res.status(200).send(users);
        }
        break;
      case "last_week":
        if (buyRange && buyRange === "purchased_and_not_purchased") {
          const users = await getFilteredUsers(last7Days, today, false);
          return res.status(200).send(users);
        } else if (buyRange && buyRange === "only_purchased_ones") {
          const users = await getFilteredUsers(last7Days, today, true);
          return res.status(200).send(users);
          // const user = await User.find({ email: "admin@admin.com" });
          // console.log(user);
        } else if (buyRange === "null") {
          const users = await getFilteredUsers(last7Days, today, false);
          return res.status(200).send(users);
        }
        break;
      default:
        const users = await getUsersLast30Days(last30Days, today, true);
        res.status(200).send(users);
        break;
    }
  })
);

export default adminRouter;
