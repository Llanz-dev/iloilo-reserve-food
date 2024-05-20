const calculateTotalAmountByPax = (num_pax, cart) => {
    if (num_pax <= 2) {
        console.log('1 to 2 = 15');
        cart.totalAmount += 15;
    } else if (num_pax >= 3 && num_pax <= 5) {
        console.log('3 to 5 = 30');
        cart.totalAmount += 30;
    } else if (num_pax >= 6 && num_pax <= 9) {
        console.log('6 to 9 = 45');
        cart.totalAmount += 60;
    } else if (num_pax >= 10 && num_pax <= 13) {
        console.log('10 to 13 = 85');
        cart.totalAmount += 85;
    } else {
        console.log('14 to 17 = 140');
        cart.totalAmount += 100;
    } 
}


export default calculateTotalAmountByPax;
