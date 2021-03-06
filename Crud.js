var mysql = require("mysql");
var inquirer = require("inquirer");
var connectionInfo = require("./LocalConnection");
var connection = mysql.createConnection(connectionInfo);
var table = require("console.table");


var Crud = {
    create : function(product_name, department_name, price, stock_quantity){
        connection.query(
            "INSERT INTO products SET ?", [{product_name: product_name, department_name: department_name, price: price, stock_quantity: stock_quantity}], function(err, data) {
                if (err) throw err;
        });
    },

    showAllInventory : function (){
        connection.query(
            "SELECT product_name, ID, department_name, price, stock_quantity FROM products", function(err, data) {
                if (err) throw err;
                console.log("...");
                console.table(data);
        });
    },

    update : function (column, value, updateColumn, updateValue){
        connection.query(
            "UPDATE products SET ? WHERE ?", [{[updateColumn]: updateValue}, {[column]: value}], function(err, data) {
                if (err) throw err;
                return data;
        });
    },

    destroy : function (column, value){
        connection.query(
            "DELETE FROM products WHERE ?", [{[column]: value}], function(err, data) {
                if (err) throw err;
                return data;
        });
    }
}

module.exports = Crud;