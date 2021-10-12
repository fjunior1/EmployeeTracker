
/*
   Main code for employee management application.
*/
const colors = require('colors');
const cTable = require('console.table');
const mysql = require('mysql');
const inquirer = require('inquirer');

// setup db connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db',
});

// Connect to db
connection.connect((err) => {
    if (err) throw err;
    console.log(`\t------------------------------------\n`);
    console.log(`\t   Employee Management Application \n`.bold);
    console.log("\t           By Franklyn Diaz\n".italic)
    console.log(`\t------------------------------------\n`);
    setTimeout(process, 500);
});

//This function is called after the call to process() above
const endConn = () => {
    connection.end(function (err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        console.log('Closing the database connection.');
    })
};

// present menu
const process = () => {
    inquirer.prompt([
        {
            type: "list",
            choices: [
                "View-data",
                "Add-data",
                "Update-data",
                "Remove-data",
                "Exit-Application"
            ],
            message: "Select action:",
            name: "entryPoint"
        }
    ]).then((answer) => {
        switch (answer.entryPoint) {
            case "View-data":
                return viewOptions();
                break;

            case "Add-data":
                return addOptions();
                break;

            case "Update-data":
                return updateOptions();
                break;
            case "Remove-data":
                return removeOptions();
                break;

            case "Exit-Application":
                console.log("\nEnding Employee Management Application\n".bold);
                endConn();
                break;

            default:
                console.log('Wrong option, try again...'.bold)
                break;
        };
    });

};

// Add department
const addDept = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "department name to add:",
            name: "name"
        }
    ]).then((answer) => {
        connection.query(
            `INSERT INTO departments 
            SET ?`,
            answer,
            (err, departments) => {
                if (err) throw err;
                console.log(`\n${answer.name} added\n`.italic);
                process();
            });
    });
};

