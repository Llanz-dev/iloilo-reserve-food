function toggleDay(day) {
    const isOpenInput = document.getElementById(`isOpen-${day}`);
    const openInput = document.getElementById(`open-${day}`);
    const closeInput = document.getElementById(`close-${day}`);
    const button = document.getElementById(`toggle-${day}`);

    if (isOpenInput.value === "true") {
        isOpenInput.value = "false";
        openInput.disabled = true;
        closeInput.disabled = true;
        button.textContent = "Closed";
        button.classList.remove("btn-secondary");
        button.classList.add("btn-danger");
    } else {
        isOpenInput.value = "true";
        openInput.disabled = false;
        closeInput.disabled = false;
        button.textContent = "Open";
        button.classList.remove("btn-danger");
        button.classList.add("btn-secondary");
    }
}