const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const { connect } = require("./db.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

connect()
    .then((connection) => {
    console.log("Connected to the database.");
    })
    .catch((error) => {
        console.log("Database connection failed!");
        console.log(error);
    })

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello Beijun')
})

app.get('/tables', (req, res) => {
    tablesNames = some_sql_query
    res.send(tableNames)
})

app.

app.listen(8080, () => {
    console.log('server listening on port 8080');
})
// Password123! - admin_tutorial