// add role
const addRole = () => {
    connection.query(
        `SELECT
            name AS name,
            id AS value
        FROM departments`,
        (err, choices) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: "input",
                    message: "role name:",
                    name: "title"
                },
                {
                    type: "number",
                    message: "salary for role:",
                    name: "salary",
                    validate: (value) => {
                        if (!value) {
                            console.log("\x1b[31m", "\nYou must provide a salary!");
                            return false;
                        } else if (typeof value !== 'number') {
                            console.log("\x1b[31m", '\nThe salary must be a number (no commas)!');
                            return false;
                        } else {
                            return true;
                        }
                    },
                    // do not allow NaN as input
                    filter: (value) => {
                        if (isNaN(value)) {
                            return ''
                        } else {
                            return value
                        }
                    },
                },
                {
                    type: "list",
                    message: "Department for role:",
                    choices,
                    name: "departmentID"
                },
            ]).then((answer) => {
                connection.query(
                    `INSERT INTO role 
                SET ?`,
                    answer,
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\nRole ${answer.title} added\n`.italic);
                        process();
                    });
            });
        });
};

// view all
const allEmp = () => {
    connection.query(
        `SELECT 
            Employees.id AS ID,
            Employees.firstName AS First_name,
            Employees.lastName AS Last_name,
            Employees.title AS Title,
            Employees.name AS Department,
            Employees.salary AS Salary,
            Employees.manager AS Manager
        FROM 
            (SELECT 
                employee.id, 
                employee.firstName, 
                employee.lastName, 
                role.title, 
                role.departmentID, 
                departments.name, 
                role.salary, 
                employee.managerID,
                concat(m.firstName," ", m.lastName) manager
            FROM employee
            LEFT JOIN employee m ON m.id = employee.managerID
            LEFT JOIN role ON employee.roleID = role.id
            LEFT JOIN departments ON role.departmentID = departments.id)
        AS Employees`,
        (err, employees) => {
            if (err) throw err;
            console.table(employees);
            process();
        });
};

// Function to view employees by department
const empByDept = () => {

    // Selecting all departments
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        // select department to query
        inquirer.prompt([
            {
                type: "list",
                message: "Select department:",
                choices() {
                    const choiceArray = [];
                    results.forEach((department) => {
                        choiceArray.push(`${department.name}`);
                    });
                    return choiceArray;
                },
                name: "chosenDept"
            },
        ]).then((answer) => {
            connection.query(
                `SELECT 
                    allEmployees.id AS ID,
                    allEmployees.firstName AS First_name,
                    allEmployees.lastName AS Last_name,
                    allEmployees.title AS Title,
                    allEmployees.salary AS Salary,
                    allEmployees.manager AS Manager
                FROM 
                    (SELECT 
                        employee.id, 
                        employee.firstName, 
                        employee.lastName, 
                        role.title, 
                        role.departmentID, 
                        departments.name, 
                        role.salary, 
                        employee.managerID,
                        concat(m.firstName," ", m.lastName) manager
                    FROM employee
                    LEFT JOIN employee m ON m.id = employee.managerID
                    LEFT JOIN role ON employee.roleID = role.id
                    LEFT JOIN departments ON role.departmentID = departments.id)
                AS allEmployees
                WHERE ?`,
                { name: answer.chosenDept },
                (err, res) => {
                    if (err) throw err;
                    // All employees in department
                    console.log(`\nEmployees in ${answer.chosenDept}:\n`.italic);
                    console.table(res);
                    process();
                });
        });
    });
};

// employes by manager
const empByMgr = () => {

    connection.query(
        `SELECT *
        FROM employee`,
        (err, results) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select manager:",
                    choices() {
                        const choiceArray = [];
                        results.forEach((employee) => {
                            choiceArray.push(`${employee.firstName} ${employee.lastName}`);
                        });
                        return choiceArray;
                    },
                    name: "chosenMgr"
                },
            ]).then((answer) => {

                connection.query(
                    `SELECT 
                    allEmployees.id AS ID,
                    allEmployees.firstName AS first_name,
                    allEmployees.lastName AS last_name,
                    allEmployees.title AS Title,
                    allEmployees.name AS Department,
                    allEmployees.salary AS Salary
                    
                FROM 
                    (SELECT 
                        employee.id, 
                        employee.firstName, 
                        employee.lastName, 
                        role.title, 
                        role.departmentID, 
                        departments.name, 
                        role.salary, 
                        employee.managerID,
                        concat(m.firstName," ", m.lastName) manager
                    FROM employee
                    LEFT JOIN employee m ON m.id = employee.managerID
                    LEFT JOIN role ON employee.roleID = role.id
                    LEFT JOIN departments ON role.departmentID = departments.id)
                AS allEmployees
                WHERE ?`,
                    { Manager: answer.chosenMgr },
                    (err, res) => {
                        if (err) throw err;
                        // Display all employees for manager
                        console.log(`\nEmployees managed by ${answer.chosenMgr}:\n`.italic);
                        console.table(res);
                        process();
                    }
                );
            });
        });
};

// Add employee
const addEmp = () => {
    connection.query(
        `SELECT
            title AS name,
            id AS value
        FROM role`,
        (err, choices) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: "input",
                    message: "First name:",
                    name: "firstName"
                },
                {
                    type: "input",
                    message: "Last name:",
                    name: "lastName"
                },
                {
                    type: "list",
                    message: "employee role:",
                    choices,
                    name: "roleID"
                }
            ]).then((answer) => {

                // manager for the employee (can be empty)
                connection.query('SELECT * FROM employee', (err, results) => {
                    if (err) throw err;
                    inquirer.prompt([
                        {
                            type: "list",
                            message: `Select ${answer.firstName} ${answer.lastName} manager(--- for none):`,
                            choices() {
                                const choiceArray = [];
                                // add empty for no manager
                                choiceArray.push(`---`);
                                results.forEach(({ firstName, lastName }) => {
                                    choiceArray.push(`${firstName} ${lastName}`);
                                });
                                return choiceArray;
                            },
                            name: "manager"
                        }
                    ]).then((answer2) => {

                        if (answer2.manager !== `---`) {
                            // Match to manager data
                            let chosenManager;
                            results.forEach((employee) => {
                                if (`${employee.firstName} ${employee.lastName}` === answer2.manager) {
                                    chosenManager = employee;
                                }
                            });

                            // link employee to manager
                            answer.managerID = chosenManager.id;
                        }

                        connection.query(
                            `INSERT INTO employee
                        SET ?`,
                            answer,
                            (err, results) => {
                                if (err) throw err;
                                console.log(`Employee ${answer.firstName} 
                                            ${answer.lastName} created.\n`.italic);

                                process();
                            });
                    });
                });
            });
        });
};

// Remove Employee
const remEmp = () => {
    connection.query(
        `SELECT * 
        FROM employee`,
        (err, results) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    message: "SelectEmploye to remove:",
                    choices() {
                        const choiceArray = [];
                        results.forEach(({ firstName, lastName }) => {
                            choiceArray.push(`${firstName} ${lastName}`);
                        });
                        return choiceArray;
                    },
                    name: "removedEmp"
                },
            ]).then((answer) => {
                let chosenEmployee;
                results.forEach((employee) => {
                    if (answer.removedEmp === `${employee.firstName} ${employee.lastName}`) {
                        chosenEmployee = employee
                    };
                });

                // remove employee
                connection.query(
                    `DELETE FROM employee 
                WHERE ?`,
                    { id: chosenEmployee.id },
                    (err, res) => {
                        if (err) throw err;

                        console.log(`${answer.removedEmp} removed`.italic);
                        process();
                    });
            });
        });
};

// Update employee role
const updateRole = () => {

    // Get list of employees
    connection.query(
        `SELECT *
        FROM employee`,
        (err, results) => {
            if (err) throw err;

            // Select employee
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select employee:",
                    choices() {
                        const choiceArray = [];
                        results.forEach(({ firstName, lastName }) => {
                            choiceArray.push(`${firstName} ${lastName}`);
                        });
                        return choiceArray;
                    },
                    name: "empToUpdate"
                }
            ]).then((answer) => {

                // get EMployee data
                let chosenEmployee;
                results.forEach((employee) => {
                    if (answer.empToUpdate === `${employee.firstName} ${employee.lastName}`) {
                        chosenEmployee = employee
                    };
                });

                // Select new role
                connection.query(
                    `SELECT 
                    title AS name,
                    id AS value
                FROM role`,
                    (err, choices) => {
                        if (err) throw err;
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Select role:",
                                choices,
                                name: "updatedRole"
                            }
                        ]).then((answer) => {

                            // Update role
                            connection.query(
                                `UPDATE employee
                        SET roleID = ${answer.updatedRole}
                        WHERE ?`,
                                { id: chosenEmployee.id },
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(`\n${chosenEmployee.firstName} 
                                                ${chosenEmployee.lastName}'s role update.\n`.italic);

                                    process();
                                });
                        });
                    });
            });
        });
};

