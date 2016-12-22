
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
            name: "productID",
            validate: function(number){
                return !isNaN(number);
            }
        }, {
            message: "How many items would you like to buy?",
            name: "quantity",
            validate: function(number){
                return !isNaN(number);
            }
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
    var price = quantity*currentItem.price;
    console.log(`The total cost of your order is ${formatMoney(price)}`);
    // Add the revenue from each transaction to the `total_sales` column for the related department.
    var query = `UPDATE departments SET total_sales = total_sales + ${price} WHERE department_name = "${currentItem.department_name}"`;
     connection.query(
        query, function(err, data) {
            if (err) throw err;
    });
    start();
}

function formatMoney(number) {
    //round to 2 decimal places
    number = Math.round(number * 100) / 100;
    //convert to string
    number += "";
    var numberParts = number.split(".");
    var dollars = numberParts[0];
    var commas = Math.floor((dollars.length - 1) / 3);
    var result = [];
    for (var i = 1; i <= commas + 1; i++) {
        var startChunk = dollars.length - (3 * i);
        if (startChunk < 0){
            startChunk = 0;
        }
        var endChunk = dollars.length - (3 * (i - 1));
        result.unshift(dollars.slice(startChunk, endChunk));
    }
    
    var cents = "";
    if(numberParts[1]){
        cents = "." + numberParts[1];
        if (cents.length == 2){
            cents += "0";
        }
    }
    
    return("$" + result.join(",") + cents);
}

connection.connect(function(err) {
    if (err){
        throw err;
    }
    //console.log(`Connected as id ${connection.threadId}`);
    start();
});