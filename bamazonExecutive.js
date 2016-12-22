var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var crud = require("./Crud");
var connection = mysql.createConnection(connectionInfo);
var table = require('console.table');

function viewSales(){
    connection.query(
        'SELECT department_id, department_name, department_name, overhead_costs, total_sales FROM departments', function(err, data) {
            if (err) throw err;
            console.log("...");
            console.table(data);
    });
    start();
}

function getDepartmentName(){
     inquirer.prompt([
        {
            message: "What is the department name?",
            name: "departmentName"
        }, {
            message: "What is this department's overhead cost?",
            name: "overhead",
            validate: function(number){
                return !isNaN(number);
            }
        }
    ]).then(function(input){
        createDepartment(input.departmentName, input.overhead)
    });
}

function createDepartment(name, overhead){
    connection.query(
        'INSERT INTO departments SET ?', [{department_name: name, overhead_costs: overhead, total_sales: 0}], function(err, data) {
            if (err) throw err;
            console.log(name + "added to departments");
    });
    start();
}

function start(){
    inquirer.prompt([
        {
            message: "What would you like to do?",
            name: "action",
            type: "list",
            choices: ["View Product Sales by Department", "Create New Department"]
        }
    ]).then(function(input){
        switch (input.action) {
            case "View Product Sales by Department":
                viewSales();
                break;

            case "Create New Department":
                getDepartmentName();
                break;
        }
    });
}

connection.connect(function(err) {
    if (err){
        throw err;
    }
    console.log(`Connected as id ${connection.threadId}`);
    start();
});