import { RequestHandler } from "express"
// import Paystack from 'paystack'
// import './paystack';

import { initializePayment, verifyPayment } from './util'
import Registration from "../model/registeration";


// export const pay: RequestHandler = async (req, res, next) => {
//     try {
//         // interface IPaystack {
//         //     transaction: {
//         //       initialize(data: {
//         //         email: string;
//         //         amount: number;
//         //       }): Promise<{
//         //         status: boolean;
//         //         message: string;
//         //         data: {
//         //           reference: string;
//         //           authorization_url: string;
//         //         };
//         //       }>;
//         //     };
//         // }
//         const paystack: any = new Paystack('sk_test_adb1107cf1a62e285ecf372f9614beb8a7026e04');

//         const {email, amount} = req.body
//         const { data } = await paystack.transaction.initialize({
//             email,
//             amount: Number(amount) * 100,
//           });
      
//           res.send({ reference: data.reference });
//     } catch (err) {
//         next(err)
//     }
// }

// const PAYSTACK_BASE_URL = 'https://api.paystack.co';
// const PAYSTACK_SECRET_KEY = 'sk_test_adb1107cf1a62e285ecf372f9614beb8a7026e04';


export const pay: RequestHandler = async (req, res, next) => {
    try {
        const { email, amount, reference } = req.body;

        // Initialize payment with Paystack
        const paymentDetails = await initializePayment(email, amount, reference);

        // Return payment URL to client
        res.json({ paymentUrl: paymentDetails.data.authorization_url });
    } catch (err) {
        console.error('Error initializing Paystack payment:', err);
        // res.status(500).json({ message: 'Error initializing payment' });
        next(err)
    }
}

export const verify: RequestHandler =async (req, res, next) => {
    try {
        const userDetails: any = req.user;
        // Get payment reference from request params
        const { eventID, reference } = req.params;
    
        // Verify payment with Paystack
        const paymentStatus = await verifyPayment(reference);

        if(paymentStatus.data.gateway_response === 'Successful'){
            const registration = await Registration.findOne({userID: userDetails._id})
            console.log(registration)
            if(registration) {
                const event = registration.events.find(event => event.eventID?.toString() === eventID);
                if(event) {
                    console.log(event)
                    event.payment = true;

                    for (let i = 0; i < registration.events.length; i++) {
                        if(JSON.stringify(registration.events[i]) === JSON.stringify(event)) {
                            registration.events[i].payment = true;
                            break;
                        }
                    }
                    console.log(registration.events)
                    registration.events = registration.events
                    const newly = await registration.save()
                    console.log(newly)
                }
                
            }
        }
    
        // Return payment status to client
        res.json({ paymentStatus });
      } catch (error) {
        console.error('Error verifying Paystack payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
      }
}