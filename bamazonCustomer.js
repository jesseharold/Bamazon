
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "Bamazon"
});


connection.connect(function(err) {
    if (err){
        throw err;
    }
    //console.log(`Connected as id ${connection.threadId}`);
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
        getInStock(input.productID, input.quantity);
    });
});
function showAllInventory(){
    connection.query(
        'SELECT * FROM products', function(err, data) {
            if (err) throw err;
            for (var i = 0; i < data.length; i++){
                console.log(data[i]);
            }
    });
}
function getInStock(id, quantityRequested){
    connection.query(
        'SELECT stock_quantity FROM products WHERE ?', [{ID: id}], function(err, data) {
            if (err) throw err;

            if (data[0].stock_quantity < quantityRequested){ 
                console.log(`Sorry, we only have ${data[0].stock_quantity} of that item at the moment.`);
            } else {
                submitOrder(id, quantityRequested);
            }
    });
}
function submitOrder(id, quantity){
    // updating the SQL database to reflect the remaining quantity.
    // Once the update goes through, show the customer the total cost of their purchase.
}
function create(product_name, department_name, price, stock_quantity){
    connection.query(
        'INSERT INTO products SET ?', [{product_name: product_name, department_name: department_name, price: price, stock_quantity: stock_quantity}], function(err, data) {
            if (err) throw err;
    });
}
function read(column, value){
    connection.query(
        'SELECT * FROM products WHERE ?', [{[column]: value}], function(err, data) {
            if (err) throw err;
            return data;
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