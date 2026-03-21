const data = JSON.parse(localStorage.getItem("formData"));

document.querySelector(".resumename").textContent = data.name;
document.querySelector(".personalInfo img").src = data.image;
