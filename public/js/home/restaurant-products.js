// Get all the buttons with type "submit"
const submitButtons = document.querySelectorAll('button[type="submit"]');

// Add event listeners to each submit button
submitButtons.forEach(button => {
    // Add event listener for mouseenter
    button.addEventListener('mouseenter', () => {
        // Get the parent square element
        const square = button.closest('.square');
        // Get the product name element within the square
        const productName = square.querySelector('.product-name');
        const productDescription = square.querySelector('.product-description');
        const productPrice = square.querySelector('.product-price');
        const addIcon = square.querySelector('.add-icon');
        // Add CSS styling to the product name when hovering
        productName.style.color = '#006D77'; // Change the color as desired
        productDescription.style.color = '#006D77'; // Change the color as desired
        productPrice.style.color = '#006D77';
        addIcon.src = '/images/static/add-icon-green.png';
    });

    // Add event listener for mouseleave
    button.addEventListener('mouseleave', () => {
        // Get the parent square element
        const square = button.closest('.square');
        // Get the product name element within the square
        const productName = square.querySelector('.product-name');
        const productDescription = square.querySelector('.product-description');
        const productPrice = square.querySelector('.product-price');
        const addIcon = square.querySelector('.add-icon');
        // Remove CSS styling when mouse leaves
        productName.style.color = ''; // Restore the default color
        productDescription.style.color = ''; // Change the color as desired
        productPrice.style.color = '';
        addIcon.src = '/images/static/add-icon.png';
    });
});
