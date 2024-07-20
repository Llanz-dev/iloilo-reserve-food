import Voucher from "../models/voucherModel.mjs";

async function deleteUsedVouchers() {
    try {
        // Delete all vouchers that are already used
        await Voucher.deleteMany({ isUsed: true });
    } catch (error) {
        console.error('Error deleting used vouchers:', error);
    }
}

const isRestaurantOpen = (foundDay, currentTime) => {
    while (foundDay.open && foundDay.close) {
        if (foundDay.open === currentTime || foundDay.close === currentTime) {
            return true;
        } 
        return foundDay.open <= currentTime && foundDay.close >= currentTime;
    }
    return false;
}

const isTransactionCancelled = (reservationDateAndTime, currentDateAndTime) => {
    return `reservationDateAndTime: ${reservationDateAndTime} currentDateAndTime: ${currentDateAndTime}`;
}

export { deleteUsedVouchers, isRestaurantOpen, isTransactionCancelled };