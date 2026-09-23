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
              <td>${(totalDuration / 60).toFixed(1)} Hr</td>
              <td>${lastDate}</td>
            </tr>`;
        }).join("");

        // Find logged-in user to show their specific records
        const loggedInEmail = sessionStorage.getItem("userEmail");
        const currentUser = group.members.find(m => m.email === loggedInEmail);
        
        let personalRecordsHtml = "";
        if (currentUser) {
          const recordRows = currentUser.attendances.map(a => {
            return `
              <tr>
                <td>${a.date}</td>
                <td>${a.activityName || "—"}</td>
                <td>${(a.duration / 60).toFixed(1)} Hr</td>
                <td>${a.note || "—"}</td>
              </tr>`;
          }).join("");

          personalRecordsHtml = `
            <div style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;margin-top:2rem;">
              <div style="padding:1.25rem 2rem 0.75rem;">
                <h3 class="h5 fw-bold mb-0">My Attendance Records</h3>
              </div>
              <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:0.9rem">
                  <thead style="background:var(--cream)">
                    <tr>
                      <th>Date</th>
                      <th>Activity Name</th>
                      <th>Duration</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recordRows || `<tr><td colspan="4" class="text-center text-muted py-4">No attendance records yet.</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>`;
        }

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
          </div>
          
          <!-- Personal Records Table -->
          ${personalRecordsHtml}
        `;
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

// ----- Add Attendance form -----
const attendanceForm = document.getElementById("attendanceForm");

if (attendanceForm) {
  attendanceForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop the page from reloading
    const messageEl = document.getElementById("formMessage");
    messageEl.textContent = "Submitting attendance...";
    messageEl.style.color = "blue";

    const attendanceData = {
      userEmail: sessionStorage.getItem("userEmail"),
      date: document.getElementById("activityDate").value,
      duration: parseFloat(document.getElementById("hoursWorked").value),
      activityName: document.getElementById("activityName").value.trim(),
      note: document.getElementById("activityNote").value.trim() || null
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/add-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
      });

      if (response.ok) {
        messageEl.style.color = "green";
        messageEl.textContent = "Attendance submitted successfully!";
        attendanceForm.reset();
      } else {
        const errorData = await response.json();
        messageEl.style.color = "red";
        messageEl.textContent = "Error: " + (errorData.detail || "Failed to submit attendance");
      }
    } catch (error) {
      console.error(error);
      messageEl.style.color = "red";
      messageEl.textContent = "Error connecting to the server.";
    }
  });
}

// ----- Admin Dashboard -----
const groupsAccordion = document.getElementById("groupsAccordion");
const volunteersTableBody = document.getElementById("volunteersTableBody");
const volunteerSearchInput = document.getElementById("volunteerSearchInput");
const totalGroupsBadge = document.getElementById("totalGroupsBadge");

if (groupsAccordion && volunteersTableBody) {
  // Fetch groups
  fetch("http://127.0.0.1:8000/admin/groups")
    .then(res => res.json())
    .then(groups => {
      if(totalGroupsBadge) {
        totalGroupsBadge.textContent = `Total Groups: ${groups.length}`;
      }
      
      const groupsHtml = groups.map((group, index) => {
        const collapseId = `collapseGroup${index}`;
        const headingId = `headingGroup${index}`;
        
        const memberRows = group.members.map(m => {
          const totalDuration = m.attendances.reduce((sum, a) => sum + (a.duration || 0), 0);
          return `
            <tr>
              <td>${m.firstName || ""} ${m.lastName || ""}</td>
              <td>${m.email}</td>
              <td>${(totalDuration / 60).toFixed(1)} hrs</td>
            </tr>
          `;
        }).join("");

        return `
          <div class="accordion-item rounded-0 border-0 mb-2">
            <h2 class="accordion-header" id="${headingId}">
              <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                ${group.name} (${group.memberCount} / ${group.maxSize} Participants)
              </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#groupsAccordion">
              <div class="accordion-body bg-white">
                <p class="small text-muted mb-2">
                  <strong>Institution:</strong> ${group.clgName || "—"} |
                  <strong>Mentor:</strong> ${group.mentorName || "—"}
                </p>
                <table class="table table-sm table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${memberRows || '<tr><td colspan="3" class="text-center text-muted">No members in this group</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }).join("");
      
      groupsAccordion.innerHTML = groupsHtml;
    })
    .catch(err => console.error("Error fetching admin groups:", err));

  // Fetch users
  let allUsers = [];
  
  const renderUsers = (users) => {
    volunteersTableBody.innerHTML = users.map(user => {
      return `
        <tr>
          <td><strong>${user.firstName || ""} ${user.lastName || ""}</strong></td>
          <td>${user.email}</td>
          <td>${user.contactNumber || user.phoneNumber || "—"}</td>
          <td>${user.groupName || "—"}</td>
          <td>
            <a href="userInfo.html?userEmail=${encodeURIComponent(user.email)}" class="btn-seva btn-seva--small" style="background-color: var(--primary); color: #000000ff; text-decoration: none;">More Info</a>
          </td>
        </tr>
      `;
    }).join("");
  };

  fetch("http://127.0.0.1:8000/admin/users")
    .then(res => res.json())
    .then(users => {
      allUsers = users;
      renderUsers(allUsers);
    })
    .catch(err => console.error("Error fetching admin users:", err));

  // Handle Search
  if (volunteerSearchInput) {
    volunteerSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filtered = allUsers.filter(user => {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const groupName = (user.groupName || "").toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm) || groupName.includes(searchTerm);
      });
      renderUsers(filtered);
    });
  }
}

