# SevaDeep NGO Attendance Logging System - Project Context

## 🏗️ Overall Architecture
The project is a decoupled web application where the **Frontend** is a traditional static HTML/CSS/JS site, and the **Backend** is a modern REST API built with Python, which connects to a MySQL database.

## 🐍 Backend (Python / FastAPI)
The backend is located in the `Backend/` directory and follows modern Python web development practices:

1. **Framework (`main.py`)**: 
   - Uses **FastAPI** to serve the API. It currently has a root endpoint `GET /` and two basic read endpoints: `GET /users` and `GET /groups` which fetch all records from the database.
2. **Database Connection (`DBConnection.py`)**: 
   - Uses SQLAlchemy to connect to a **MySQL** database (via `pymysql`). It reads database credentials (host, port, user, password) from a `.env` file securely.
3. **Database Tables/Models (`tables.py`)**: 
   - Defines the structure of the SQL tables using SQLAlchemy ORM. The core entities are:
     - `User` (`users`): Stores volunteers (email, phone, password, first/last name).
     - `Group` (`grps`): Stores volunteer groups (name, max size, college name, mentor).
     - `GroupMember` (`grpMembers`): A mapping table that links Users to Groups (a many-to-many relationship).
     - `Attendance` (`attendance`): Tracks a user's volunteer work (date, duration, activity name, notes).
4. **Data Validation (`schemas.py`)**: 
   - Uses **Pydantic** to define what the data should look like when sent back to the frontend (e.g., hiding passwords when returning User info).

## 🖥️ Frontend (HTML / CSS / JS)
The frontend is located in the `FrontEnd/` directory and consists of vanilla web technologies:

1. **Pages (HTML)**: 
   - Pages mapped out for the entire user journey: `index.html` (Landing), `signUp.html`, `login.html`, `home.html` (Dashboard), `create-group.html`, `add-attendance.html`, and an `admin.html` dashboard.
2. **Styling**: 
   - Everything shares a common `style.css` file.
3. **Interactivity (`script.js`)**:
   - Currently, the frontend is **disconnected from the backend**. 
   - In `script.js`, forms (like login and signup) are set up to capture user input, prevent the page from reloading, and validate the data locally. However, right now they just print to the `console.log()` and display a message: *"Form is valid. Backend is not connected yet."* instead of making HTTP requests to the FastAPI server.

## 🚀 Next Steps / Missing Features
To make the application fully functional, the following steps are needed:
1. **Build Backend Routes**: Create `POST` endpoints in FastAPI for `/signup`, `/login`, `/attendance`, and `/group`.
2. **Connect the Frontend**: Update `script.js` to use the `fetch()` API so that when a user clicks "Sign Up" or "Login", it actually sends that data to the FastAPI backend to be saved in the MySQL database.
3. **Authentication**: Implement JWT (JSON Web Tokens) or session cookies in the backend so users stay logged in across different pages.
