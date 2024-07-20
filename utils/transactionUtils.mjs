// Import any necessary modules or dependencies
import { calculateDayDifference } from '../utils/timeUtils.mjs'; // Adjust the import path as needed
import CustomerQuota from '../models/customerQuotaModel.mjs';
import moment from 'moment-timezone';
import countCustomerCancelled from './countCustomerCancelled.mjs';
import { freeUpTable } from './reservationUtils.mjs';

// Define the function to process transactions
const processAndCancelExpiredReservations = async (transactions) => {
    // Loop through each transaction
    for (const transaction of transactions) {
        const daysDifference = calculateDayDifference(transaction);
        console.log('calculateDayDifference(transaction):', daysDifference);

        // Check if the reservation date is the same as the current date
        if (daysDifference === 0) {
            // Get the current date and time in 'Asia/Manila' timezone
            const now = moment().tz('Asia/Manila');
            const currentTime = now.format('HH:mm'); // 24-hour format

            // Combine reservation date and time to create a Moment object
            const reservationDateInput = transaction.reservation.reservation_date; // Strip the time component
            const reservationTimeInput = transaction.reservation.reservation_time;
            const reservationDateTime = moment.tz(`${reservationDateInput} ${reservationTimeInput}`, 'YYYY-MM-DD HH:mm', 'Asia/Manila');
            console.log('currentTime:', currentTime);
            console.log('reservationTimeInput:', reservationTimeInput);
            console.log(currentTime > reservationTimeInput);
            transaction.isToday = true;

            // Compare the current time with the reservation date and time
            if (currentTime > reservationTimeInput) {
                countCustomerCancelled(transaction.restaurant._id, transaction.customer._id);
                
                // Update the transaction status
                transaction.isCancelled = true;
                transaction.isPending = false;
                transaction.isToday = false;
                if (transaction.reservation.dineIn && transaction.reservation.numberPax) {
                    console.log('transactionnnnnnnnnnnn:', transaction);
                    freeUpTable(transaction);
                }
                return await transaction.save();
            } else {
                // Handle the case where the reservation time is in the future
                console.log('future');
            }
        }
    }
};

// Export the function for use in other modules
export default processAndCancelExpiredReservations;
