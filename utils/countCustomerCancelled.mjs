import CustomerQuota from "../models/customerQuotaModel.mjs";

const countCustomerCancelled = async (transactionRestaurant, transactionCustomer) => {
    try {
        // Find the CustomerQuota document
        let customerQuota = await CustomerQuota.findOne({ restaurant: transactionRestaurant, customer: transactionCustomer });
        
        // If no document is found, create a new one
        if (!customerQuota) {
            customerQuota = new CustomerQuota({
                restaurant: transactionRestaurant,
                customer: transactionCustomer,
                cancelledLimit: 0 // or any other default value you want to set
            });
        }

        // Decrement the cancelledLimit
        customerQuota.cancelledLimit -= 1;
        // await customerQuota.save();
    } catch (err) {
        console.log('countCustomerCancelled has an error');
        console.log(err);
    }
}

export default countCustomerCancelled;