// Shared script for all SevaDeep pages.
// Each block only runs on the page that has that form.

// ----- Sign-up form (frontend only, no backend yet) -----
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    // The browser has already checked the required fields, so just collect the values
    const volunteer = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      contactNumber: document.getElementById("contactNumber").value.trim(),
      gender: document.getElementById("gender").value,
      institution: document.getElementById("institution").value.trim(), // optional, can be empty
    };

    console.log(volunteer); // TODO (later): send this to the Python backend

    document.getElementById("formMessage").textContent =
      "Form is valid. Backend is not connected yet.";
  });
}

// ----- Log-in form (frontend only, no backend yet) -----
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    // The browser has already checked email, password and the "not a robot" box
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // TODO (later): send email and password to the Python backend
    document.getElementById("formMessage").textContent =
      "Form is valid. Backend is not connected yet.";
  });
}
