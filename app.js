const allSelects = document.querySelectorAll(".selectLocation");

  allSelects.forEach(select => {
    const parent = select.closest(".location");
    const input = parent.querySelector(".locationInput");

    // ✅ Set input value immediately based on first selected option
    input.value = select.value;

    // ✅ Update input on change
    select.addEventListener("change", function () {
      input.value = this.value;
    });
  });

// const selectbusType=document.querySelectorAll(".busType");
// selectbusType.forEach(select=>{
//     select.addEventListener("change",()=>{
//         const parent=this.closest(".location");
//         const input=parent.querySelector(".inputBustype");
//         input.value=this.value;
//     })
// })