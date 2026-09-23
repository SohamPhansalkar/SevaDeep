# SevaDeep NGO Attendance Logging System - Full Detailed Context

## 🏗️ Overall Architecture
SevaDeep is a decoupled web application designed to track volunteer groups, their members, and the hours/activities logged by each volunteer. 
- **Frontend**: A traditional static HTML/CSS/JS site (Vanilla JS, Bootstrap CSS). 
- **Backend**: A modern REST API built with Python (FastAPI), connecting to a MySQL database via SQLAlchemy ORM.

---

## 🐍 Backend Architecture (FastAPI & SQLAlchemy)

The backend is modularized to separate concerns across database connection, table definitions, schemas, and individual API routes.

### 1. Database Layer
- **`DBConnection.py`**: Initializes the SQLAlchemy `engine` using `pymysql` to connect to MySQL. Environment variables (like `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`) are loaded from a `.env` file. Provides the `get_db` dependency for route handlers.
- **`tables.py`**: Defines the SQLAlchemy ORM models:
  - `User` (`users` table): Stores volunteers (ID, email, phone number, password, first/last name, gender, institution).
  - `Group` (`grps` table): Stores volunteer groups (ID, name, max size, current member count, college name, mentor, and creator ID).
  - `GroupMember` (`grpMembers` table): A junction table linking Users to Groups (many-to-many relationship, although logic primarily assumes a user belongs to one active group).
  - `Attendance` (`attendance` table): Tracks a user's volunteer sessions (ID, user ID, date, duration in minutes, activity name, optional note).

### 2. Data Validation Layer
- **`schemas.py`**: Defines Pydantic models for incoming requests and outgoing responses.
  - **User Schemas**: `UserCreate`, `UserLogin`, `UserResponse`.
  - **Group Schemas**: `GroupCreate`, `GroupResponse`, `GroupDetailsResponse` (which embeds members and their attendances).
  - **Attendance Schemas**: `AttendanceCreate`, `AttendanceResponse`.
  - **Admin Schemas**: `AdminUserResponse`, `AdminUserDetailsResponse`.

### 3. API Routes (Endpoints)
Registered in `main.py`, the backend is divided into specialized routers:
- **Authentication**:
  - `POST /signup` (`signUp.py`): Creates a new user in the database.
  - `POST /login` (`LogIn.py`): Verifies plain-text credentials. If successful, checks `GroupMember` to see if the user belongs to a group, and attaches `groupId` to the response.
- **Group Management**:
  - `POST /create-group` (`createGroup.py`): Creates a new group and automatically assigns the creator as the first member (`memberCount=1`).
  - `POST /join-group` (`joinGroup.py`): Allows a user to join an existing group using a Group ID. Validates that the group isn't full and the user isn't already a member. Increments the `memberCount`.
  - `GET /group/{group_id}/details` (`groupDetails.py`): Fetches a group's metadata, a list of all its members, and the complete attendance history for each member.
- **Attendance Logging**:
  - `POST /add-attendance` (`addAttendance.py`): Logs a new attendance record. Takes duration in hours from the frontend and multiplies it by 60 to store as minutes in the database integer column.
- **Admin Portal (`admin.py`)**:
  - `GET /admin/groups`: Returns a comprehensive list of all groups, their members, and member attendances (using the `GroupDetailsResponse` schema structure).
  - `GET /admin/users`: Returns all users globally, appending their current `groupName` (if applicable) for the admin overview table.
  - `GET /admin/user/{email}`: Returns deep analytics for a single user, including profile details, their group info, and a historical log of every attendance record they have submitted.

---

## 🖥️ Frontend Architecture (Vanilla HTML/JS)

The frontend is fully connected to the FastAPI backend using standard `fetch` API requests, relying on `sessionStorage` for state management.

