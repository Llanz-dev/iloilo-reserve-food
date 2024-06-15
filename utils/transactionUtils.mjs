// Import any necessary modules or dependencies
import { calculateTimeDifference } from '../utils/timeUtils.mjs'; // Adjust the import path as needed
import CustomerQuota from '../models/customerQuotaModel.mjs';
import moment from 'moment-timezone';
import countCustomerCancelled from './countCustomerCancelled.mjs';

// Define the function to process transactions
const processAndCancelExpiredReservations = async (transactions) => {
    // Loop through each transaction
    for (const transaction of transactions) {
        // Check if the reservation date is the same with the current date
        if (calculateTimeDifference(transaction) === 0) {
            // Get the current time in 'Asia/Manila' timezone
            const currentTime = moment().tz('Asia/Manila').format('HH:mm'); // 24-hour format

            // Get the reservation time (hours and minutes) in 'Asia/Manila' timezone
            const reservationTime = moment.tz(transaction.reservation.reservation_time, 'HH:mm', 'Asia/Manila').format('HH:mm');

            // Compare the current time with the reservation time 
            if (currentTime > reservationTime) {
                // Set a timer for 1 hour (3600000 milliseconds)
                setTimeout(async () => {
                    countCustomerCancelled(transaction.restaurant._id, transaction.customer._id);
                    // Update the transaction status
                    transaction.isCancelled = true;
                    transaction.isPending = false;
                    transaction.isToday = false;
                    await transaction.save();      
                }, 3540000);
            } else {
                // Handle the case where the reservation time is in the future
                console.log('future');
            }
        }
    }
};

// Export the function for use in other modules
export default processAndCancelExpiredReservations;
