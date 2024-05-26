// Import any necessary modules or dependencies
import { calculateTimeDifference } from '../utils/timeUtils.mjs'; // Adjust the import path as needed

// Define the function to process transactions
const processTransactions = async (transactions) => {
    // Loop through each transaction
    for (const transaction of transactions) {
        // Check if the reservation date is the same with the current date
        if (calculateTimeDifference(transaction) === 0) {
            console.log('transaction.reservation.reservation_date:', calculateTimeDifference(transaction));
            // Change the status of the transaction to isToday to true
            await transaction.save();
        }
        // Check if the reservation date is in the past relative to the current date
        else if (calculateTimeDifference(transaction) < 0) {
            // Cancel the transaction unrefunded
            res.redirect(`/transaction/cancel-reservation-unrefundable/${transaction._id}`);
        }
    }
};

// Export the function for use in other modules
export default processTransactions;
