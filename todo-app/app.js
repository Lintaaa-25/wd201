/* eslint-disable no-unused-vars */
const express = require('express');
const app = express();
const csrf = require('tiny-csrf');
const path = require('path');

const { Todo, User } = require('./models');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

const saltRounds = 10;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('ssh!!!! some secret string'));
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "this is my secret-120012001200",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Passport Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { email: username } });
    if (!user) {
      return done(null, false, { message: "You are not a registered user" });
    }
    const result = await bcrypt.compare(password, user.password);
    return result ? done(null, user) : done(null, false, { message: "Invalid Password" });
  } catch (error) {
    return done(null, false, { message: "Login failed" });
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

// Routes

app.get('/', async (req, res) => {
  if (req.user) return res.redirect('/todos');
  res.render('index', {
    title: 'Todo Application',
    csrfToken: req.csrfToken(),
  });
});

app.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'Sign Up',
    csrfToken: req.csrfToken(),
  });
});

app.post('/users', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName) {
    req.flash("error", "This field cannot be blank. Please enter your first name");
    return res.redirect("/signup");
  }
  if (!email) {
    req.flash("error", "Enter your email address");
    return res.redirect("/signup");
  }
  if (!password) {
    req.flash("error", "Password cannot be empty");
    return res.redirect("/signup");
  }

  try {
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ firstName, lastName, email, password: hashedPwd });
    req.login(user, err => {
      if (err) return res.redirect('/');
      return res.redirect('/todos');
    });
  } catch (error) {
    console.error(error);
    req.flash("error", error.errors[0].message);
    return res.redirect("/signup");
  }
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

app.post('/session',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect('/todos');
  });

app.get('/signout', (req, res, next) => {
  req.logOut(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/todos', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const userId = req.user.id;
  const all_Todos = await Todo.getTodos(userId);
  const over_due = await Todo.overdue(userId);
  const due_Today = await Todo.dueToday(userId);
  const due_Later = await Todo.dueLater(userId);
  const completed_Items = await Todo.completedItems(userId);

  if (req.accepts('html')) {
    return res.render('todos', {
      all_Todos, over_due, due_Today, due_Later, completed_Items,
      csrfToken: req.csrfToken(),
    });
  } else {
    return res.json({ all_Todos, over_due, due_Today, due_Later, completed_Items });
  }
});

app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const { title, dueDate } = req.body;

  if (!title || !dueDate) {
    if (!title) req.flash("error", "Enter the title");
    if (!dueDate) req.flash("error", "Enter the due date");
    return res.redirect("/todos");
  }

  try {
    await Todo.addTodo({
      title,
      dueDate,
      userId: req.user.id,
    });
    return res.redirect('/todos');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      error.errors.forEach(e => req.flash("error", e.message));
      return res.redirect("/todos");
    }
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updated = await todo.setCompletionStatus(req.body.completed);
    return res.json(updated);
  } catch (error) {
    return res.status(422).json(error);
  }
});

app.delete('/todos/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const deleteFlag = await Todo.destroy({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });
  res.send(deleteFlag ? true : false);
});

module.exports = app;

