const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Posts Routes', () => {
  let token;
  let postId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    token = res.body.token;
  });

  it('should create a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Post',
        content: 'This is a test post',
      });
    expect(res.statusCode).toEqual(201);
    postId = res.body._id;
  });

  it('should get posts', async () => {
    const res = await request(app)
      .get('/api/posts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.posts).toBeInstanceOf(Array);
  });
});
