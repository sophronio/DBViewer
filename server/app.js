const express = require('express');
require('dotenv').config({ path: '../.env' });
const bodyParser = require('body-parser');
const cors = require('cors');

// routes
const tableRoutes = require('./routes/tables');
const rowRoutes = require('./routes/rows');
const updateRoutes = require('./routes/updates');
const newColumnRoutes = require('./routes/newColumns');
const sqlTypes = require('./routes/sqlTypes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect to DB
app.use(cors());
app.use('/tables', tableRoutes);
app.use('/table', rowRoutes);
app.use('/updates', updateRoutes);
app.use('/add-column', newColumnRoutes);
app.use('/types', sqlTypes);

// Error handling for routes not found
app.use((req, res) => {
    res.status(404).send('Route not found');
});

app.listen(8080, () => {
    console.log('server listening on port 8080');
});
// Password123! - admin_tutorial
