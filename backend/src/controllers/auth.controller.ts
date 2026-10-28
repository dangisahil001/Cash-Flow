import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, businessName, phone, panCard } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      businessName,
      phone,
      panCard,
      emailVerificationTokenHash: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await newUser.save();

    if (smtpConfigured) {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${encodeURIComponent(verificationToken)}`;
      await mailTransport.sendMail({
        from: process.env.NOTIFICATION_EMAIL_FROM || process.env.SMTP_USER,
        to: newUser.email,
        subject: 'Verify your LendTrack email',
        text: `Verify your LendTrack email using this link (valid for 24 hours): ${verificationUrl}`,
        html: `<p>Verify your LendTrack email using the link below. It is valid for 24 hours.</p><p><a href="${verificationUrl}">Verify email</a></p>`,
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        businessName: newUser.businessName,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials or role mismatch' });
      return;
    }

    // Check password
    if (!user.password) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const genericMessage = 'If an account exists for that email, a password reset link has been sent.';

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ message: genericMessage });
      return;
    }

    if (!smtpConfigured) {
      res.status(503).json({
        message: 'Password reset email is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to backend/.env, then restart the backend.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${encodeURIComponent(resetToken)}`;
    await mailTransport.sendMail({
      from: process.env.NOTIFICATION_EMAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Reset your LendTrack password',
      text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
      html: `<p>Reset your LendTrack password using the link below. It is valid for 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
    });

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Unable to send password reset email' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ message: 'A reset token and a password of at least 8 characters are required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'This password reset link is invalid or has expired' });
      return;
    }

    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Verification token is required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'This verification link is invalid or has expired' });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully. You can now use your account.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Unable to verify email' });
  }
};
