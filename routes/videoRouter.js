import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.js";
// import Payment from "../models/payment.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { createRequest } from "@aws-sdk/util-create-request";
import { formatUrl } from "@aws-sdk/util-format-url";
import axios from "axios";

const myVidsLinksRouter = express.Router();

myVidsLinksRouter.post(
  "/uservids",
  expressAsyncHandler(async (req, res) => {
    const { status, userId, payId, order_id } = req.body;
    if (status === null) {
      //صرفا رفتن به پوشه ویدیوها، نه بعد از خرید کردن
      const user = await User.findById(userId);
      return res.send(user.paidVidIds);
    }
    const body = { id: payId, order_id: order_id };
    const response = await axios.post(
      "https://api.idpay.ir/v1.1/payment/inquiry",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "3e1b9437-893a-417f-9355-1ba934862ccb",
          "X-SANDBOX": 1,
        },
      }
    );
    if (response.status == 200) {
      // const payment = await Payment.findOne({ paymentId: payId });
      let paysSoFar = +response.data.amount;
      const user = await User.findById(userId);
      if (user.paysSoFar) {
        paysSoFar += user.paysSoFar;
      }
      user.paysSoFar = paysSoFar;
      if (!user.paidVidIds.find((id) => id === +order_id)) {
        user.paidVidIds.push(+order_id);
      }
      // payment.isPaid = true;
      // await payment.save();
      await user.save();
      return res.send(user.paidVidIds); //ferestadane araye'ye id'haye video'haye kharidari shode be client
    }
  })
);

myVidsLinksRouter.post(
  "/myvidslinks",
  expressAsyncHandler(async (req, res) => {
    const fileNameInBucket = req.body.allFiles;
    const linksArr = [];
    for (let fileIndex in fileNameInBucket) {
      const s3 = new S3Client({
        region: "default",
        endpoint: "https://s3.ir-thr-at1.arvanstorage.com",
        forcePathStyle: false,
        credentials: {
          accessKeyId: "cd642d50-c891-4f1c-9d62-3c929e5b7e5c",
          secretAccessKey:
            "46c4b12ed300a4e49cfa8fc86d424c5f10137963feaf1655782750134996bbc9",
        },
      });
      const clientParams = {
        Bucket: "avayejan",
        Key: fileNameInBucket[fileIndex].title,
      };
      const signedRequest = new S3RequestPresigner(s3.config);
      try {
        const request = await createRequest(
          s3,
          new GetObjectCommand(clientParams)
        );
        const signedUrl = formatUrl(
          await signedRequest.presign(request, { expiresIn: 60 * 60 * 24 })
        );
        linksArr.push(signedUrl);
      } catch (err) {
        console.log("Error creating presigned URL", err);
      }
    }
    return res.send(linksArr);
  })
);

export default myVidsLinksRouter;
