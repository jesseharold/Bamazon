var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var crud = require("./Crud");
var connection = mysql.createConnection(connectionInfo);

var currentItem;

function viewProducts(){
    //console.log("list every available item: the item IDs, names, prices, and quantities");
    crud.showAllInventory();
    start();
}

function viewLowInventory(){
    console.log("list all items with a inventory count lower than five");
    connection.query('SELECT product_name, ID, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5', function(err, data) {
            if (err) throw err;
            for (var i = 0; i < data.length; i++){
                var productInfo = `
                ${data[i].product_name}
                ID: \t\t\t${data[i].ID}
                department: \t\t${data[i].department_name}
                price per unit: \t${data[i].price}
                # in stock: \t\t${data[i].stock_quantity}
                `;
                console.log(productInfo);
            }
    });
    start();
}

function addInventory(){
    console.log("display a prompt that will let the manager 'add more' of any item currently in the store");
    inquirer.prompt([
        {
            message: "What is the ID of the product you would like to add inventory to?",
            name: "productID"
        }, {
            message: "How many items would you like to add?",
            name: "quantity"
        }
    ]).then(function(input){
        // get current stock quantity
        connection.query('SELECT stock_quantity FROM products WHERE ?', {ID: input.productID}, function(err, data) {
            if (err) throw err;
            var new_quantity = input.quantity + data[0].stock_quantity;
            crud.update("ID", input.productID, "stock_quantity", new_quantity);
        });
    });
}

function newProduct(){
    console.log("add a completely new product to the store");
    crud.create();
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
}

connection.connect(function(err) {
    if (err){
        throw err;
    }
    console.log(`Connected as id ${connection.threadId}`);
    start();
});