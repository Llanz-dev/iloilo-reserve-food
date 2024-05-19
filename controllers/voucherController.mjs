import voucherGenerator from '../utils/voucherUtils.mjs';
import Restaurant from '../models/restaurantModel.mjs';


const GETvoucherPage = (req, res) => {
    const restaurant = res.locals.restaurant;
    res.render('restaurant/vouchers/voucher.ejs', { pageTitle: 'Vouchers' });
}

const POSTsetQuotaAmount = async (req, res) => {
    try {
        console.log('POSTsetQuotaAmount');
        console.log('req.body:', req.body);
        const restaurantID = req.query.restaurantID;
        const quota = req.body.quota;
        const percentageValue = req.query.percentageValue;
        const calculatedVoucher = quota * (percentageValue / 100);
        await Restaurant.findByIdAndUpdate(restaurantID, { quotaVoucher: quota, calculatedVoucherThreshold: calculatedVoucher });
        res.redirect('/restaurant/vouchers');    
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Server error'});
    }
}

const POSTsetPercentageValue = async (req, res) => {
    try {
        console.log('POSTsetPercentageValue');
        console.log('req.body:', req.body);
        const restaurantID = req.query.restaurantID;
        const percentage = req.body.percentage;
        const quotaVoucher = req.query.quotaVoucher;
        const calculatedVoucher = quotaVoucher * (percentage / 100);
        console.log('quotaVoucher:', quotaVoucher);
        console.log('calculatedVoucher:', calculatedVoucher);
        await Restaurant.findByIdAndUpdate(restaurantID, { percentageVoucher: percentage, calculatedVoucherThreshold: calculatedVoucher });
        res.redirect('/restaurant/vouchers');    
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Server error'});
    }
}

export { GETvoucherPage, POSTsetQuotaAmount, POSTsetPercentageValue };