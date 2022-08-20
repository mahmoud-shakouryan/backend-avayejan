import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import User from '../models/user.js';
import { isAuth } from '../util.js'
import axios from 'axios';


const payRouter = express.Router();

payRouter.post('/', isAuth,  expressAsyncHandler((req, res)=>{
    console.log('user', req.user)
    const body = { 'order_id': `${req.body.videoId}`, 'amount': req.body.price, 'callback': 'http://localhost:3000/myvideos', 'mail': req.user.email };
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
    const { status, order_id, userId, payId } = req.body;
    
    if( status == null){
        const user = await User.findById(userId)
        return res.send( user.paidVidIds )
    }
    if(status == 100){
        return res.send({ message: 'پرداخت انجام نشده است'});
    }
    else if(status == 2){
        return res.send({ message: 'پرداخت ناموفق بوده است'});
    }
    else if(status ==3){
        return res.send({ message: 'خطا رخ داده است'});
    }
    else if(status == 1){
        const payment = await Payment.findOne({ paymentId: payId });
        if(!payment){
            return res.send({ message: 'چنین تراکنشی وجود ندارد'})
        }
        const body = { 'id': payId, 'order_id': order_id }
        try{
            const response = await axios.post('https://api.idpay.ir/v1.1/payment/verify', body, { headers: { 'Content-Type': 'application/json', 'X-API-KEY': '3e1b9437-893a-417f-9355-1ba934862ccb', 'X-SANDBOX': 1}})
            if( response.status == 200){
                console.log('response verify', response)
                let paysSoFar = +response.data.amount;
                const user = await User.findById(userId)
                if(user.paysSoFar){
                    paysSoFar += user.paysSoFar;
                }
                user.paysSoFar = paysSoFar;
                if(!user.paidVidIds.find( id => id === +order_id)){
                    user.paidVidIds.push(+order_id)
                }
                payment.isPaid = true;
                await payment.save();
                await user.save();
                return res.send( user.paidVidIds )         //ferestadane araye'ye id'haye video'haye kharidari shode be client
            }
        }
        catch(err){
            console.log(err)
        }

    }
    
}));


export default payRouter;