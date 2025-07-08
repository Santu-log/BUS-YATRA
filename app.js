const allSelects = document.querySelectorAll(".selectLocation");

  allSelects.forEach(select => {
    const parent = select.closest(".location");
    const input = parent.querySelector(".locationInput");

    input.value = select.value;

    select.addEventListener("change", function () {
      input.value = this.value;
    });
  });