require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth server is running' });
});

// Google OAuth - Start authentication
app.get('/auth/google', (req, res) => {
  const { nonce, state } = req.query;
  
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    return res.status(400).json({ 
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID in .env file'
    });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&state=${state}` +
    `&nonce=${nonce}`;

  res.redirect(googleAuthUrl);
});

// Google OAuth - Callback handler
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { id_token, access_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userInfo = userInfoResponse.data;

    // Redirect back to frontend with user info
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
      `email=${encodeURIComponent(userInfo.email)}` +
      `&name=${encodeURIComponent(userInfo.name)}` +
      `&id_token=${id_token}` +
      `&provider=google` +
      `&state=${state}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    if (error.response) {
      console.error('Google OAuth error response:', error.response.data);
    }
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// 42 OAuth - Start authentication
app.get('/auth/42', (req, res) => {
  const { state } = req.query;
  
  if (!process.env.FORTY_TWO_CLIENT_ID || process.env.FORTY_TWO_CLIENT_ID === 'YOUR_42_CLIENT_ID') {
    return res.status(400).json({ 
      error: '42 OAuth not configured',
      message: 'Please set FORTY_TWO_CLIENT_ID in .env file'
    });
  }

  const fortyTwoAuthUrl = `https://api.intra.42.fr/oauth/authorize?` +
    `client_id=${process.env.FORTY_TWO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.FORTY_TWO_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=public` +
    `&state=${state}`;

  res.redirect(fortyTwoAuthUrl);
});

// 42 OAuth - Callback handler
app.get('/auth/42/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.FORTY_TWO_CLIENT_ID,
      client_secret: process.env.FORTY_TWO_CLIENT_SECRET,
      code,
      redirect_uri: process.env.FORTY_TWO_REDIRECT_URI
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userInfo = userInfoResponse.data;

    // Redirect back to frontend with user info
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
      `email=${encodeURIComponent(userInfo.email)}` +
      `&name=${encodeURIComponent(userInfo.login)}` +
      `&provider=42` +
      `&state=${state}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('42 OAuth error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ OAuth server running on http://localhost:${PORT}`);
  console.log(`📝 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`🔑 42 OAuth: ${process.env.FORTY_TWO_CLIENT_ID ? 'Configured' : 'Not configured'}`);
});
