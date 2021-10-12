USE employee_db;
INSERT INTO departments (name)
VALUES 
       ("Engineering"),
       ("HR"),
       ("Sales"),       
       ("Marketing"),
       ("accounting");   
        
INSERT INTO role (title, salary, departmentID)
VALUES 
       ("Engineering manager",125000,1),
       ("Software Engineer",100000,1),
       ("Electrical engineer",90000,1),
       ("HR manager",75000,2),
       ("HR assistant",65000,2),
       ("regional salesman",80000,3),
       ("marketing manager",75000,4),
       ("marketing assistant",75000,4),
       ("accountant",85000,5),
       ("clerk",55000,5);

INSERT INTO employee (firstName, lastName, roleID)
VALUES ('John', 'Smith', 1); /*eng mmanager, mgr:-*/

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Stacy', 'moore', 2, 1); /*sw eng, mgr:engMgr*/

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Rob', 'connor', 3, 1); /*elect eng , mgr:engMgr */

INSERT INTO employee (firstName, lastName, roleID)
VALUES ('Mandy', 'Garcia', 4 ); /* HR mgr, mgr:-*/

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Donald', 'Perry', 5, 4); /*hr assist, mgr:hrMgr */
 
INSERT INTO employee (firstName, lastName, roleID)
VALUES ('Arnold', 'timor', 6); /*reg salesman */

INSERT INTO employee (firstName, lastName, roleID)
VALUES ('Arbold', 'Palmer', 7); /* mkt mgr*/

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Kim', 'coleman', 8, 7); /* mkt assitant*/

INSERT INTO employee (firstName, lastName, roleID)
VALUES ('Josh', 'sandman', 9); /*accountant */

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Kim', 'coleman', 10, 9); /* clerck , mgr:acct */