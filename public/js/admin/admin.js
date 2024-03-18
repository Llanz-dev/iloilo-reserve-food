const existingImageContainer = document.getElementById('existingImageContainer');
const existingImage = document.getElementById('existingImage');


// Add event listener to file input to update displayed image
const imageInput = document.getElementById('image');
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file) {
    console.log(existingImageContainer);
    console.log(existingImage);
    const reader = new FileReader();
    reader.onload = (e) => {
      existingImage.src = e.target.result;
      existingImageContainer.style.display = 'block'; // Show existing image container
    };
    reader.readAsDataURL(file);
  } else {
    existingImageContainer.style.display = 'none'; // Hide existing image container if no file is selected
  }
});
console.log('Hello Admin');