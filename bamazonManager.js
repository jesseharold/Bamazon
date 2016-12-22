var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var crud = require("./Crud");
var connection = mysql.createConnection(connectionInfo);
var table = require("console.table");

var currentItem;
var lowInventoryThreshhold = 5;

function viewProducts(){
    crud.showAllInventory();
    start();
}

function viewLowInventory(){
    connection.query("SELECT product_name, ID, department_name, price, stock_quantity FROM products WHERE stock_quantity < ?", [lowInventoryThreshhold], function(err, data) {
        if (err) throw err;
        console.log("...");
        console.table(data);
    });
    start();
}

function addInventory(){
    inquirer.prompt([
        {
            message: "What is the ID of the product you would like to add inventory to?",
            name: "productID",
            validate: function(number){
                return !isNaN(number) ? true : "Please enter a number.";
            }
        }, {
            message: "How many items would you like to add?",
            name: "quantity",
            validate: function(number){
                return !isNaN(number) ? true : "Please enter a number.";
            }
        }
    ]).then(function(input){
        // get current stock quantity
        connection.query("SELECT stock_quantity FROM products WHERE ?", {ID: input.productID}, function(err, data) {
            if (err) throw err;
            var new_quantity = parseInt(input.quantity) + parseInt(data[0].stock_quantity);
            crud.update("ID", input.productID, "stock_quantity", new_quantity);
            start();
        });
    });
}

function newProduct(){
    // locally stored list of all departments
    var allDepartments = [];
    connection.query(
        "SELECT department_name FROM products GROUP BY department_name", function(err, data) {
            if (err) throw err;
            for (var i = 0; i < data.length; i++){
                allDepartments.push(data[i].department_name);
            }
    });
    inquirer.prompt([
        {
            message: "What is the name of the new product?",
            name: "product_name"
        },{
            message: "What is the price of the new product?",
            name: "price",
            validate: function(number){
                return !isNaN(number) ? true : "Please enter a number.";
            }
        },{
            message: "What department is it in?",
            name: "department",
            type: "list",
            choices: allDepartments
        },{
            message: "How many are in stock?",
            name: "quantity",
            validate: function(number){
                return !isNaN(number) ? true : "Please enter a number.";
            }
        }
    ]).then(function(input){
        crud.create(input.product_name, input.department, input.price, input.quantity);
        start();
    });
}

function start(){
    inquirer.prompt([
        {
            message: "What would you like to do?",
            name: "action",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function(input){
        switch (input.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLowInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                newProduct();
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