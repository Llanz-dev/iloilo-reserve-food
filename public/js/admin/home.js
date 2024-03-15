const deleteRestaurant = async (restaurantId) => {
  const confirmed = confirm('Are you sure you want to delete this restaurant?');
  if (confirmed) {
    try {
      const response = await fetch(`/adminux/delete-restaurant/${restaurantId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Optionally, you can update the UI here
        // For example, remove the deleted restaurant from the UI
        console.log('Restaurant deleted successfully');
        location.reload(); // Or update UI accordingly
      } else {
        console.error('Failed to delete restaurant');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
};

