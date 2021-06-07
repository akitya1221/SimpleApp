const { response } = require('express');
const express = require('express');
const mysql = require('mysql');
const app = express();
const session = require('express-session');

// セッション設定
app.use(
    session({
        secret: 'my_secret_key',
        resave: 'false',
        saveUninitialized: false,
    })
)


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
    res.render('top.ejs');
});

// ログイン機能ここから(開発途中)
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {

    const username = req.body.username;

    connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (error, result) => {
            if (result.length > 0) {
                if (req.body.password === result[0].password){
                    req.session.userId = result[0].id;
                    req.session.username = result[0].username;
                    res.redirect('/index');
                  } else {
                    res.redirect('/login');
                  }
            } else {
                res.redirect('/login');
            }
        }
    );
});

app.use((req, res, next) => {
    if (req.session.userId === undefined) {
        res.locals.username = 'ゲスト';
        res.locals.isLoggedIn = false;
    } else {
        res.locals.username = req.session.username;
        res.locals.isLoggedIn = true;
    }
    next();
});

app.get('/logout', (req, res) => {
    req.session.destroy(error => {
      res.redirect('/index');
    });
});
  // ここまで------------------------------------

// 新規登録機能
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

app.post('/signup', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;  

    connection.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        (error, results) => {
          res.redirect('/index');
        }
      );
    
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