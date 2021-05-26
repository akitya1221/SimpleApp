const { response } = require('express');
const express = require('express');
const mysql = require('mysql');
const app = express();


// mysqlログイン情報ーーーーーーーーーーーーーーーーーーーーーーーーー
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'express_db'
});

connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
});

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('top.ejs')
});

app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM items',
        (error, result) => {
            res.render('index.ejs', {items: result});
        }
    );
});

app.get('/new', (req, res) => {
    res.render('new.ejs');
});

// リスト投稿機能ーーーーーーーーーーーーーーーーーーーーーーーーーーーー
app.post('/createItem', (req, res) => { 
    connection.query(   
        'INSERT INTO items (title, text) VALUES (?, ?)',
        [req.body.itemTitle, req.body.itemText],
        (error, result) => {
            res.redirect('/index')
        }
    );
});

app.get('/edit/:id', (req, res) => {
    connection.query(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id],
      (error, result) => {
        res.render('edit.ejs', {item: result[0]});
      }
    );
});

app.post('/update/:id', (req,res) => {
    connection.query(
        'UPDATE items SET title = ?, text = ? WHERE id = ?',
        [req.body.itemTitle, req.body.itemText, req.params.id],
        (error, result) => {
            res.redirect('/index')
        }
    );
});

app.post('/delete/:id', (req, res) => {
    connection.query(
        'DELETE FROM items WHERE id = ?',
        [req.params.id],
        (error, result) => {
            res.redirect('/index')
        }
    );
});

// ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー


app.listen(3000);