import Voucher from "../models/voucherModel.mjs";

async function deleteUsedVouchers() {
    try {
        // Delete all vouchers that are already used
        const vouchers = await Voucher.deleteMany({ isUsed: true });
        console.log('vouchers:', vouchers);
        console.log('All used vouchers have been deleted successfully.');
    } catch (error) {
        console.error('Error deleting used vouchers:', error);
    }
}


export { deleteUsedVouchers };