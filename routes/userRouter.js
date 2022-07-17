import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';



const userRouter = express.Router();



userRouter.post('/signin', expressAsyncHandler(async (req, res) =>{
    const user = await User.findOne({ email: req.body.email });
    if(user){
        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'somethingsupersupersecret', { expiresIn: '30d' });
        if( bcrypt.compareSync(req.body.password, user.password )){
            return res.send({ _id: user._id, name: user.name, email: user.email, paidVidIds: user.paidVidIds, token: token })
        }
    }
    res.status(401).json({ message:'invalid email or password '});
}));


userRouter.post('/signup', expressAsyncHandler(async (req, res)=>{
    const user = new User({ name: req.body.name, email: req.body.email, password: bcrypt.hashSync(req.body.password, 8)});
    const createdUser = await user.save();
    const token = jwt.sign({ _id:createdUser._id, name:createdUser.name, email:createdUser.email }, process.env.JWT_SECRET || 'somethingsupersupersecret', { expiresIn: '30d'});
    res.send({ _id:createdUser.id, name:createdUser.name, email:createdUser.email, token:token});
}))


export default userRouter;