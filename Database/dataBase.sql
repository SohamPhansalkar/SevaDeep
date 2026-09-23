-- CREATE DATABASE SevaDeep;
USE SevaDeep;

CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE,
    password VARCHAR(100) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    gender VARCHAR(20),
    institution VARCHAR(255)
);

CREATE TABLE grps(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    maxSize INT NOT NULL,
    memberCount INT NOT NULL DEFAULT 1,
    clgName VARCHAR(255),
    mentorName VARCHAR(50),
    creatorId INT NOT NULL,

    FOREIGN KEY (creatorId)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE grpMembers(
    userId INT NOT NULL,
    grpId INT NOT NULL,

    PRIMARY KEY (userId, grpId),

    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (grpId)
        REFERENCES grps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE attendance(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    date DATE NOT NULL,
    duration INT,
    activityName VARCHAR(255),
    note VARCHAR(255),

    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- USERS
-- =========================================

INSERT INTO users
    (email, phoneNumber, password, firstName, lastName)
VALUES
    ('soham@gmail.com', '9876543210', 'password123', 'Soham', 'Phansalkar'),
    ('shubham.chitrakar@gmail.com', '9876543211', 'password123', 'Shubham', 'Chitrakar'),
    ('tanmay.sheware@gmail.com', '9876543212', 'password123', 'Tanmay', 'Sheware'),
    ('talib.jiruwala@gmail.com', '9876543213', 'password123', 'Talib', 'Jiruwala'),
    ('shubham.patel@gmail.com', '9876543214', 'password123', 'Shubham', 'Patel'),
    ('souyma.mapara@gmail.com', '9876543215', 'password123', 'Souyma', 'Mapara'),
    ('parth.kaka@gmail.com', '9876543216', 'password123', 'Parth', 'Kaka');


-- =========================================
-- GROUPS
-- =========================================

INSERT INTO grps
    (name, maxSize, memberCount, clgName, mentorName, creatorId)
VALUES
    ('Seva Group 1', 10, 4, 'Symbiosis Institute of Technology', 'Dr. Anil Sharma', 1),
    ('Seva Group 2', 10, 3, 'Symbiosis Institute of Technology', 'Dr. Priya Deshmukh', 5);


-- =========================================
-- GROUP MEMBERS
-- =========================================

-- Group 1
INSERT INTO grpMembers (userId, grpId)
VALUES
    (1, 1), -- Soham Phansalkar
    (2, 1), -- Shubham Chitrakar
    (3, 1), -- Tanmay Sheware
    (4, 1); -- Talib Jiruwala

-- Group 2
INSERT INTO grpMembers (userId, grpId)
VALUES
    (5, 2), -- Shubham Patel
    (6, 2), -- Souyma Mapara
    (7, 2); -- Parth Kaka


-- =========================================
-- ATTENDANCE
-- =========================================

INSERT INTO attendance
    (userId, date, duration, activityName, note)
VALUES
    (1, '2026-09-15', 120, 'Community Clean-up', 'Participated in campus clean-up drive'),
    (1, '2026-09-17', 90, 'Tree Plantation', 'Planted trees near the college campus'),

    (2, '2026-09-15', 120, 'Community Clean-up', 'Helped with waste collection'),
    (2, '2026-09-18', 60, 'Teaching Session', 'Taught basic computer skills'),

    (3, '2026-09-16', 90, 'Tree Plantation', 'Planted 3 saplings'),
    (3, '2026-09-19', 120, 'Community Clean-up', 'Participated in cleaning activity'),

    (4, '2026-09-15', 120, 'Community Clean-up', 'Participated in campus clean-up'),

    (5, '2026-09-16', 90, 'Food Distribution', 'Helped distribute food to participants'),
    (5, '2026-09-18', 120, 'Community Clean-up', 'Participated in cleaning drive'),

    (6, '2026-09-16', 90, 'Food Distribution', 'Helped organize food distribution'),
    (6, '2026-09-19', 60, 'Teaching Session', 'Assisted students during teaching session'),

    (7, '2026-09-17', 120, 'Tree Plantation', 'Planted trees in the community area');
    
-- select --------
    
-- select * from users;
-- select * from grps;

-- SELECT 
--     CONCAT(u.firstName, ' ', u.lastName) AS userName,
--     g.name AS grpName
-- FROM grpMembers gm
-- JOIN users u 
--     ON gm.userId = u.id
-- JOIN grps g 
--     ON gm.grpId = g.id;
    
--     select * from attendance;
    
    
    
    
    
    
    
