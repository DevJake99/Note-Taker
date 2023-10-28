//const renderFunction = require('./public/assets/js/index');
//Import UUID to create unique ID's for new notes
const { v4: uuidv4 } = require('uuid');
// Import Express.js
const express = require('express');
// Import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require('path');
// Initialize an instance of Express.js
const app = express();
//import fs module to read/convert file to js 
const fs = require('fs');
// Specify on which port the Express.js server will run
const PORT = process.env.PORT || 3001;
// Static middleware pointing to the public folder
app.use(express.static('public'));
// Middleware parsing incoming JSON data and assigning it a variable called req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// *** Routes start here: *** // 

// Route to send index.html page for '/' end point
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

//Route to send notes.html page for '/notes' end point
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//Route to render saved notes
app.get('/api/notes', (req, res) =>
    fs.readFile("db/db.json", 'UTF-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An Error has occured while retrieving notes database');
        } else {
            const dbData = JSON.parse(data);
            res.json(dbData);
        }
    })
);

//Route to post new note to database 
app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    console.log('newNote: ', newNote);
    newNote.id = uuidv4();
    fs.readFile('db/db.json', 'UTF-8', (err, data) => {
        if (err) {
            console.log(err);
            console.error(err);
            res.status(500).send('An error occurred while reading the database file');
        }
        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
            if (err) {
                console.log(err);
                console.error(err);
                res.status(500).send('An error occurred while writing to the database file');
            } else {
                res.json(newNote);
            }
        });

    });
});


app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('db/db.json', 'UTF-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred while reading the database file');
        } else {
            let notes = JSON.parse(data);
            notes = notes.filter(note => note.id !== noteId);

            fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('An error occurred while writing to the database file');
                } else {
                    res.json({ message: `Note with id ${noteId} has been deleted` });
                }
            });
        }
    });
});

app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public/index.html")) });

// listen() method is responsible for listening for incoming connections on the specified port 
app.listen(PORT, () =>
    console.log(`App running on http://localhost:${PORT}`)
);

