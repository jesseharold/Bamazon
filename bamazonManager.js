var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var connection = mysql.createConnection(connectionInfo);

var currentItem;

connection.connect(function(err) {
    if (err){
        throw err;
    }
    console.log(`Connected as id ${connection.threadId}`);
    inquirer.prompt([
        {
            message: "What would you like to do?",
            name: "action",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function(input){
        switch (answer.action) {
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
});

function viewProducts(){
    console.log("list every available item: the item IDs, names, prices, and quantities");
}

function viewLowInventory(){
    console.log("list all items with a inventory count lower than five");
}

function addInventory(){
    console.log("display a prompt that will let the manager 'add more' of any item currently in the store");
}

function newProduct(){
    console.log("add a completely new product to the store");
}