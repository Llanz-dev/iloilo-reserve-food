const floorPlanImage = document.getElementById('floor-plan-img');
const selectTable = document.getElementById('select-table');
const inputNumPaxID = document.getElementById('num-pax-id');
const floorPlanDescription = document.getElementById('floor-plan-description');

// Change the image and description if dropdown selected
selectTable.addEventListener('change', function() { 
    const selectedOption = selectTable.options[selectTable.selectedIndex];
    const imageUrl = selectedOption.getAttribute('data-image');
    const descriptionContent = selectedOption.getAttribute('data-description');
    const tableID = selectedOption.getAttribute('data-tableID');
    floorPlanDescription.textContent = descriptionContent;
    inputNumPaxID.value = tableID;
    floorPlanImage.src = imageUrl;
});

// Set initial image and description
const initialOption = selectTable.options[selectTable.selectedIndex];
if (initialOption) {
    floorPlanImage.src = initialOption.getAttribute('data-image');
    floorPlanDescription.textContent = initialOption.getAttribute('data-description');
    inputNumPaxID.value = initialOption.getAttribute('data-tableID');
}
