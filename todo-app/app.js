/* eslint-disable no-unused-vars */
const {request, response} = require('express');
const express = require('express');
const app = express();
const csrf = require('tiny-csrf');

const {Todo, User} = require('./models');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const bcyrpt = require('bcrypt');
const saltRounds = 10;

const flash = require('connect-flash');


app.use(express.urlencoded({extended: false}));
const path = require('path');

app.set('views',path.join(__dirname,'views'));
app.use(flash());
const user = require('./models/user');



app.use(bodyParser.json());
app.use(cookieParser('ssh!!!! some secret string'));
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));

app.use(session({
  secret:"this is my secret-120012001200",
  cookie:{
    maxAge: 24 * 60 * 60 * 1000 // that will be equal to 24 Hours / A whole day
  }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use((request, response, next)=>{
  response.locals.messages = request.flash();
  next();
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  password: 'password',
},(username, password, done) => {
  User.findOne({
    where:{
      email:username,
      
    }
  })
  .then(async(user) => {
    const result = await bcyrpt.compare(password, user.password);
    if(result){
      return done(null,user);
    } else{
      return done(null, false, {message: "Invalid Password"});
    }
  })
  .catch((error) => {
    console.error(error);
    return done(null,false,{
      message: "You are not a registered user",
    })

  })
}))


passport.serializeUser((user, done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id);
});

passport.deserializeUser((id,done) => {
  User.findByPk(id)
  .then(user => {
    done(null, user)
  })
  .catch(error =>{
    done(error, null)
  })
})

// seting the ejs is the engine
app.set('view engine', 'ejs');

app.get('/', async (request, response)=>{
  if(request.user)
  {
    response.redirect('/todos');
  }
  else{  
  response.render('index', {
      title: 'Todo Application',
      csrfToken: request.csrfToken(),
    });
  }
});


//app.use(express.urlencoded({extended: false}));
//const path = require('path');
//const user = require('./models/user');

//app.use(bodyParser.json());
//app.use(cookieParser('ssh!!!! some secret string'));
//app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));
//app.set('view engine', 'ejs');
app.get('/todos',connectEnsureLogin.ensureLoggedIn(), async (request, response)=>{
  const loggedInUser = request.user.id;
  const all_Todos = await Todo.getTodos(loggedInUser);
  const over_due = await Todo.overdue(loggedInUser);
  const due_Today = await Todo.dueToday(loggedInUser);
  const due_Later = await Todo.dueLater(loggedInUser);
  const completed_Items = await Todo.completedItems(loggedInUser);
  if (request.accepts('html')) {
    response.render('todos', {
      all_Todos, over_due, due_Today, due_Later, completed_Items,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({all_Todos, over_due, due_Today, due_Later});
  }
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/signup',(request,response)=>{
  response.render('signup',{
    title: 'Sign Up',
    csrfToken: request.csrfToken(),
  });
});




//app.get('/todos', (request, response)=>{
 // console.log('Todo List', request.body);
//});
//app.post('/todos', async (request, response)=>{
 // console.log('Todo List');
  //try {
   // console.log('entering in try block');
    //const todo =await Todo.addTodo({
    //  title: request.body.title, dueDate: request.body.dueDate,
   // });
   // return response.redirect('/');
  //} catch (error) {
   // console.log(error);
   // return response.status(422).json(error);
  //}
//});
app.post('/users',async (request,response)=>{
  
  if (!request.body.firstName) {
    request.flash("error", " This field can not be blank. Plz Enter Your First name");
    return response.redirect("/signup");
  }
  if (!request.body.email) {
    request.flash("error", "Enter Your Email-Id ");
    return response.redirect("/signup");
  }
  if (!request.body.password) {
    request.flash("error", "Password empty not allowed");
    return response.redirect("/signup");
  }
  
  const hashedPwd =await bcyrpt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);
  try{
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err)=> {
      if(err){
        console.log(err);
        response.redirect("/")
      }
      response.redirect('/todos');
    })
    
  }
  catch(error){
    console.log(error);
    request.flash("error", error.errors[0].message);
    response.redirect("/signup");
  }
  
  //console.log("First Name:",request.body.firstName)
});

app.get('/login',(request,response)=>{
  response.render('login',{
    title:"Login",
    csrfToken: request.csrfToken(),
  });
});

app.post('/session',passport.authenticate('local',{
  failureRedirect: '/login',
  failureFlash: true,
}),(request,response)=>{
  console.log(request.user);
  response.redirect('/todos');
})

app.get('/signout',(request,response, next) => {
  request.logOut((err)=>{
    if(err)
    {
      return next(err);
    }
    response.redirect('/');
  })
})

app.post('/todos', connectEnsureLogin.ensureLoggedIn(),async (request, response)=>{
 if (!request.body.title) {
    request.flash("error", "Enter the  title ");
    response.redirect("/todos");
  }
  if (!request.body.dueDate) {
    request.flash("error", "Enter Date ");
    response.redirect("/todos");
  }
  try {
    
    console.log('entering in try block');
    const todo =await Todo.addTodo({
      title: request.body.title, 
      dueDate: request.body.dueDate,
      userId: request.user.id,
    });
    return response.redirect('/todos');
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put('/todos/:id', async (request, response) => {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const upTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(upTodo);
  } catch (error) {
    return response.status(422).json(error);
  }
});

app.delete('/todos/:id', connectEnsureLogin.ensureLoggedIn(), async function(request, response) {
  console.log('We have to delete a Todo with ID: ', request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // eslint-disable-next-line max-len
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  const deleteFlag = await Todo.destroy({where: {id: request.params.id, userId:request.user.id,}});
  response.send(deleteFlag ? true : false);
});

module.exports = app;