### 1. State Management & Protection
- **`sessionStorage`**: The frontend tracks active sessions using `sessionStorage.getItem("userEmail")` and `sessionStorage.getItem("groupId")`.
- **Route Protection**: The unified `script.js` checks the current URL path. If the page is not in the public list (`index.html`, `login.html`, `signup.html`) and no `userEmail` exists, it redirects the user back to `index.html`.

### 2. Core Pages and Functionality
- **`index.html`**: Public landing page explaining the platform.
- **`signup.html`**: Form that submits user details to `POST /signup`. Redirects to login on success.
- **`login.html`**: Form that submits to `POST /login`. On success, stores `userEmail` and `groupId` in `sessionStorage` and redirects to the home dashboard.
- **`home.html` (Dashboard)**:
  - If the user **does not** have a `groupId`: Displays an empty state UI where they can either click "Create a Group" or input an ID to "Join a Group".
  - If the user **has** a `groupId`: Fetches `/group/{groupId}/details`. Renders a group summary card, a "Members & Attendance" table (calculating total hours dynamically from minutes), and a "My Attendance Records" table specifically filtered for the logged-in user.
- **`create-group.html`**: Form to instantiate a new group. On success, updates `sessionStorage` with the new `groupId`.
- **`add-attendance.html`**: Form to submit volunteer hours (`POST /add-attendance`). Submits float hours which the backend converts.

### 3. Admin Pages
- **`admin.html`**: 
  - Protected by a simple IIFE prompt checking for username `admin` and password `admin`.
  - Dynamically fetches `/admin/groups` to render an accordion of all groups, displaying members and calculated total hours.
  - Dynamically fetches `/admin/users` to render a master table of all registered volunteers.
  - Implements a frontend real-time search filter (by name, email, or group name) on the volunteer table.
  - Each volunteer row features a "More Info" button linking to their specific details page.
- **`userInfo.html`**: 
  - Admin sub-page for inspecting a specific user.
  - Reads `?userEmail=` from the URL parameters.
  - Fetches `/admin/user/{email}` to display a detailed dashboard containing the user's profile information, the group they belong to, and an itemized table of their attendance history with a total accumulated hours calculation.

## 🚀 Current State Summary
The application is fully functional end-to-end. Users can register, log in, create or join groups, log hours, and view their dashboard. Admins can log in to view global metrics, search for users, and drill down into individual volunteer statistics.

---

## 🔗 Endpoint Details & Required Data

Here is a comprehensive list of all backend endpoints, what they require, and example payloads.

### 1. `POST /signup`
Creates a new volunteer.
- **Required Body:**
  ```json
  {
    "email": "user@example.com",
    "phoneNumber": "9876543210",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "institution": "SIT Pune"
  }
  ```
- **Response:** Returns the created user object (excluding the password).

### 2. `POST /login`
Authenticates a volunteer.
- **Required Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** Returns the user object, importantly including `groupId` if the user is part of a group.

### 3. `POST /create-group`
Creates a new group and sets the creator as the first member.
- **Required Body:**
  ```json
  {
    "name": "Food Distribution Alpha",
    "maxSize": 20,
    "clgName": "SIT Pune",
    "mentorName": "Prof. Sharma",
    "creatorId": 1
  }
  ```
- **Response:** Returns the created group object.

### 4. `POST /join-group`
Adds a user to a group using a Group ID.
- **Required Body:**
  ```json
  {
    "groupId": 12,
    "userEmail": "user@example.com"
  }
  ```
- **Response:** Returns the joined group object.

### 5. `GET /group/{group_id}/details`
Fetches a single group with all members and their respective attendance logs.
- **Required Parameters:** `group_id` (integer) in the URL path.
- **Response:** 
  ```json
  {
    "id": 12,
    "name": "Food Distribution Alpha",
    "maxSize": 20,
    "memberCount": 5,
    "clgName": "SIT Pune",
    "mentorName": "Prof. Sharma",
    "creatorId": 1,
    "members": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "attendances": [
          {
            "id": 100,
            "userId": 1,
            "date": "2023-10-01",
            "duration": 120, // in minutes
            "activityName": "Food Drive",
            "note": "Great work"
          }
        ]
      }
    ]
  }
  ```

