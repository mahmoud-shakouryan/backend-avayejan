import express from "express";
import expressAsyncHandler from "express-async-handler";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import { isAuth } from "../util.js";
import axios from "axios";
import { inquiry } from "../util.js";

const payRouter = express.Router();

payRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const body = {
      order_id: `${req.body.videoId}`,
      amount: req.body.price,
      callback: "http://localhost:3000/myvideos",
      mail: req.user.email,
      name: req.body.userToken,
      desc: `${req.body.videoId}____${req.user.email}`,
    };
    const response = await axios.post(
      "https://api.idpay.ir/v1.1/payment",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "3e1b9437-893a-417f-9355-1ba934862ccb",
          "X-SANDBOX": 1,
        },
      }
    );

    return res.send({ link: response.data.link });
  })
);

payRouter.post(
  "/status",
  expressAsyncHandler(async (req, res) => {
    console.log("req.body >>>>>>>>>>>>>>>>>>>>>>>", req.body);
    const { status, order_id, payId } = req.body;
    const responseOfInquiry = await inquiry(payId, order_id);
    switch (+status) {
      case 1:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "پرداخت انجام نشده است",
        });
        break;
      case 2:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "پرداخت ناموفق بوده است",
        });
        break;
      case 3:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "خطا رخ داده است",
        });
        break;
      case 4:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "خطا رخ داده است",
        });
        break;
      case 5:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "خطا رخ داده است",
        });
        break;
      case 6:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "برگشت خورده‌ی سیستمی",
        });
        break;
      case 7:
        res.send({
          token: responseOfInquiry.data.payer.name,
          mail: responseOfInquiry.data.payer.mail,
          message: "انصراف از پرداخت",
        });
        break;
      case 10:
        const body = {
          id: payId,
          order_id: order_id,
        };
        const verifyResponse = await axios.post(
          "https://api.idpay.ir/v1.1/payment/verify",
          body,
          {
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": "3e1b9437-893a-417f-9355-1ba934862ccb",
              "X-SANDBOX": 1,
            },
          }
        );
        const user = await User.find({
          email: responseOfInquiry.data.payer.mail,
        });
        if (!user[0].paidVidIds.includes(+responseOfInquiry.data.order_id)) {
          user[0].paidVidIds.push(+responseOfInquiry.data.order_id);
        }
        user[0].paysSoFar += +responseOfInquiry.data.amount;
        const updatedUser = await user[0].save();
        return res.send(responseOfInquiry.data.payer);
      default:
        break;
    }
  })
);

export default payRouter;
