const routePath = document.getElementById('route-path');

const deleteObject = async (objectId) => {
  const pathValue = routePath.textContent;
  console.log(`${pathValue}/${objectId}`);
  const confirmed = confirm('Are you sure you want to delete this restaurant?');
  if (confirmed) {
    try {
      const response = await fetch(`${pathValue}/${objectId}`, {
        method: 'DELETE'
      });
      console.log(response);
      if (response.ok) {
        // Optionally, you can update the UI here
        // For example, remove the deleted restaurant from the UI
        console.log('Object deleted successfully');
        location.reload(); // Or update UI accordingly
      } else {
        console.error('Failed to delete object');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
};

