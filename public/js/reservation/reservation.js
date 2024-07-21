const floorPlanImage = document.getElementById('floor-plan-img');
const selectTable = document.getElementById('select-table');
const inputNumPaxID = document.getElementById('num-pax-id');
const floorPlanDescription = document.getElementById('floor-plan-description');
const numberOfSitsElement = document.getElementById('number-of-sits');
const otherOptionContainer = document.getElementById('other-option-container');
const otherOptionField = document.getElementById('other-option-field');
const sitsTag = document.getElementById('sits-tag');

const otherOption = () => {
    floorPlanImage.src = '/images/static/no-picture-available.png';
    floorPlanImage.style.width = '0'; // Remove the image    
    sitsTag.style.display = 'none';
    otherOptionContainer.style.display = 'block';
    otherOptionField.setAttribute('required', 'true');
}

// Change the image and description if dropdown selected
selectTable.addEventListener('change', function() { 
    const selectedOption = selectTable.options[selectTable.selectedIndex];
    const imageUrl = selectedOption.getAttribute('data-image');
    const descriptionContent = selectedOption.getAttribute('data-description');
    const tableID = selectedOption.getAttribute('data-tableID');
    const numberOfSits = selectedOption.getAttribute('data-numberOfSits');
    numberOfSitsElement.textContent = numberOfSits;
    floorPlanDescription.textContent = descriptionContent;
    inputNumPaxID.value = tableID;
    if (imageUrl) {
        floorPlanImage.src = imageUrl;
        floorPlanImage.style.width = '500px';
        sitsTag.style.display = 'block';
        otherOptionContainer.style.display = 'none';
        otherOptionField.removeAttribute('required');
    } else {
        otherOption();
    }
});

// Set initial image and description
const initialOption = selectTable.options[selectTable.selectedIndex];
if (initialOption) {
    floorPlanImage.src = initialOption.getAttribute('data-image');
    floorPlanDescription.textContent = initialOption.getAttribute('data-description');
    inputNumPaxID.value = initialOption.getAttribute('data-tableID');
    numberOfSitsElement.textContent = initialOption.getAttribute('data-numberOfSits');

    const createReservationButton = document.getElementById('create-reservation-button');
    const hasFloorPlanImage = floorPlanImage.getAttribute('src') === 'null';
    if (hasFloorPlanImage) {
        otherOption();
        createReservationButton.disabled = true;
    } else {
        createReservationButton.disabled = false;
    }
}
