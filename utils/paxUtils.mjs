const calculateTotalAmountByPax = (num_pax, cart) => {
    const increment = 15;
    const totalAmountToAdd = Math.ceil(num_pax / 2) * increment;
    
    console.log(`${num_pax} pax = ${totalAmountToAdd}`);
    cart.totalAmount += totalAmountToAdd;
}


export default calculateTotalAmountByPax;
