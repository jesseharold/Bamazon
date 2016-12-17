
var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var connection = mysql.createConnection(connectionInfo);

var currentItem;


connection.connect(function(err) {
    if (err){
        throw err;
    }
    //console.log(`Connected as id ${connection.threadId}`);
    start();
});
function start(){
    showAllInventory();
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

function showAllInventory(){
    connection.query(
        'SELECT * FROM products', function(err, data) {
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
}

function getItem(id, callback){
    connection.query(
        `SELECT * FROM products WHERE ID = ${id}`, function(err, data) {
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
    } else {
        submitOrder(currentItem.ID, quantity, currentItem.stock_quantity);
    }
}

function submitOrder(id, quantity, previousStockAmount){
    // updating the SQL database to reflect the remaining quantity.
    // Once the update goes through, show the customer the total cost of their purchase.
    update("ID", id, "stock_quantity", previousStockAmount-quantity);
    console.log(`The total cost of your order is ${quantity*currentItem.price}`);
    start();
}

function create(product_name, department_name, price, stock_quantity){
    connection.query(
        'INSERT INTO products SET ?', [{product_name: product_name, department_name: department_name, price: price, stock_quantity: stock_quantity}], function(err, data) {
            if (err) throw err;
    });
}

function update(column, value, updateColumn, updateValue){
    connection.query(
        'UPDATE products SET ? WHERE ?', [{[updateColumn]: updateValue}, {[column]: value}], function(err, data) {
            if (err) throw err;
            return data;
    });
}

function destroy(column, value){
    connection.query(
        'DELETE FROM products WHERE ?', [{[column]: value}], function(err, data) {
            if (err) throw err;
            return data;
    });
}