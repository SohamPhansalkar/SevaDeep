// Shared script for all SevaDeep pages.
// Each block only runs on the page that has that form.

// ----- Authentication Check -----
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const publicPages = ["index.html", "login.html", "signup.html", ""];

// Redirect to index.html if user is trying to access a protected page without being logged in
if (!publicPages.includes(currentPage) && !sessionStorage.getItem("userEmail")) {
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
        window.location.href = "login.html";
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
        
        sessionStorage.setItem("userEmail", userData.email);
        if (userData.groupId) {
          sessionStorage.setItem("groupId", userData.groupId);
        }
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

// ----- Create Group form -----
const createGroupForm = document.getElementById("createGroupForm");

if (createGroupForm) {
  createGroupForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop the page from reloading
    const messageEl = document.getElementById("formMessage");
    messageEl.textContent = "Creating group...";
    messageEl.style.color = "blue";

    const groupData = {
      name: document.getElementById("groupName").value.trim(),
      maxSize: parseInt(document.getElementById("maxParticipants").value),
      clgName: document.getElementById("schoolName").value.trim() || null,
      mentorName: document.getElementById("mentorName").value.trim() || null,
      creatorEmail: sessionStorage.getItem("userEmail")
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        const result = await response.json();
        messageEl.style.color = "green";
        messageEl.textContent = "Group '" + result.name + "' created successfully!";
        createGroupForm.reset();
        sessionStorage.setItem("groupId", result.id);
        window.location.href = "home.html";
      } else {
        const errorData = await response.json();
        messageEl.style.color = "red";
        messageEl.textContent = "Error: " + (errorData.detail || "Failed to create group");
      }
    } catch (error) {
      console.error(error);
      messageEl.style.color = "red";
      messageEl.textContent = "Error connecting to the server.";
    }
  });
}

// ----- Home Dashboard -----
const dashboardContent = document.getElementById("dashboardContent");

if (dashboardContent) {
  const groupId = sessionStorage.getItem("groupId");
  const userEmail = sessionStorage.getItem("userEmail");

  // Show logged-in user's name in welcome header
  const welcomeNameEl = document.getElementById("welcomeName");
  if (welcomeNameEl && userEmail) {
    welcomeNameEl.textContent = userEmail.split("@")[0];
  }

  // Logout button clears storage and redirects
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("groupId");
      window.location.href = "index.html";
    });
  }

  if (!groupId) {
    // No group yet — show empty state
    dashboardContent.innerHTML = `
      <div class="auth-card text-center mx-auto" style="max-width:500px">
        <span class="icon-circle mb-3" aria-hidden="true" style="width:72px;height:72px">
          <svg viewBox="0 0 24 24" style="width:32px;height:32px">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </span>
        <h2 class="h4 fw-bold mt-2">You haven't joined a group yet.</h2>
        <p class="mb-4" style="color:#4a4a4a;font-size:0.95rem">
          To start viewing and marking attendance, create or join a volunteer group.
        </p>
        <input type="text" id="groupIdInput" class="form-control mb-2" placeholder="Enter Group ID">
        <button id="joinGroupBtn" class="btn-seva w-100">Join a Group</button>
      </div>`;

    // Attach join group button handler
    document.getElementById("joinGroupBtn").addEventListener("click", async function () {
      const groupIdInput = document.getElementById("groupIdInput").value.trim();
      if (!groupIdInput) {
        alert("Please enter a Group ID.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/join-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: parseInt(groupIdInput),
            userEmail: sessionStorage.getItem("userEmail")
          })
        });

        if (response.ok) {
          const result = await response.json();
          sessionStorage.setItem("groupId", result.id);
          window.location.reload(); // reload to show group dashboard
        } else {
          const errorData = await response.json();
          alert("Error: " + (errorData.detail || "Failed to join group"));
        }
      } catch (error) {
        console.error(error);
        alert("Error connecting to the server.");
      }
    });
  } else {
    // Fetch group details from backend
    fetch(`http://127.0.0.1:8000/group/${groupId}/details`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to load group");
        }
        return res.json();
      })
      .then((group) => {
        // Build members rows
        const memberRows = group.members.map((m) => {
          const totalDuration = m.attendances.reduce((sum, a) => sum + (a.duration || 0), 0);
          const sessions = m.attendances.length;
          const lastDate = sessions > 0 ? m.attendances[0].date : "—";
          return `
            <tr>
              <td class="fw-semibold">${m.firstName || ""} ${m.lastName || ""}</td>
              <td>${m.email}</td>
              <td>${m.gender || "—"}</td>
              <td>${m.institution || "—"}</td>
              <td><span class="badge" style="background:var(--crimson);color:#fff">${sessions}</span></td>
              <td>${totalDuration} min</td>
              <td>${lastDate}</td>
            </tr>`;
        }).join("");

        dashboardContent.innerHTML = `
          <!-- Group Info Card -->
          <div style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.07);padding:1.5rem 2rem;margin-bottom:1.5rem;">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <h2 class="h3 fw-bold mb-1">${group.name}</h2>
                <p class="mb-0" style="color:#6b6b6b;font-size:0.9rem">
                  ${group.clgName ? `<strong>Institution:</strong> ${group.clgName} &nbsp;|&nbsp;` : ""}
                  ${group.mentorName ? `<strong>Mentor:</strong> ${group.mentorName} &nbsp;|&nbsp;` : ""}
                  <strong>Members:</strong> ${group.memberCount} / ${group.maxSize}
                </p>
              </div>
              <a href="add-attendance.html" class="btn-seva btn-seva--small">+ Add Attendance</a>
            </div>
          </div>

          <!-- Members Table -->
          <div style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
            <div style="padding:1.25rem 2rem 0.75rem;">
              <h3 class="h5 fw-bold mb-0">Members &amp; Attendance</h3>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0" style="font-size:0.9rem">
                <thead style="background:var(--cream)">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Institution</th>
                    <th>Sessions</th>
                    <th>Total Hours</th>
                    <th>Last Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  ${memberRows || `<tr><td colspan="7" class="text-center text-muted py-4">No members yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>`;
      })
      .catch((err) => {
        dashboardContent.innerHTML = `
          <div class="auth-card text-center" style="color:var(--crimson)">
            <p class="fw-semibold mb-2">⚠ Could not load group details.</p>
            <p style="font-size:0.875rem">${err.message}</p>
          </div>`;
      });
  }
}
