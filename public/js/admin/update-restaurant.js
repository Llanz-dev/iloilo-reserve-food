const updateRestaurant = async (restaurantId) => {
    try {
      const response = await fetch(`/adminux/update-restaurant/${restaurantId}`, {
        method: 'POST'
      });
      if (response.ok) {
        // Redirect to the admin page
        window.location.href = '/adminux';
      } else {
        console.error('Failed to update restaurant');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

