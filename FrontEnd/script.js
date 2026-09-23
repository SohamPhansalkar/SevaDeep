// Shared script for all SevaDeep pages.
// Each block only runs on the page that has that form.

// ----- Authentication Check -----
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const publicPages = ["index.html", "login.html", "signup.html", ""];

// Redirect to index.html if user is trying to access a protected page without being logged in
if (!publicPages.includes(currentPage) && !localStorage.getItem("userEmail")) {
    window.location.href = "index.html";
}


// ----- Sign-up form (frontend only, no backend yet) -----
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop the page from reloading
    const messageEl = document.getElementById("formMessage");
    messageEl.textContent = "Signing up...";
    messageEl.style.color = "blue";

    // The browser has already checked the required fields, so just collect the values
    const volunteer = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      contactNumber: document.getElementById("contactNumber").value.trim(),
      gender: document.getElementById("gender").value,
      institution: document.getElementById("institution").value.trim() || null, // optional
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(volunteer)
      });

      if (response.ok) {
        messageEl.style.color = "green";
        messageEl.textContent = "Sign up successful! You can now log in.";
        signupForm.reset();
      } else {
        const errorData = await response.json();
        messageEl.style.color = "red";
        messageEl.textContent = "Error: " + (errorData.detail || "Sign up failed");
      }
    } catch (error) {
      console.error(error);
      messageEl.style.color = "red";
      messageEl.textContent = "Error connecting to the server.";
    }
  });
}

// ----- Log-in form (frontend only, no backend yet) -----
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop the page from reloading
    const messageEl = document.getElementById("formMessage");
    messageEl.textContent = "Logging in...";
    messageEl.style.color = "blue";

    // The browser has already checked email, password and the "not a robot" box
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const userData = await response.json();
        messageEl.style.color = "green";
        messageEl.textContent = "Login successful! Welcome " + userData.firstName + ".";
        
        localStorage.setItem("userEmail", userData.email);
        window.location.href = "home.html";
      } else {
        const errorData = await response.json();
        messageEl.style.color = "red";
        messageEl.textContent = "Error: " + (errorData.detail || "Login failed");
      }
    } catch (error) {
      console.error(error);
      messageEl.style.color = "red";
      messageEl.textContent = "Error connecting to the server.";
    }
  });
}
