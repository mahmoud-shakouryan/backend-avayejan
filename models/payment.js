import mongoose   from "mongoose";


const paymentSchema = new mongoose.Schema({ 
    user: { type: mongoose.Schema.Types.ObjectId , ref:'User', required: true },
    paymentId: { type: String, required: true },
    paymentLink: { type: String, required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false }
    }
    ,
    { timestamps: true }
);



const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;