### 6. `POST /add-attendance`
Records a new volunteer session.
- **Required Body:** (Note: frontend sends duration in hours, backend converts it to minutes internally)
  ```json
  {
    "userEmail": "user@example.com",
    "date": "2023-10-05",
    "duration": 2.5,
    "activityName": "Teaching",
    "note": "Taught math to 5th graders"
  }
  ```
- **Response:** Returns the created attendance object (duration mapped to 150 minutes).

### 7. `GET /admin/groups`
Retrieves all groups, members, and all attendance records.
- **Required Parameters:** None
- **Response:** An array of `GroupDetailsResponse` objects (same structure as `GET /group/{group_id}/details`).

### 8. `GET /admin/users`
Retrieves all users across the system.
- **Required Parameters:** None
- **Response:** An array of user objects with an added `groupName` field.

### 9. `GET /admin/user/{email}`
Retrieves deep information for a specific user.
- **Required Parameters:** `email` (string) in the URL path.
- **Response:** The user object containing nested `groupInfo` and a list of `attendances`.

---

## 🌐 Frontend URLs

These are the accessible web pages on the client side:
- **`index.html`**: Landing / Home Page.
- **`login.html`**: Login interface.
- **`signup.html`**: Registration interface.
- **`home.html`**: The main user dashboard. Displays group options, group details, and personal records.
- **`create-group.html`**: UI to form a new volunteer group.
- **`add-attendance.html`**: UI to submit a new time log.
- **`admin.html`**: The admin control panel displaying aggregate stats, all groups, and all volunteers.
- **`userInfo.html?userEmail=...`**: The admin detail view for a specific volunteer.

---

## 🔄 Example Data Flow: User Login Process

To understand how the frontend and backend communicate, here is a step-by-step trace of a user logging in:

1. **User Interaction (`login.html`)**:
   - The user navigates to `login.html` and fills out the "Email Address" and "Password" fields.
   - The user clicks the "Login" button.

2. **Frontend Logic (`script.js`)**:
   - An event listener catches the form `submit` event and calls `event.preventDefault()` to stop the page from reloading.
   - It extracts the `email` and `password` values from the DOM.
   - It executes a `fetch` POST request to `http://127.0.0.1:8000/login` with the credentials formatted as JSON.

3. **Backend Routing (`main.py` -> `LogIn.py`)**:
   - The FastAPI application running in `main.py` routes the request to the `/login` endpoint defined in `LogIn.py`.

4. **Database Query (`LogIn.py` -> `tables.py` -> `DBConnection.py`)**:
   - The route handler uses the `db: Session` dependency to access the MySQL database.
   - It runs `db.query(tables.User).filter(tables.User.email == request.email).first()` to find the user.
   - It validates the password.
   - It runs a second query to check if the user is in a group: `db.query(tables.GroupMember).filter(...).first()`.

5. **Response Generation (`schemas.py` -> `LogIn.py`)**:
   - If successful, it serializes the `User` object into a `UserResponse` Pydantic schema (ensuring the password is NOT returned).
   - It attaches the `groupId` (if found) to the schema and sends a `200 OK` JSON response back to the client.

6. **Frontend State & Navigation (`script.js` -> `home.html`)**:
   - The `fetch` promise resolves in `script.js`.
   - The script saves the returned email and groupId in browser storage: 
     `sessionStorage.setItem("userEmail", result.email);`
     `sessionStorage.setItem("groupId", result.groupId);`
   - The script redirects the user: `window.location.href = "home.html";`.
   
7. **Next View Loading (`home.html` -> `script.js`)**:
   - `home.html` loads. `script.js` detects the presence of `groupId` in `sessionStorage` and immediately fires a `fetch` GET request to `http://127.0.0.1:8000/group/{groupId}/details` to populate the dashboard.
