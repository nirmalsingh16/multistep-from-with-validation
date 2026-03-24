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

// ERROR
function showError(input, message) {
  const parent =
    input.closest(".inputGroup") ||
    input.closest(".inputGrouptextarea") ||
    input.parentElement;
  let err = parent.querySelector(".error");
  if (!err) {
    err = document.createElement("small");
    err.classList.add("error");
    parent.appendChild(err);
  }
  err.textContent = message;
}

function clearError(input) {
  const parent =
    input.closest(".inputGroup") ||
    input.closest(".inputGrouptextarea") ||
    input.parentElement;
  const err = parent.querySelector(".error");
  if (err) err.remove();
}

// VALIDATION
function validatePage() {
  let valid = true;

  const inputs = pages[currentPage].querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    clearError(input);
    const value = input.value.trim();

    if (input.type === "file") {
      if (input.hasAttribute("required") && input.files.length === 0) {
        showError(input, "Please upload an image");
        valid = false;
      }
      return;
    }

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

  // SKILLS VALIDATION
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

// NEXT
nextBtn.addEventListener("click", () => {
  if (!validatePage()) return;

  // On last real step (page 2 = skills), save then show resume
  if (currentPage === pages.length - 2) {
    saveDataWithImage(() => {
      icons[currentPage].classList.add("active");
      currentPage++;
      showPage(currentPage);
      backBtn.disabled = false;
      nextBtn.textContent = "Submit";
      fillResume();
    });
    return;
  }

  // Final submit
  if (currentPage === pages.length - 1) {
    alert("Resume submitted successfully!");
    return;
  }

  icons[currentPage].classList.add("active");
  currentPage++;
  showPage(currentPage);
  backBtn.disabled = false;

  if (currentPage === pages.length - 1) {
    nextBtn.textContent = "Submit";
    fillResume();
  }
});

// BACK
backBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    showPage(currentPage);
    icons[currentPage].classList.remove("active");
  }

  if (currentPage === 0) backBtn.disabled = true;

  nextBtn.textContent = "Next";
});

// SKILLS SELECTION
document.querySelectorAll(".dropdownbox select").forEach((select) => {
  select.addEventListener("change", function () {
    const value = this.value;
    if (!value) return;

    const box = this.closest(".dropdownbox");
    const display = box.querySelector(".selectedSkilles");

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

// SAVE DATA
function saveDataWithImage(callback) {
  const data = {};
  const inputs = document.querySelectorAll("input, select, textarea");
  let fileInput = null;

  inputs.forEach((input) => {
    if (input.type === "file") {
      fileInput = input;
    } else if (input.name) {
      data[input.name] = input.value;
    }
  });

  // Education: collect all education blocks
  const educationBlocks = document.querySelectorAll(".inputContainer");
  const educations = [];
  educationBlocks.forEach((block) => {
    const degree = block.querySelector("[name^='degree']");
    const institute = block.querySelector("[name^='institutename']");
    const year = block.querySelector("[name^='passingyear']");
    const grade = block.querySelector("[name^='grade']");
    if (degree && institute && year && grade) {
      educations.push({
        degree: degree.value,
        institute: institute.value,
        year: year.value,
        grade: grade.value,
      });
    }
  });
  data.educations = educations;

  // Skills
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

  // Image
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

// ADD EDUCATION
let eduCount = 1;

document
  .querySelector(".addEducation button")
  .addEventListener("click", (e) => {
    e.preventDefault();
    eduCount++;

    const div = document.createElement("div");
    div.classList.add("inputContainer");

    div.innerHTML = `
    <h4 class="eduHash">#Education ${eduCount}</h4>
    <div class="inputGroup">
      <i class="fa-solid fa-user-graduate"></i>
      <input type="text" name="degree${eduCount}" placeholder="Degree Level" required />
    </div>
    <div class="inputGroup">
      <i class="fa-solid fa-building-columns"></i>
      <input type="text" name="institutename${eduCount}" placeholder="Institute name" required />
    </div>
    <div class="inputGroup">
      <i class="fa-solid fa-calendar-days"></i>
      <input type="number" name="passingyear${eduCount}" placeholder="Passing Year" required />
    </div>
    <div class="inputGroup">
      <i class="fa-solid fa-c"></i>
      <input type="text" name="grade${eduCount}" placeholder="Grade/CGPA" required />
    </div>
    <button type="button" class="deleteEdu" style="color:red; margin: 5px 0 10px;">Delete</button>
  `;

    document.querySelector(".addEducation").before(div);
    div.querySelector(".deleteEdu").onclick = () => div.remove();
  });

// FILL RESUME (called after saveDataWithImage, so localStorage is ready)
function fillResume() {
  const data = JSON.parse(localStorage.getItem("formData"));
  if (!data) return;

  // Personal info
  document.querySelector(".resumename").textContent = data.name || "";
  document.querySelector(".resumeemail").textContent = data.email || "";
  document.querySelector(".resumephone").textContent = data.phonenumber || "";
  document.querySelector(".resumeDob").textContent = data.date || "";
  document.querySelector(".resumegender").textContent = data.gender || "";

  // Photo
  if (data.image) {
    document.querySelector(".personalInfo img").src = data.image;
  }

  // Education
  const educationSection = document.querySelector(".education");
  educationSection.innerHTML = "<h2>Education</h2>";

  if (data.educations && data.educations.length > 0) {
    data.educations.forEach((edu) => {
      const div = document.createElement("div");
      div.classList.add("educationData");
      div.innerHTML = `
        <h4 class="courseName">${edu.degree}</h4>
        <p class="institue">${edu.institute}</p>
        <div class="yearGrade">
          <h5>Year: <span>${edu.year}</span></h5>
          <h5>CGPA: <span>${edu.grade}</span></h5>
        </div>
      `;
      educationSection.appendChild(div);
    });
  }

  // Certifications
  const certSection = document.querySelector(".certificate");
  certSection.innerHTML = "<h2>Certification</h2>";
  const certDiv = document.createElement("div");

  const certText = data.certification || "";
  const certLines = certText
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);
  if (certLines.length > 0) {
    certLines.forEach((cert) => {
      const p = document.createElement("p");
      p.textContent = cert;
      certDiv.appendChild(p);
    });
  } else {
    const p = document.createElement("p");
    p.textContent = certText;
    certDiv.appendChild(p);
  }
  certSection.appendChild(certDiv);

  // Skills
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
