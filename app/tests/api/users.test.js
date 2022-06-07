const request  = require('supertest');
const jwt      = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app      = require('../../app');
const md5      = require('md5')
const mongoose = require('mongoose');
const session  = require('supertest-session');
const config   = require.main.require('./config')
jest.setTimeout(1000)


var testSession = null;

beforeAll( async () => {
  testSession = session(app);
  jest.unmock('mongoose');
  connection = await  mongoose.connect(config.db_url, {useNewUrlParser: true, useUnifiedTopology: true});
  const User = require('../../models/user');

  nadmin_user = {
    _id: "777",
    name: 'user name',
    email: 'user@email',
    password: md5("userpassword"),
    role: 'user'
  }
  admin_user = {
    _id: "666",
    name: 'admin name',
    email: 'admin@email',
    password: md5("adminpassword"),
    role: 'admin'
  }

  userSpy = jest.spyOn(User, 'findOne').mockImplementation((data) => {
    if (data._id == "777" || data.email=="user@email")
      return new Promise((resolve, reject) => resolve(nadmin_user));
    else if (data._id == "666" || data.email=="admin@email")
      return new Promise((resolve, reject) => resolve(admin_user));
    else
      return new Promise((resolve, reject) => resolve());
  });

  usersSpy = jest.spyOn(User, 'find').mockImplementation((data) => {
    return new Promise((resolve, reject) => resolve([nadmin_user, admin_user]));
    });
});

afterAll(async () => {
  mongoose.connection.close(true);
  userSpy.mockRestore();
  usersSpy.mockRestore();
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

  var token;

  test('POST /api/login should login', function (done) {
    testSession.post('/api/login')
      .send({ email: 'user@email', password: 'userpassword' })
      .expect(200)
      .end(function(err, res){
        token = res.body.token;
        return done();
      });
  });

  test('GET /api/users?token=<valid> as user should return 401', function (done) {
    testSession.get('/api/users?token='+token)
      .expect(401)
      .end(done)
  });
  test('GET /api/users?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });
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
  test('GET /api/users/777?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });

  test('POST /api/logout should logout', function (done) {
    testSession.post('/api/logout?token='+token)
      .expect(200)
      .end(done);
  });

});



describe('after authenticating admin session', function () {

  var token;

  test('POST /api/login should login', function (done) {
    testSession.post('/api/login')
      .send({ email: 'admin@email', password: 'adminpassword' })
      .expect(200)
      .end(function(err, res){
        token = res.body.token;
        return done();
      });
  });

  test('GET /api/users?token=<valid> as admin should return users', function (done) {
    testSession.get('/api/users?token='+token)
      .send()
      .expect(200)
      .end(function(err, res){
        if(res.body && res.body[0]) {
          expect(res.body[0]).toEqual({
              _id: "777",
              name: 'user name',
              email: 'user@email',
              role: 'user'
          });
        }
        return done()
      })
  });
  test('GET /api/users?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });
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
  test('GET /api/users/777?token=<invalid> should return 401', function (done) {
    testSession.get('/api/users?token=invalid_token')
      .expect(401)
      .end(done)
  });

});
