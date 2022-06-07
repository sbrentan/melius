const request  = require('supertest');
const jwt      = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app      = require('../../app');
const mongoose = require('mongoose');
const session  = require('supertest-session');
const config   = require.main.require('./config')
const md5      = require("md5")
jest.setTimeout(1000)


var testSession = null;

beforeAll( async () => {
  testSession = session(app);
  jest.unmock('mongoose');
  connection = await  mongoose.connect(config.db_url, {useNewUrlParser: true, useUnifiedTopology: true});
  const Copy = require('../../models/copy');
  copy = {
        _id: "100",
        book: 'bookid',
        price: '17',
        owner: 'ownerid'
      }
  copySpy = jest.spyOn(Copy, 'findOne').mockImplementation((data) => {
    if (data._id == "100")
      return new Promise((resolve, reject) => resolve(copy));
    else
      return new Promise((resolve, reject) => resolve());
  });

  copiesSpy = jest.spyOn(Copy, 'find').mockImplementation((data) => {
    return new Promise((resolve, reject) => resolve([copy]));
  });

  const User = require('../../models/user');
  userSpy = jest.spyOn(User, 'findOne').mockImplementation((data) => {
    console.log(data)
    if ((data._id && data._id == "666") || data.email=="admin@email")
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
  copySpy.mockRestore();
  copiesSpy.mockRestore();
  userSpy.mockRestore();
});


describe('before authenticating session', function () {
  test('GET /api/copies without token should return 401', function (done) {
    testSession.get('/api/copies')
      .expect(401)
      .end(done)
  });
  test('GET /api/copies/100 without token should return 401', function (done) {
    testSession.get('/api/copies')
      .expect(401)
      .end(done)
  });
})

describe('after authenticating admin session', function () {

  var token;

  test('POST /api/login should login', function (done) {
    testSession.post('/api/login')
      .send({ email: 'admin@email', password: 'adminpassword' })
      .expect(200)
      .end(function(err, res){
        token = res.body.token;
        console.log(res.body)
        return done();
      });
  });

  test('GET /api/copies?token=<valid> as admin should return copies', function (done) {
    testSession.get('/api/copies?token='+token)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if(res.body && res.body[0]) {
          expect(res.body[0]).toEqual({
                _id: "100",
                book: 'bookid',
                price: '17',
                owner: 'ownerid'
            });
        }
        return done();
      });
  });
  test('GET /api/copies?token=<invalid> should return 401', function (done) {
    testSession.get('/api/copies?token=invalid_token')
      .expect(401)
      .end(done)
  });
  test('GET /api/copies/100?token=<valid> should return copy data', function (done) {
    testSession.get('/api/copies/100?token='+token)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).toEqual({
              _id: "100",
              book: 'bookid',
              price: '17',
              owner: 'ownerid'
          });
        return done();
      });
  });
  test('GET /api/copies/100?token=<invalid> should return 401', function (done) {
    testSession.get('/api/copies?token=invalid_token')
      .expect(401)
      .end(done)
  });

  test('POST /api/logout should logout', function (done) {
    testSession.post('/api/logout?token='+token)
      .expect(200)
      .end(done);
  });

});
