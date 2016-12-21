
var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var crud = require("./Crud");
var connection = mysql.createConnection(connectionInfo);

var currentItem;

function start(){
    crud.showAllInventory();
    inquirer.prompt([
        {
            message: "What is the ID of the product you would like to buy?",
            name: "productID"
        }, {
            message: "How many items would you like to buy?",
            name: "quantity"
        }
    ]).then(function(input){
        getItem(input.productID, function(){
            checkInStock(input.quantity);
        });
    });
}

function getItem(id, callback){
    connection.query(
        `SELECT product_name, ID, department_name, price, stock_quantity FROM products WHERE ID = ${id}`, function(err, data) {
            if (err) throw err;
            currentItem = data[0];
            //console.log(`set currentItem: ${JSON.stringify(currentItem)}`);
            callback();
    });
}

function checkInStock(quantity){
    //console.log("checkInStock");
    if (currentItem.stock_quantity < quantity){ 
        console.log(`Sorry, we only have ${currentItem.stock_quantity} of that item at the moment.`);
        start();
    } else {
        submitOrder(currentItem.ID, quantity, currentItem.stock_quantity);
    }
}

function submitOrder(id, quantity, previousStockAmount){
    // updating the SQL database to reflect the remaining quantity.
    // Once the update goes through, show the customer the total cost of their purchase.
    crud.update("ID", id, "stock_quantity", previousStockAmount-quantity);
    console.log(`The total cost of your order is ${quantity*currentItem.price}`);
    start();
}

connection.connect(function(err) {
    if (err){
        throw err;
    }
    //console.log(`Connected as id ${connection.threadId}`);
    start();
});