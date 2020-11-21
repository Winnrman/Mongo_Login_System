const {MongoClient} = require('mongodb');
const express = require('express');
const e = require('express');
const path = require('path')
const app = express();
const bodyParser = require('body-parser')
//const uri = < MONGODB URI GOES HERE>
const client = new MongoClient(uri, {useUnifiedTopology: true});
const bcrypt = require('bcrypt');
const { timeStamp } = require('console');
const saltRounds = 10;
var session = require('express-session')
var crypto = require('crypto');
var uuid = require('uuid');
// const { equal } = require('assert');

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/bcrypt learning'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, './views'))


app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'something_secret',
    resave: false,
    genid: function(req) {
        return crypto
            .createHash('sha256')
            .update(uuid.v1())
            .update(crypto.randomBytes(256))
            .digest('hex');
      },
    saveUninitialized: true,
    cookie: { secure: true }
  }))
// parse application/json


async function RegisterUser(email, name, password){
    await client.connect();
    const database = client.db("DB0");
    return new Promise( async function(resolve, reject) {
        try{
        database.collection("C0").find().toArray(async function(err, docs) {
            const userData = {email: email, name: name, password: password, isAdmin: false}
             await database.collection("CB1").insertOne(userData);
             resolve()
       });
     } catch (err){
        reject()
    }
     });
    }

async function checkUser(email, password){
    await client.connect();
    const database = client.db("DB0");
    const collection = database.collection("CB1");
    const query = {email}
    const foundUser = await collection.findOne(query);
    console.log(foundUser);
    // console.log("email: "+email)
    if(foundUser) {
        console.log("found a user");
        const match = await bcrypt.compare(password, foundUser.password);
        return match;
    }
    if(!foundUser){
        console.log("User Not Found");
    }
    else{
        //do nothing
    }
}
// checkUser().catch(console.dir)

app.post('/register', async(req, res) => {     
    const formData = {
     name:req.body.name,
     password:req.body.password,
     email:req.body.email
    }
    await client.connect();
    const database = client.db("DB0");
    const collection = database.collection("CB1");
    const query = {email: formData.email};
    const foundUser = await collection.findOne(query);

    bcrypt.hash(formData.password, saltRounds, function(err, hash) {
    try{
        RegisterUser(formData.email, formData.name, hash);
        console.log("[ NEW USER REGISTERED]")
        const user = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
        req.session.user = user;
        res.render("dashboard.ejs", {user:formData.name, isAdmin: foundUser.isAdmin});
        // res.redirect('/login');
        res.status(200).send();
    }catch {
        res.status(500).send();
        }
    });
});

 app.post('/login', async(req, res) => {

      const formData = {
        // name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    await client.connect();
    const database = client.db("DB0");
    const collection = database.collection("CB1");
    const query = {email: formData.email};
    const foundUser = await collection.findOne(query);
    req.session.user = user;
    // console.log(req.body)
    
    if(checkUser(formData.email, formData.password)){
        res.render("dashboard.ejs", {user:foundUser.name, isAdmin: foundUser.isAdmin});
    }
});

//                          ---     PAGE RENDERERS      ---

//          -----These render the pages that you see when you click into them.-----
app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', {})
})

//                      ---         RUNS SERVER         ---
app.listen(3001, () => {
    // console.log("\nServer Running on Port: 3001")
})










// nice