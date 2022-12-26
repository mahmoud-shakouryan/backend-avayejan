import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import { isAuth } from '../util.js'
import axios from 'axios';


const payRouter = express.Router();

payRouter.post('/', isAuth,  expressAsyncHandler((req, res)=>{
    const body = { 'order_id': `${req.body.videoId}`, 'amount': req.body.price, 'callback': 'http://localhost:3000/myvideos', 'mail': req.user.email, 'name': req.body.userToken };
    axios.post('https://api.idpay.ir/v1.1/payment', body, { headers:{ 'Content-Type': 'application/json',  'X-API-KEY': '3e1b9437-893a-417f-9355-1ba934862ccb', 'X-SANDBOX': 1}})
    .then(response =>{
        const newPayment = new Payment({ user: req.user, amount: req.body.price, paymentId: response.data.id, paymentLink: response.data.link, });
        newPayment.save().then(result=>{
            return res.send({ link: response.data.link})
        })
        .catch(err=> console.log('new payment error'));
    })
    .catch(err=>{
        console.log('axios post requset error', err)
    })
}));


payRouter.post('/status', expressAsyncHandler(async (req, res)=>{
    const { status, order_id, payId } = req.body;
    switch (+status) {
        case 1: 
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message: 'پرداخت انجام نشده است'})
            break;
        case 2:
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message: 'پرداخت ناموفق بوده است'});
            break;
        case 3:
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message: 'خطا رخ داده است'});
            break;
        case 4:
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message:''});
            break;
        case 5:
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message:''});
            break;
        case 6:
            res.send({ token: response.data.payer.name, mail: response.data.payer.mail, message:''});
            break;
        case 10:
            const payment = await Payment.findOne({ paymentId: payId });
            if(!payment){
                return res.send({ message: 'چنین تراکنشی وجود ندارد'})
            }
            try{
                const body = { 'id': payId, 'order_id': order_id }
                const verifyResponse = await axios.post('https://api.idpay.ir/v1.1/payment/verify', body, { headers: { 'Content-Type': 'application/json', 'X-API-KEY': '3e1b9437-893a-417f-9355-1ba934862ccb'}})
                console.log('verifyResponse>>>>>>>',verifyResponse);
                if( +verifyResponse.status == 200){
                    return res.send({ token: verifyResponse.data.payer.name, mail: verifyResponse.data.payer.mail})
                }
            }
            catch(err){
                console.log(err)
            }
            break;
        default:
            break;
    }
}));


export default payRouter;