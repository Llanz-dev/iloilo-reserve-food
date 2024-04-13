const GETPayment = async (req, res) => {
    try {
        const reservationID = req.params.id;
        res.json(`GETPayment ${reservationID}`);
    } catch (err) {
        console.log('GETPayment');
        console.error(err);
        res.status(500).json('Server error');
    }
}

export { GETPayment };