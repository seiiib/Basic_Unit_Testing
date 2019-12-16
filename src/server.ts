import express = require('express')
import path = require('path')
import bodyparser = require('body-parser')
import morgan = require('morgan')
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'
import { MetricsHandler } from './metrics'

const app = express()
const authRouter = express.Router()
const LevelStore = levelSession(session)
const port: string = process.env.PORT || '8080'
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
const dbUser: UserHandler = new UserHandler('./db/users')

app.use(express.static(path.join(__dirname, '/../public')))

.use(bodyparser.json())
.use(bodyparser.urlencoded())

.use(authRouter)
.use(morgan('dev'))
.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

.post('/login', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

const userRouter = express.Router()
app.use('/user', userRouter)

userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
      res.status(409).send("user already exists")
    } else {
      let user = new User(req.body.username, req.body.email, req.body.password)
      console.log(user)
      dbUser.save(user, function (err: Error | null) {
        if (err) next(err)
        else res.status(201).send("user persisted")
      })
    }
  })
})

.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.username })
})

// app.get('/', (req: any, res: any) => {
//   res.write('Hello world')
//   res.end()
// })

app.get('/hello/:name', (req: any, res: any) => {
  res.render('index.ejs', {name: req.params.name})
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})