// ----- User Info Dashboard (Admin) -----
const userInfoContent = document.getElementById("userInfoContent");

if (userInfoContent) {
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("userEmail");

  if (!emailParam) {
    userInfoContent.innerHTML = `
      <div class="auth-card text-center" style="color:var(--crimson)">
        <p class="fw-semibold mb-2">⚠ No user specified.</p>
        <a href="admin.html" class="btn-seva btn-seva--small mt-3">Back to Admin Panel</a>
      </div>`;
  } else {
    fetch(`http://127.0.0.1:8000/admin/user/${encodeURIComponent(emailParam)}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to load user info");
        }
        return res.json();
      })
      .then(user => {
        const totalDuration = user.attendances.reduce((sum, a) => sum + (a.duration || 0), 0);
        
        let groupHtml = "";
        if (user.groupInfo) {
          groupHtml = `
            <div class="card p-4 border-0 shadow-sm mb-4" style="background: var(--card)">
              <h2 class="h5 fw-bold mb-3">Group Information</h2>
              <p class="mb-1"><strong>Group Name:</strong> ${user.groupInfo.name}</p>
              <p class="mb-1"><strong>Institution:</strong> ${user.groupInfo.clgName || "—"}</p>
              <p class="mb-1"><strong>Mentor:</strong> ${user.groupInfo.mentorName || "—"}</p>
              <p class="mb-0"><strong>Members:</strong> ${user.groupInfo.memberCount} / ${user.groupInfo.maxSize}</p>
            </div>
          `;
        } else {
          groupHtml = `
            <div class="card p-4 border-0 shadow-sm mb-4" style="background: var(--card)">
              <h2 class="h5 fw-bold mb-3">Group Information</h2>
              <p class="text-muted mb-0">This user has not joined any group yet.</p>
            </div>
          `;
        }

        const attendanceRows = user.attendances.map(a => {
          return `
            <tr>
              <td>${a.date}</td>
              <td>${a.activityName || "—"}</td>
              <td>${(a.duration / 60).toFixed(1)} Hr</td>
              <td>${a.note || "—"}</td>
            </tr>
          `;
        }).join("");

        userInfoContent.innerHTML = `
          <div class="d-flex align-items-center gap-3 mb-4">
            <span class="icon-circle" aria-hidden="true" style="width: 50px; height: 50px;">
              <svg viewBox="0 0 24 24" style="width: 24px; height: 24px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div>
              <h1 class="h3 mb-0">${user.firstName || ""} ${user.lastName || ""}</h1>
              <p class="text-muted mb-0">${user.email}</p>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="card p-4 border-0 shadow-sm mb-4" style="background: var(--card)">
                <h2 class="h5 fw-bold mb-3">Profile Details</h2>
                <p class="mb-1"><strong>Contact Number:</strong> ${user.contactNumber || user.phoneNumber || "—"}</p>
                <p class="mb-1"><strong>Gender:</strong> ${user.gender || "—"}</p>
                <p class="mb-0"><strong>Institution:</strong> ${user.institution || "—"}</p>
              </div>
            </div>
            <div class="col-md-6">
              ${groupHtml}
            </div>
          </div>

          <div class="card p-4 border-0 shadow-sm" style="background: var(--card)">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h5 fw-bold mb-0">Attendance History</h2>
              <span class="badge" style="background:var(--crimson);color:#fff">Total: ${(totalDuration / 60).toFixed(1)} Hrs</span>
            </div>
            <div class="table-responsive bg-white rounded">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Activity Name</th>
                    <th>Duration</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendanceRows || '<tr><td colspan="4" class="text-center text-muted py-4">No attendance records found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        `;
      })
      .catch(err => {
        userInfoContent.innerHTML = `
          <div class="auth-card text-center" style="color:var(--crimson)">
            <p class="fw-semibold mb-2">⚠ Error loading user info.</p>
            <p style="font-size:0.875rem">${err.message}</p>
            <a href="admin.html" class="btn-seva btn-seva--small mt-3">Back to Admin Panel</a>
          </div>`;
      });
  }
}
