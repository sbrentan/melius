const request  = require('supertest');
const jwt      = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app      = require('../../app');
const md5      = require('md5')
const mongoose = require('mongoose');
const session  = require('supertest-session');
const config   = require('../../config')
jest.setTimeout(1000)


var testSession = null;

beforeAll( async () => {
  testSession = session(app);
  jest.unmock('mongoose');
  connection = await  mongoose.connect(config.db_url, {useNewUrlParser: true, useUnifiedTopology: true});
  const User = require('../../models/user');
  userSpy = jest.spyOn(User, 'findOne').mockImplementation((data) => {
    console.log("-----------------------------------------------------------------------------------------")
    console.log(data)
    if (data.id == "777" || data.email=="user@email")
      return new Promise((resolve, reject) => resolve({
        _id: "777",
        name: 'user name',
        email: 'user@email',
        password: md5("userpassword"),
        role: 'user'
      }));
    else if (data.id == "666" || data.email=="admin@email")
      return new Promise((resolve, reject) => resolve({
        _id: "666",
        name: 'admin name',
        email: 'admin@email',
        password: md5("adminpassword"),
        role: 'admin'
      }));
    else
      return new Promise((resolve, reject) => resolve());
  });
});

afterAll(async () => {
  mongoose.connection.close(true);
  userSpy.mockRestore();
});


describe('before authenticating session', function () {
  test('GET /api/users without token should return 401', function (done) {
    testSession.get('/api/users')
      .expect(401)
      .end(done)
  });
  test('GET /api/users/777 without token should return 401', function (done) {
    testSession.get('/api/users')
      .expect(401)
      .end(done)
  });

  test('POST /api/users should sign in user', function (done) {
    testSession.post('/api/users')
      .send({ name: "new user name", email: 'newuser@email', password: 'newuserpassword' })
      .expect(200)
      .end(done);
  });
})

describe('after authenticating user session', function () {

  var authenticatedSession;
  var token;

  /*beforeAll(function (done) {
    testSession.post('/api/login')
      .send({ email: 'user@email', password: 'userpassword' })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        authenticatedSession = testSession;
        token = res.body.token;
        console.log("token is "+token)
        return done();
      });
  });*/

  test('POST /api/login should login', function (done) {
    testSession.post('/api/login')
      .send({ email: 'user@email', password: 'userpassword' })
      .expect(200)
      .end(function(err, res){
        token = res.body.token;
        return done();
      });
  });

  /*test('GET /api/users?token=<valid> as user should return 401', function (done) {
    testSession.get('/api/users?token='+token)
      .expect(401)
      .end(done)
  });
  test('GET /api/users?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });*/
  test('GET /api/users/777?token=<valid> should return user data', function (done) {
    testSession.get('/api/users/777?token='+token)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).toEqual({
              _id: "777",
              name: 'user name',
              email: 'user@email',
              role: 'user'
          });
        return done();
      });
  });
  /*test('GET /api/users/777?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });*/

});


/*describe('after authenticating admin session', function () {

  var authenticatedSession;
  var token;

  beforeAll(function (done) {
    testSession.post('/api/login')
      .send({ email: 'admin@email', password: 'adminpassword' })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        authenticatedSession = testSession;
        token = res.body.token;
        console.log("token is "+token)
        return done();
      });
  });

  test('GET /api/users?token=<valid> as admin should return users', function (done) {
    authenticatedSession.get('/api/users?token='+token)
      .expect(200)
      .end(done)
  });
  test('GET /api/users?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });
  test('GET /api/users/777?token=<valid> should return user data', function (done) {
    testSession.get('/api/users?token='+token)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).toEqual({
              _id: "777",
              name: 'user name',
              email: 'user@email',
              role: 'user'
          });
        return done();
      });
  });
  test('GET /api/users/777?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });

});
*/














//var request_app = session(app)
//request_app = request(app)

/*beforeEach(function () {
  test_session = session(app)
});

jest.setTimeout(2000)
describe('GET /api/users', () => {

  // Moking User.findOne method
  let userSpy;

  let token;

  beforeAll( async () => {
    jest.unmock('mongoose');
    connection = await  mongoose.connect("mongodb://localhost:27017/melius", {useNewUrlParser: true, useUnifiedTopology: true});
    const User = require('../../models/user');
    userSpy = jest.spyOn(User, 'findOne').mockImplementation((data) => {
      console.log("-----------------------------------------------------------------------------------------")
      console.log(data)
      if (data.id == "777" || data.email=="user@email")
        return new Promise((resolve, reject) => resolve({
          _id: "777",
          name: 'user name',
          email: 'user@email',
          password: md5("userpassword"),
          role: 'user'
        }));
      else
        return new Promise((resolve, reject) => resolve({}));
    });

    test_session
      .post("/api/login")
      .set('Content-type', 'application/json')
      .send({ email: "user@email", password: "userpassword"})
      .end((err, res) => {
        console.log("sciao belo ---------------------------------------")
        console.log(res.body.token)
        token = res.body.token
        authenticated_session = test_session
      })
  });

  afterAll(async () => {
    request_app
      .post("/api/logout?token="+token)
      .set('Content-type', 'application/json')
      .send({})
      .end((err, res) => {
        console.log("adios belo ---------------------------------------")
      })

    mongoose.connection.close(true);
    userSpy.mockRestore();
  });
  
  test('GET /api/users with no token should return 401', async () => {
    const response = await request_app.get('/api/users');
    expect(response.statusCode).toBe(401);
  });

  test('GET /api/users?token=<invalid> should return 401', async () => {
    const response = await request_app.get('/api/users?token=123456');
    expect(response.statusCode).toBe(401);
  });
      
  test('GET /api/users/777?token=<valid> should return 200', async () => {
    expect.assertions(1);
    const response = await request_app.get('/api/users/777?token='+token);
    expect(response.statusCode).toBe(200);
  });

  test('GET /api/users/777?token=<valid> should return user information', async () => {
    expect.assertions(2);
    const response = await request_app.get('/api/users/777?token='+token);
    const user = response.body;
    expect(user).toBeDefined();
    expect(user.email).toBe('John@mail.com');
  });
});*/