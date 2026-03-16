CREATE DATABASE cico_tracker;
USE cico_tracker;

CREATE TABLE food_entries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dateTime DATETIME NOT NULL,
    foodName VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    meal VARCHAR(50) NOT NULL,
    tags JSON,
    servingSize INT NOT NULL,
    unit VARCHAR(50) NOT NULL
);