// Update manager
const updateMgr = () => {
    connection.query(
        `SELECT *
        FROM employee`,
        (err, results) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select employee:",
                    choices() {
                        const choiceArray = [];
                        results.forEach(({ firstName, lastName }) => {
                            choiceArray.push(`${firstName} ${lastName}`);
                        });
                        return choiceArray;
                    },
                    name: "empToUpdate"
                },
                {
                    type: "list",
                    message: "Select manager:",
                    choices() {
                        const choiceArray = [];
                        
                        results.forEach(({ firstName, lastName }) => {
                            choiceArray.push(`${firstName} ${lastName}`);
                        });
                        return choiceArray;
                    },
                    name: "updatedManager"
                }
            ]).then((answer) => {
                let chosenEmployee;
                results.forEach((employee) => {
                    if (answer.empToUpdate === `${employee.firstName} ${employee.lastName}`) {
                        chosenEmployee = employee
                    };
                });

                let chosenManager;
                results.forEach((employee) => {
                    if (answer.updatedManager === `${employee.firstName} ${employee.lastName}`) {
                        chosenManager = employee
                    };
                });

                
                connection.query(
                    `UPDATE employee
                SET managerID = ${chosenManager.id}
                WHERE ?`,
                    { id: chosenEmployee.id },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n${chosenEmployee.firstName} 
                                    ${chosenEmployee.lastName}'s new manager is 
                                    ${chosenManager.firstName} ${chosenManager.lastName}!\n`.italic);
                        process();
                    });
            });
        });
};

// All roles
const allRoles = () => {

    connection.query(
        `SELECT title AS Roles
        FROM role`,
        (err, roles) => {
            if (err) throw err;
            console.log("\nCompany roles:\n".italic);
            console.table(roles);
            process();
        });
};

//All ddepartments
const allDept = () => {

    connection.query(
        `SELECT name AS Departments
        FROM departments`,
        (err, departments) => {
            if (err) throw err;
            console.log("\nDepartments:\n".italic);
            console.table(departments);
            process();
        });
};

// remove department
const remDept = () => {
    connection.query(
        `SELECT *
        FROM departments`,
        (err, results) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which department would you like to remove?",
                    choices() {
                        const choiceArray = [];
                        results.forEach((department) => {
                            choiceArray.push(department.name);
                        });
                        return choiceArray;
                    },
                    name: "deptToRemove"
                },
            ]).then((answer) => {
                let chosenDepartment;
                results.forEach((department) => {
                    if (department.name === answer.deptToRemove) {
                        chosenDepartment = department
                    };
                });

                connection.query(
                    `DELETE FROM departments 
                WHERE ?`,
                    { id: chosenDepartment.id },
                    (err, res) => {
                        if (err) throw err;

                        console.log(`\ndepartment ${chosenDepartment.name} removed\n`.italic);
                        process();
                    });
            });
        });
};

// remove role
const remRole = () => {
    connection.query(
        `SELECT *
        FROM role`,
        (err, results) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    message: "role to remove:",
                    choices() {
                        const choiceArray = [];
                        results.forEach((role) => {
                            choiceArray.push(role.title);
                        });
                        return choiceArray;
                    },
                    name: "role"
                },
            ]).then((answer) => {

                // Find  role  in database
                let chosenRole;
                results.forEach((role) => {
                    if (role.title === answer.role) {
                        chosenRole = role
                    };
                });

                // Delete the chosen role from the role table
                connection.query(
                    `DELETE FROM role 
                WHERE ?`,
                    { id: chosenRole.id },
                    (err, res) => {
                        if (err) throw err;
                        // Display console message of removed role
                        console.log(`\nremoved role ${chosenRole.title}\n`.italic);
                        process();
                    });
            });
        });
};

// show total budget for a department
const deptBudget = () => {

    // Select all departments 
    connection.query(
        `SELECT * 
        FROM departments`,
        (err, results) => {
            if (err) throw err;

            // Select department
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select deparment:",
                    choices() {
                        const choiceArray = [];
                        results.forEach((department) => {
                            choiceArray.push(`${department.name}`);
                        });
                        return choiceArray;
                    },
                    name: "deptToSeeBudget"
                }
            ]).then((answer) => {
                let chosenDept;
                results.forEach((department) => {
                    if (department.name === answer.deptToSeeBudget) {
                        chosenDept = department
                    };
                });
                connection.query(
                    `SELECT 
                    SUM(roleDepts.salary) AS Total_Utilized_Budget
                FROM 
                    (SELECT 
                        role.departmentID, 
                        departments.name, 
                        role.salary
                    FROM role
                    LEFT JOIN departments ON role.departmentID = departments.id)
                AS roleDepts
                WHERE ?`,
                    { departmentID: chosenDept.id },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n${chosenDept.name} epartment buget:\n`.brightGreen.italic);
                        console.table(res);
                        process();
                    });
            });
        });
};

