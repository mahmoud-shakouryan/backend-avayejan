import jwt from "jsonwebtoken";
import axios from "axios";

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(
      token,
      process.env.JWT_SECRET || "somethingsupersupersecret",
      (error, decode) => {
        if (error) {
          res.status(401).send({ message: "invalid token" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    console.log("errore if(authorization) else tuye isAuth");
    res.status(401).send({ message: "you are not authorized" });
  }
};

export async function inquiry(payId, order_id) {
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
  return response;
}
