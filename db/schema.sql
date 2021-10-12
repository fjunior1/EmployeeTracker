DROP DATABASE IF EXISTS employee_db;
CREATE database employee_db;

USE employee_db;
CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT,
  name VARCHAR(30) UNIQUE NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE role (
  id INT UNSIGNED AUTO_INCREMENT,
  title VARCHAR(30) UNIQUE NOT NULL,
  salary DECIMAL UNSIGNED NOT NULL, /*unsigned deprecated for decimal and float*/
  departmentID INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  INDEX depIDX (departmentID),
  CONSTRAINT fk_department
    FOREIGN KEY (departmentID)
    REFERENCES departments(id)
    ON DELETE CASCADE
);
CREATE TABLE employee (
  id INT UNSIGNED AUTO_INCREMENT,
  firstName VARCHAR(30) NOT NULL,
  lastName VARCHAR(30) NOT NULL,
  roleID INT UNSIGNED NOT NULL,
  INDEX roleIDX (roleID),
  CONSTRAINT fk_role
    FOREIGN KEY (roleID)
    REFERENCES role(id)
    ON DELETE CASCADE,
  managerID INT UNSIGNED,
  INDEX mgrIDX (managerID),
  CONSTRAINT fk_manager
    FOREIGN KEY (managerID)
    REFERENCES employee(id)
    ON DELETE SET NULL,
  PRIMARY KEY (id)
);