import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import User from '../models/user.js'
import { isAuth } from '../util.js'
import axios from 'axios';


const payRouter = express.Router();


// payRouter.post('/', expressAsyncHandler(async (req, res) =>{
//     console.log('umad tu pay')
//     const params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: `${req.body.price}`, callback_url: 'http://localhost:5000/api/pay/callback', description:`${req.body.videoId}` };
//     const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params );
//     console.log('response>>>>>>>>>>>>>>>',response)
//     if(response.data.data.code === 100){
//         const newPayment = new Payment({ user: req.body.userId, amount: req.body.price, resNumber: response.data.data.authority});
//          await newPayment.save();
//         //  res.send({ 'authority': response.data.data.authority });
//         //res.setHeader('Access-Control-Allow-Origin', '*');
//         return res.redirect(`https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`); 
//     }
//     else{
//         res.status(404).send({ message: 'error'})
//     }
// }))


payRouter.post('/', expressAsyncHandler((req, res)=>{
    console.log('umad pay');
    const params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: req.body.price, callback_url: 'http://localhost:5000/api/pay/callback', description:`${req.body.videoId}` };
    axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params, {headers:{'Content-Type': 'application/json'}})
    .then(response =>{
        console.log('resposnse from zarinpal request>>>>>', response);
        const newPayment = new Payment({ user: req.body.userId, amount: req.body.price, resNumber: response.data.data.authority});
        newPayment.save().then(result=>{
            return res.redirect(`https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`)
        })
        .catch(err=> console.log('new payment error'));
    })
    .catch(err=>{
        console.log('axios post requset error', err)
    })
}))






payRouter.post('/callback', expressAsyncHandler(async (req, res) =>{
    console.log('umad tu paycallback')
    try{
        if( req.query.Status && req.query.Status !== 'OK'){
            return res.send({ message: 'تراکنش ناموفق'});
        }
        const payment = await Payment.findOne({ resNumber: req.query.Authority });
        if(!payment) {
            return res.send({ message: 'چنین تراکنشی وجود ندارد'});
        }
        let params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: `${payment.amount}`, Authority: req.query.Authority };
        const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', params);
        console.log('response callback >>>>>>>>>>>>>>>>>>>>>>>>', response);
        console.log('response',response)
        if(response.data.Status === 100){     
            payment.isPaid = true;
            await payment.save();
            res.redirect('http://localhost:3000/videos')
        }
        else{
            return res.send({ message: 'تراکنش ناموفق بود'});
        }
    }
    catch(error){
        console.log('pay callback error')
    }
}));






export default payRouter;