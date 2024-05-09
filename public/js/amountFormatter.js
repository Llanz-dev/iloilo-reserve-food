const totalAmountSpans = document.querySelectorAll('.total-amount');

const putComma = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

totalAmountSpans.forEach(totalAmountSpan => {
  totalAmountSpan.textContent = putComma(totalAmountSpan.textContent);
});
