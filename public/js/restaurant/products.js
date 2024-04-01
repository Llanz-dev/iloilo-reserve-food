const deleteProduct = async (productID) => {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (confirmed) {
        try {
            const response = await fetch(`/restaurant/delete-product/${productID}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                // Optionally, you can update the UI here
                // For example, remove the deleted product from the UI
                console.log('Product deleted successfully');
                location.reload(); // Or update UI accordingly
            } else {
                console.error('Failed to delete product');
            }
            } catch (error) {
            console.error('An error occurred:', error);
        }
    }
};
  