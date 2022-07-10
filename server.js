import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import videoRouter from './routes/videoRouter.js';
import userRouter from './routes/userRouter.js';
import payRouter from './routes/payRouter.js';






const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const MONGODB_URI = 'mongodb+srv://avayejaan:avayejaan1886181170@cluster0.kj3hf.mongodb.net/?retryWrites=true&w=majority';  //avayejaan avayejaan1886181170      mahmoud-shakouryan TarYDvaALJVMQ8w   //mongodb+srv://<username>:<password>@cluster0.kj3hf.mongodb.net/?retryWrites=true&w=majority

 app.use(cors({maxAge:1728000}));


app.use('/api/videos', videoRouter);
app.use('/api/users', userRouter);
app.use('/api/pay', payRouter);

app.use((err, req, res, next) => { 
    console.log('expressAsyncHandler error from api to client')
    res.status(500).send({ message: err.message })
});






let port = process.env.PORT || 5000;
mongoose.connect(MONGODB_URI).then( result =>{
    app.listen(port);
    console.log('connected ro mongodb and port');
})
.catch(err =>{
    console.log('mongoose.connect error');
})