// view options
const viewOptions = () => {
    inquirer.prompt([
        {
            type: "list",
            choices: [
                "View all employees",
                "View all employees per department",
                "View all Employees per manager",
                "View all roles",
                "View all departments",
                "View total Budget per department",
                "Return to start"
            ],
            message: "What would you like to see?",
            name: "view"
        }
    ]).then((answer) => {

        // switch cases for each user answer
        switch (answer.view) {
            case "View all employees": 
                return allEmp();
                break;
            case "View all employees per department": 
                return empByDept();
                break;
            case "View all employees per manager": 
                return empByMgr();
                break;
            case "View all roles": 
                return allRoles();
                break;
            case "View all departments": 
                return allDept();
                break;
            case "View total Budget per department": 
                return deptBudget();
                break;
            case "Return to start": 
                return process();
                break;
            default:
                console.log("Wrong option , try again");
                //return process.exit();
                break;
            
        };
    });
};

// add
const addOptions = () => {

    // Prompt user to choose what to add
    inquirer.prompt([
        {
            type: "list",
            choices: [
                "Add employee",
                "Add department",
                "Add role",
                "Return to start"
            ],
            message: "Select to add:",
            name: "add"
        }
    ]).then((answer) => {

        // switch cases for each user answer
        switch (answer.add) {
            case "Add employee": {
                return addEmp();
            }
            case "Add department": {
                return addDept();
            }
            case "Add role": {
                return addRole();
            }
            case "Return to start": {
                return process();
            }
            default: {
                return process.exit();
            }
        };
    });
};

// update
const updateOptions = () => {

    // Prompt user to choose what to update
    inquirer.prompt([
        {
            type: "list",
            choices: [
                "Update employee role",
                "Update employee manager",
                "Return to start"
            ],
            message: "Select to update:",
            name: "update"
        }
    ]).then((answer) => {

        // switch cases for each user answer
        switch (answer.update) {

            case "Update Role": {
                return updateRole();
            }
            case "Update Manager": {
                return updateMgr();
            }
            case "Return to start": {
                return process();
            }
            default: {
                return process.exit();
            }
        };
    });
};

// Function to give user options for removing info from company database
const removeOptions = () => {

    // Prompt user to choose what to remove
    inquirer.prompt([
        {
            type: "list",
            choices: [
                "Remove employee",
                "Remove department",
                "Remove role",
                "Return to start"
            ],
            message: "Select to remove:",
            name: "remove"
        }
    ]).then((answer) => {

        // switch cases for each user answer
        switch (answer.remove) {
            case "Remove employee": {
                return remEmp();
            }
            case "Remove department": {
                return remDept();
            }
            case "Remove role": {
                return remRole();
            }
            case "Return to start": {
                return process();
            }
            default: {
                return process.exit();
            }
        };
    });
};

//   Connect
// connection.connect((err) => {
//     if (err) throw err;
//     console.log(`connected as id ${connection.threadId}`);
//     console.log(`\n---------------------------------------------------------------------\n`.yellow.bold);
//     console.log(`\t WELCOME TO THE EMPLOYEE MANAGEMENT SYSTEM APPLICATION! \n`.brightBlue.bgYellow.bold);
//     console.log(`---------------------------------------------------------------------\n`.yellow.bold);
//     setTimeout(init, 1000);
// });