// Get all the buttons with type "submit"
const submitButtons = document.querySelectorAll('.single-product');

// Add event listeners to each submit button
submitButtons.forEach(button => {
    // Add event listener for mouseenter
    button.addEventListener('mouseenter', () => {
        // Get the parent square element
        const square = button.closest('.square');
        const addIcon = square.querySelector('.add-icon');
        // Add CSS styling to the product name when hovering
        const singleProduct = button.closest('.single-product');
        singleProduct.style.color = '#006D77';
        const productDescription = square.querySelector('.product-description');
        productDescription.style.color = '#006D77'
        addIcon.src = '/images/static/add-icon-green.png';
    });

    // Add event listener for mouseleave
    button.addEventListener('mouseleave', () => {
        // Get the parent square element
        const square = button.closest('.square');
        const addIcon = square.querySelector('.add-icon');
        // Remove CSS styling when mouse leaves
        const singleProduct = button.closest('.single-product');
        singleProduct.style.color = ''
        const productDescription = square.querySelector('.product-description');
        productDescription.style.color = ''
        addIcon.src = '/images/static/add-icon.png';
    });
});
