const request = require('supertest');
const app     = require('../../app');
const mongoose = require('mongoose');

jest.setTimeout(2000)
describe('GET /api/books', () => {

  // Moking Book.find method
  let bookSpy;
  // Moking Book.findById method
  let bookSpyFindById;

  beforeAll( async () => {
    jest.unmock('mongoose');
    connection = await  mongoose.connect("mongodb+srv://melius:qwerty123@melius.i26zq.mongodb.net/melius?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
    //console.log('Database connected!');

    const Book = require('../../models/book');
    bookSpy = jest.spyOn(Book, 'find').mockImplementation(() => {
      return new Promise((resolve, reject) => resolve([{
        _id: "1010",
        title: 'se2 title',
        description: 'se2 desc',
        author: 'se2 author'
      }]));
    });
    bookSpyFindById = jest.spyOn(Book, 'findOne').mockImplementation((data) => {
      console.log("-----------------------------------------------------------------------------------------")
      console.log(data)
      if (data._id=="1010")
        return new Promise((resolve, reject) => resolve({
          _id: "1010",
          title: 'se2 title',
          description: 'se2 desc',
          author: 'se2 author'
        }));
      else
        return new Promise((resolve, reject) => resolve({}));
    });
  });

  afterAll(async () => {
    mongoose.connection.close(true);

    bookSpy.mockRestore();
    bookSpyFindById.mockRestore();
  });
  
  test('GET /api/books should respond with an array of books', async () => {
    return request(app)
      .get('/api/books')
      .expect('Content-Type', /json/)
      .expect(200)
      .then( (res) => {
        if(res.body && res.body[0]) {
          expect(res.body[0]).toEqual({
              _id: "1010",
              title: 'se2 title',
              description: 'se2 desc',
              author: 'se2 author'
          });
        }
      });
  });

  
  test('GET /api/books/:id should respond with json', async () => {
    return request(app)
      .get('/api/books/1010')
      .expect('Content-Type', /json/)
      .expect(200, {
          _id: "1010",
          title: 'se2 title',
          description: 'se2 desc',
          author: 'se2 author',
          availability: 0,
          starting_price: "?"
      });
  });

});