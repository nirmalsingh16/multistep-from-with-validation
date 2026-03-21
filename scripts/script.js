let currentPage = 0;

const pages = document.querySelectorAll(".innerDataInputs");
const icons = document.querySelectorAll(".progressBar .icons");

const nextBtn = document.querySelector(".nextBtn");
const backBtn = document.querySelector(".backBtn");

// SHOW PAGE
function showPage(index) {
  pages.forEach((p) => p.classList.add("hide"));
  pages[index].classList.remove("hide");
}

//  ERROR
function showError(input, message) {
  const parent = input.closest(".inputGroup") || input.parentElement;

  let err = parent.querySelector(".error");
  if (!err) {
    err = document.createElement("small");
    err.classList.add("error");
    parent.appendChild(err);
  }

  err.textContent = message;
}

function clearError(input) {
  const parent = input.closest(".inputGroup") || input.parentElement;
  const err = parent.querySelector(".error");
  if (err) err.remove();
}

//  VALIDATION
function validatePage() {
  let valid = true;

  const inputs = pages[currentPage].querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    clearError(input);
    const value = input.value.trim();

    if (input.hasAttribute("required") && value === "") {
      showError(input, "This field is required");
      valid = false;
      return;
    }

    if (input.name === "name" && value.length < 3) {
      showError(input, "Minimum 3 characters required");
      valid = false;
    }

    if (input.name === "phonenumber" && !/^[0-9]{10}$/.test(value)) {
      showError(input, "Phone must be 10 digits");
      valid = false;
    }
  });

  //  SKILLS VALIDATION
  if (currentPage === 2) {
    const skillBoxes = document.querySelectorAll(".dropdownbox");

    skillBoxes.forEach((box) => {
      const skills = box.querySelectorAll(".skill");

      let err = box.querySelector(".error");

      if (skills.length === 0) {
        if (!err) {
          err = document.createElement("small");
          err.classList.add("error");
          box.appendChild(err);
        }
        err.textContent = "Select at least one skill";
        valid = false;
      } else {
        if (err) err.remove();
      }
    });

    const cert = document.querySelector("textarea[name='certification']");
    clearError(cert);

    if (!cert.value.trim()) {
      showError(cert, "This field is required");
      valid = false;
    }
  }

  return valid;
}

//  NEXT
nextBtn.addEventListener("click", () => {
  // FINAL SUBMIT
  // if (currentPage === pages.length - 1) {
  //   saveDataWithImage(() => {
  //     window.location.href = "resume.html";
  //   });
  //   return;
  // }

  if (!validatePage()) return;

  icons[currentPage].classList.add("active");

  currentPage++;
  showPage(currentPage);

  backBtn.disabled = false;

  if (currentPage === pages.length - 1) {
    nextBtn.textContent = "Submit";
    fillResume(); // preview
  }
});

//  BACK
backBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    showPage(currentPage);
    icons[currentPage].classList.remove("active");
  }

  if (currentPage === 0) backBtn.disabled = true;

  nextBtn.textContent = "Next";
});

//  SKILLS SELECTION
document.querySelectorAll(".dropdownbox select").forEach((select) => {
  select.addEventListener("change", function () {
    const value = this.value;
    if (!value) return;

    const box = this.closest(".dropdownbox");
    const display = box.querySelector(".selectedSkilles");

    // prevent duplicate
    const exists = [...display.querySelectorAll(".skill")].some(
      (el) => el.dataset.value === value,
    );
    if (exists) {
      this.value = "";
      return;
    }

    const span = document.createElement("span");
    span.classList.add("skill");
    span.dataset.value = value;

    span.innerHTML = `${value} <i style="cursor:pointer;">✖</i>`;

    span.querySelector("i").onclick = () => span.remove();

    display.appendChild(span);

    this.value = "";
  });
});

// ================= SAVE DATA =================
function saveDataWithImage(callback) {
  const data = {};
  const inputs = document.querySelectorAll("input, select, textarea");

  let fileInput = null;

  inputs.forEach((input) => {
    if (input.type === "file") {
      fileInput = input;
    } else {
      data[input.name] = input.value;
    }
  });

  // skills
  const techSkills = [];
  const otherSkills = [];

  document.querySelectorAll(".dropdownbox").forEach((box, index) => {
    const skills = [...box.querySelectorAll(".skill")].map(
      (el) => el.dataset.value,
    );

    if (index === 0) techSkills.push(...skills);
    else otherSkills.push(...skills);
  });

  data.techSkills = techSkills;
  data.otherSkills = otherSkills;

  // image
  if (fileInput && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function () {
      data.image = reader.result;
      localStorage.setItem("formData", JSON.stringify(data));
      if (callback) callback();
    };

    reader.readAsDataURL(fileInput.files[0]);
  } else {
    localStorage.setItem("formData", JSON.stringify(data));
    if (callback) callback();
  }
}

// ================= ADD EDUCATION =================
let eduCount = 1;

document
  .querySelector(".addEducation button")
  .addEventListener("click", (e) => {
    e.preventDefault();
    eduCount++;

    const div = document.createElement("div");
    div.classList.add("inputContainer");

    div.innerHTML = `
    <h4>#Education ${eduCount}</h4>

    <div class="inputGroup">
      <input type="text" name="degree${eduCount}" placeholder="Degree" required />
    </div>

    <div class="inputGroup">
      <input type="text" name="institutename${eduCount}" placeholder="Institute" required />
    </div>

    <div class="inputGroup">
      <input type="number" name="passingyear${eduCount}" placeholder="Year" required />
    </div>

    <div class="inputGroup">
      <input type="text" name="grade${eduCount}" placeholder="Grade" required />
    </div>

    <button type="button" class="deleteEdu" style="color:red;">Delete</button>
  `;

    document.querySelector(".addEducation").before(div);

    div.querySelector(".deleteEdu").onclick = () => div.remove();
  });

// ================= RESUME PREVIEW =================
function fillResume() {
  const data = JSON.parse(localStorage.getItem("formData"));
  if (!data) return;

  document.querySelector(".resumename").textContent = data.name || "";
  document.querySelector(".resumeemail").textContent = data.email || "";
  document.querySelector(".resumephone").textContent = data.phonenumber || "";
  document.querySelector(".resumeDob").textContent = data.date || "";
  document.querySelector(".resumegender").textContent = data.gender || "";

  // image
  if (data.image) {
    document.querySelector(".personalInfo img").src = data.image;
  }

  // skills
  const techBox = document.querySelector(".techskills");
  const otherBox = document.querySelector(".otherskills");

  techBox.innerHTML = "<h2>Technical Skills</h2>";
  otherBox.innerHTML = "<h2>Other Skills</h2>";

  data.techSkills?.forEach((skill) => {
    const p = document.createElement("p");
    p.textContent = skill;
    techBox.appendChild(p);
  });

  data.otherSkills?.forEach((skill) => {
    const p = document.createElement("p");
    p.textContent = skill;
    otherBox.appendChild(p);
  });
}

showPage(currentPage);
backBtn.disabled = true;
