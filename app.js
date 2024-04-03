const express = require('express');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');

const SECRET_KEY = process.env.SECRET_KEY;
const corsOptions = {
  origin: ['https://rephrasify.netlify.app', 'https://u3.jesperhong.com', 'https://llm.jesperhong.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();
app.use(cookieParser());
app.use(cors(corsOptions));

const port = process.env.PORT || 8000;

async function increaseApiCount(req, res, next) {
  try {
      const usersUrl = `${process.env.USER_AUTHENTICATION_SERVICE_URL || 'http://localhost:3000'}/increaseExternalApiCount`;

      if (req.user) {
        await axios.post(usersUrl, {userId: req.user.userId});
      } else {
        await axios.post(usersUrl, {userId: null});
      }
      
      next();
  } catch (error) {
      console.error('Failed to increase API count:', error);
      next();
  }
};

function authenticateToken(req, res, next) {
  const token = req.cookies['token'];
  console.error("token: ", token)

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.use('/users', createProxyMiddleware({
  target: process.env.USER_AUTHENTICATION_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/users': ''
  }
}));

app.use('/usermanagement', authenticateToken, createProxyMiddleware({
  target: process.env.USER_AUTHENTICATION_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/usermanagement': ''
  }
}));

app.use('/huggingface', authenticateToken, increaseApiCount, createProxyMiddleware({
  target: process.env.LLM_SERVICE_URL || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/huggingface': ''
  }
}));


// Start server
app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
