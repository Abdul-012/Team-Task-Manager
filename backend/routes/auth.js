const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const supabase = require('../config/db');
const { signupValidation, loginValidation } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

function setAuthCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function getBaseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function redirectWithAuthError(req, res, message) {
  const params = new URLSearchParams({ error: message });
  return res.redirect(`${getBaseUrl(req)}/?${params.toString()}`);
}

function clearAuthCookie(res, name) {
  res.clearCookie(name, authCookieOptions);
}

// POST /api/auth/signup
router.post('/signup', signupValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id, password, github_id')
      .eq('email', email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const message = existing.github_id && !existing.password
        ? 'This email is registered with GitHub. Continue with GitHub to sign in.'
        : 'Email already registered';
      return res.status(409).json({ error: message });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword })
      .select('id, name, email, created_at')
      .single();

    if (error) throw error;

    setAuthCookie(res, user.id);

    res.status(201).json({ message: 'Account created successfully', user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, github_id')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password) {
      const message = user.github_id
        ? 'This account uses GitHub. Continue with GitHub to sign in.'
        : 'Password login is not available for this account';
      return res.status(401).json({ error: message });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    setAuthCookie(res, user.id);

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/auth/config — frontend auth feature flags
router.get('/config', (req, res) => {
  res.json({
    githubOAuthEnabled: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

// GET /api/auth/github — start GitHub OAuth login
router.get('/github', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return redirectWithAuthError(req, res, 'GitHub login is not configured');
  }

  const state = crypto.randomBytes(24).toString('hex');
  const redirectUri = `${getBaseUrl(req)}/api/auth/github/callback`;

  res.cookie('github_oauth_state', state, {
    ...authCookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
    allow_signup: 'true',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// GET /api/auth/github/callback — finish GitHub OAuth login
router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies.github_oauth_state;
  clearAuthCookie(res, 'github_oauth_state');

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithAuthError(req, res, 'GitHub login session expired. Please try again.');
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return redirectWithAuthError(req, res, 'GitHub login is not configured');
  }

  try {
    const redirectUri = `${getBaseUrl(req)}/api/auth/github/callback`;
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'GitHub token exchange failed');
    }

    const githubHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TaskFlow',
    };

    const [profileResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', { headers: githubHeaders }),
      fetch('https://api.github.com/user/emails', { headers: githubHeaders }),
    ]);

    if (!profileResponse.ok) {
      throw new Error('Failed to load GitHub profile');
    }

    const profile = await profileResponse.json();
    const emails = emailsResponse.ok ? await emailsResponse.json() : [];
    const verifiedEmail = emails.find(email => email.primary && email.verified) || emails.find(email => email.verified);

    if (!verifiedEmail) {
      return redirectWithAuthError(req, res, 'No verified email was found on your GitHub account');
    }

    const githubId = String(profile.id);
    const email = verifiedEmail.email.toLowerCase();
    const name = profile.name || profile.login || email.split('@')[0];

    let { data: user, error: githubUserError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('github_id', githubId)
      .maybeSingle();

    if (githubUserError) throw githubUserError;

    if (user) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ name, avatar_url: profile.avatar_url || null })
        .eq('id', user.id)
        .select('id, name, email')
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      const { data: emailUser, error: emailUserError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', email)
        .maybeSingle();

      if (emailUserError) throw emailUserError;

      if (emailUser) {
        const { data: linkedUser, error: linkError } = await supabase
          .from('users')
          .update({ github_id: githubId, avatar_url: profile.avatar_url || null })
          .eq('id', emailUser.id)
          .select('id, name, email')
          .single();

        if (linkError) throw linkError;
        user = linkedUser;
      } else {
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert({
            name,
            email,
            github_id: githubId,
            avatar_url: profile.avatar_url || null,
          })
          .select('id, name, email')
          .single();

        if (createError) throw createError;
        user = createdUser;
      }
    }

    setAuthCookie(res, user.id);
    res.redirect(`${getBaseUrl(req)}/dashboard.html`);
  } catch (err) {
    console.error('GitHub login error:', err);
    return redirectWithAuthError(req, res, 'Failed to sign in with GitHub');
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res, 'token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me — get current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
