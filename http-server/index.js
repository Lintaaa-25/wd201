window.onload = function () {
  const dobInput = document.getElementById("dob");
  const userForm = document.getElementById("user-form");
  const entriesDiv = document.getElementById("user-entries");
  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];

  const today = new Date();

  // Correct age boundaries based on year only
  const minYear = today.getFullYear() - 55; // Accept all born in this year
  const maxYear = today.getFullYear() - 18; // Accept all born up to this year

  const minDate = new Date(minYear, 0, 1);     // Jan 1, year 55 years ago
  const maxDate = new Date(maxYear, 11, 31);   // Dec 31, year 18 years ago

  const formatDate = (date) => date.toISOString().split("T")[0];
  dobInput.min = formatDate(minDate);
  dobInput.max = formatDate(maxDate);

  // Show entries
  const displayEntries = () => {
    entriesDiv.innerHTML = "";
    entries.forEach((entry, index) => {
      const div = document.createElement("div");
      div.className = "py-4";

      div.innerHTML = `
        <p><strong>Name:</strong> ${entry.name}</p>
        <p><strong>Email:</strong> ${entry.email}</p>
        <p><strong>Password:</strong> ${entry.password}</p>
        <p><strong>DOB:</strong> ${entry.dob}</p>
        <p><strong>Accepted Terms:</strong> ${entry.acceptedTerms ? "Yes" : "No"}</p>
        <hr />
      `;
      entriesDiv.appendChild(div);
    });
  };

  displayEntries();

  // Handle form submission
  userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(userForm);
    const entry = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      dob: formData.get("dob"),
      acceptedTerms: formData.get("acceptTerms") === "on",
    };

    // Save and display
    entries.push(entry);
    localStorage.setItem("userEntries", JSON.stringify(entries));
    displayEntries();
    userForm.reset();
  });
};
