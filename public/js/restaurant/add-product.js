//The purpose of this function is to make text from 'Test nAmE' to 'testname'

const selectElement = document.getElementById('category');
const lowerText = document.getElementById('lowerText');

const convertLowerCase = (text) => {
    return text.toLowerCase().replace(/\s/g, '');
}

lowerText.value = convertLowerCase(selectElement.options[selectElement.selectedIndex].innerHTML);

console.log('lowerText.value:', lowerText.value);

selectElement.onchange = () => {
    lowerText.value = convertLowerCase(selectElement.options[selectElement.selectedIndex].innerHTML);
    console.log('lowerText.value:', lowerText.value);
}
