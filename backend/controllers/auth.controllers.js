import * as z from "zod";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createJwt, decodeJwt } from "./../utils/jwtUtil.js";
import UserModel from "../models/User.js";
import { sendEmail } from "../config/email.js";

const prisma = new PrismaClient();

const ACCESS_TOKEN_AGE = "10min";
const REFRESH_TOKEN_AGE = "30d";

const FRONTEND_URL = process.env.FRONTEND_URL;

// Endpoint with Swagger autogen notation, this endpoint uses the cookies or authentication header set by the client to identify the user
export function whoAmI(req, res) {
  /*
    #swagger.summary = 'Get current user info'
    #swagger.description = 'Authenticate a user. Token can be provided via Authorization header or HttpOnly cookies.'

    #swagger.security = [
      { "bearerAuth": [] },
      { "cookieAuth": [] }
    ]

    #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'Bearer access token (optional)',
      required: false,
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }

    #swagger.parameters['access'] = {
      in: 'cookie',
      description: 'Access token cookie (optional)',
      required: false,
      type: 'string'
    }

    #swagger.responses[200] = {
      description: 'User info retrieved successfully or token error.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                  email: { type: 'string', example: 'user@example.com' },
                  fullName: { type: 'string', example: 'John Doe' },
                  role: { type: 'string', example: 'BIDDER' },
                  address: { type: 'string', example: '123 Main St, City, Country' },
                  createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:34:56Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2023-10-10T08:21:45Z' }
                }
              },
              error: { type: 'string', example: null }
            }
          }
        }
      }
    }
  */
  if (req.user) {
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
      },
      error: null,
    });
  } else {
    return res.status(401).json({
      user: null,
      error: "No valid authentication token provided",
    });
  }
}

export async function login(req, res) {
  /*
    #swagger.summary = 'User login'
    #swagger.description = 'Authenticate a user and provide access and refresh tokens.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User login credentials',
      required: true,
      schema: {
        email: 'nguyena@mail.com',
        password: 'yourPassword'
      }
    }
    #swagger.responses[200] = {
      description: 'Login successful.',
      schema: {
        message: 'Login successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
    #swagger.responses[400] = {
      description: 'Invalid input.',
      schema: { message: 'Invalid input' }
    }
    #swagger.responses[401] = {
      description: 'Invalid credentials.',
      schema: { message: 'Invalid credentials' }
    }
    #swagger.responses[500] = {
      description: 'Server error.',
      schema: { message: 'Server error' }
    }
  */

  // Make validation schema
  const loginSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(3),
  });

  // Validate input
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Login validation error:", parseResult.error.message);
    return res.status(400).json({
      message: "Invalid input",
      errors: JSON.parse(parseResult.error.message),
    });
  }

  // Verify reCAPTCHA
  // try {
  //   const captchaResponse = parseResult.data.captcha;
  //   const secretKey = process.env.RE_SECRET_KEY;

  //   const response = await fetch(process.env.RE_VERIFY, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: `secret=${secretKey}&response=${captchaResponse}`,
  //   });

  //   const captchaResult = await response.json();
  //   console.log("reCAPTCHA verification result:", captchaResult);
  //   if (!captchaResult.success || captchaResult.success !== true) {
  //     console.log("reCAPTCHA verification failed:", captchaResult);
  //     return res.status(400).json({ message: "reCAPTCHA verification failed" });
  //   }

  //   console.log("reCAPTCHA verification succeeded");
  // } catch (error) {
  //   console.log("reCAPTCHA verification failed:", error);
  //   return res.status(500).json({ message: "reCAPTCHA verification failed" });
  // }

  // Continue with login logic
  const { email, password } = parseResult.data;
  // const foundUser = await prisma.user.findFirst({
  //   where: { email: email },
  // });
  const foundUser = await UserModel.findByEmail(email);

  // No user found
  if (!foundUser) {
    console.log("Invalid credentials for email:", email);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordMatched = await bcrypt.compare(password, foundUser.password);

  if (!isPasswordMatched) {
    console.log("Invalid credentials for email:", email);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // All good, create tokens
  const userInfoPayload = {
    id: foundUser.id,
    fullName: foundUser.fullName,
    email: foundUser.email,
    role: foundUser.role,
    isVerified: foundUser.isVerified,
  };

  const accessToken = createJwt(userInfoPayload, {
    expiresIn: ACCESS_TOKEN_AGE,
  });

  const refreshToken = createJwt(userInfoPayload, {
    expiresIn: REFRESH_TOKEN_AGE,
  });

  // validRefreshTokens.add(refreshToken);
  UserModel.update(foundUser.id, { resetToken: refreshToken });

  res
    .cookie("access", accessToken, { httpOnly: true })
    .cookie("refresh", refreshToken, { httpOnly: true })
    .json({
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
}

export async function signup(req, res) {
  /*
    #swagger.summary = 'User signup'
    #swagger.description = 'Register a new user account.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User signup details',
      required: true,
      schema: {
        email: 'nguyena@mail.com',
        password: 'yourPassword',
        fullName: 'Nguyen A',
        address: '123 Main St, City, Country',
        captcha: 'reCAPTCHA response token'
      }
    }
    #swagger.responses[201] = {
      description: 'Signup successful.',
      schema: {
        message: 'Signup successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
    #swagger.responses[400] = {
      description: 'Invalid input or reCAPTCHA verification failed.',
      schema: { message: 'Invalid input' }
    }
    #swagger.responses[409] = {
      description: 'Email already in use.',
      schema: { message: 'Email already in use' }
    }
    #swagger.responses[500] = {
      description: 'reCAPTCHA verification failed.',
      schema: { message: 'reCAPTCHA verification failed' }
    }
  */

  // Make validation schema
  const signupSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(3),
    fullName: z.string().max(100).min(1),
    address: z.string().max(200),
    captcha: z.string().min(1),
  });

  // Validate input
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Signup validation error:", parseResult.error.message);
    return res.status(400).json({
      message: "Invalid input",
      errors: JSON.parse(parseResult.error.message),
    });
  }

  // Verify reCAPTCHA
  try {
    const captchaResponse = parseResult.data.captcha;
    const secretKey = process.env.RE_SECRET_KEY;

    const response = await fetch(process.env.RE_VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${captchaResponse}`,
    });

    const captchaResult = await response.json();
    console.log("reCAPTCHA verification result:", captchaResult);
    if (!captchaResult.success || captchaResult.success !== true) {
      console.log("reCAPTCHA verification failed:", captchaResult);
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    console.log("reCAPTCHA verification succeeded");
  } catch (error) {
    console.log("reCAPTCHA verification failed:", error);
    return res.status(500).json({ message: "reCAPTCHA verification failed" });
  }

  const { email, password, fullName, address } = parseResult.data;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: email },
  });

  if (existingUser) {
    console.log("Email already in use:", email);
    return res.status(409).json({ message: "Email already in use" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      fullName: fullName,
      address: address,
      role: UserRole.BIDDER, // Default role
    },
  });

  console.log(`User created successfully: ${newUser.email}, ID: ${newUser.id}`);

  // JWT will always has isVerified as false on signup
  // If there is a OTP screen, update the JWT with correct isVerified
  // TODO: OTP logic
  const otpToken = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP for ${newUser.email}: ${otpToken}`);
  // In production, send this OTP via email/SMS
  await sendEmail(
    newUser.email,
    "Mã xác thực email - Auctio",
    `Mã OTP của bạn là: ${otpToken}`,
    `
      <h2>Xác thực email</h2>
      <p>Xin chào ${newUser.fullName},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Auctio. Mã OTP xác thực email của bạn là:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">${otpToken}</div>
      <p>Mã này sẽ hết hạn sau 24 giờ.</p>
      <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
    `
  );
  // Store OTP token in database or cache with expiration
  await UserModel.update(newUser.id, { verificationToken: otpToken });

  const userInfoPayload = {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    isVerified: false,
  };

  const accessToken = createJwt(userInfoPayload, {
    expiresIn: ACCESS_TOKEN_AGE,
  });

  const refreshToken = createJwt(userInfoPayload, {
    expiresIn: REFRESH_TOKEN_AGE,
  });

  // validRefreshTokens.add(refreshToken);
  UserModel.update(newUser.id, { resetToken: refreshToken });

  res
    .cookie("access", accessToken, { httpOnly: true })
    .cookie("refresh", refreshToken, { httpOnly: true })
    .status(201)
    .json({
      message: "Signup successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
}

export async function createNewOtp(req, res) {
  /*
    #swagger.summary = 'Create new OTP for email verification'
    #swagger.description = 'Generate and send a new OTP code to the user email for verification.'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'New OTP sent successfully.',
      schema: { message: 'New OTP sent successfully' }
    }
    #swagger.responses[401] = {
      description: 'Not authenticated.',
      schema: { message: 'Not authenticated' }
    }
    #swagger.responses[500] = {
      description: 'Failed to generate or send OTP.',
      schema: { message: 'Failed to generate or send OTP' }
    }
  */

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.isVerified) {
    return res.json({ message: "Email already verified" });
  }

  try {
    const otpToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated new OTP for ${user.email}: ${otpToken}`);
    // In production, send this OTP via email/SMS
    await sendEmail(
      user.email,
      "Mã xác thực email mới - Auctio",
      `Mã OTP mới của bạn là: ${otpToken}`,
      `
        <h2>Mã xác thực mới</h2>
        <p>Xin chào ${user.fullName},</p>
        <p>Bạn đã yêu cầu gửi lại mã xác thực email. Mã OTP mới của bạn là:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">${otpToken}</div>
        <p>Mã này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      `
    );
    // Store OTP token in database or cache with expiration
    await UserModel.update(user.id, { verificationToken: otpToken });

    res.json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.log("Failed to generate or send OTP:", error);
    return res.status(500).json({ message: "Failed to generate or send OTP" });
  }
}

export async function verifyEmail(req, res) {
  /*
    #swagger.summary = 'Verify user email'
    #swagger.description = 'Verify the user email using the OTP code sent to their email.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Email verification details',
      required: true,
      schema: {
        otp: '123456'
      }
    }
    #swagger.responses[200] = {
      description: 'Email verified successfully.',
      schema: { message: 'Email verified successfully', accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
    #swagger.responses[400] = {
      description: 'Invalid input.',
      schema: { message: 'Invalid input' }
    }
    #swagger.responses[401] = {
      description: 'Invalid or expired OTP.',
      schema: { message: 'Invalid or expired OTP' }
    }
  */

  // Make validation schema
  const verifySchema = z.object({
    otp: z.string().min(6).max(6),
  });

  // Validate input
  const parseResult = verifySchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log(
      "Email verification validation error:",
      parseResult.error.message
    );
    return res.status(400).json({
      message: "Invalid input",
      errors: JSON.parse(parseResult.error.message),
    });
  }

  const { otp } = parseResult.data;

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.isVerified) {
    return res.json({ message: "Email already verified" });
  }

  // Check OTP
  if (user.verificationToken !== otp) {
    console.log(
      `Invalid OTP for user ${user.email}: provided ${otp}, expected ${user.verificationToken}`
    );
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  // Update user as verified and clear verification token
  UserModel.update(user.id, { isVerified: true, verificationToken: null });

  console.log(
    `User email verified successfully: ${user.email}, ID: ${user.id}`
  );

  const userInfoPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  const accessToken = createJwt(userInfoPayload, {
    expiresIn: ACCESS_TOKEN_AGE,
  });

  const refreshToken = createJwt(userInfoPayload, {
    expiresIn: REFRESH_TOKEN_AGE,
  });

  // Update stored refresh token
  UserModel.update(user.id, { resetToken: refreshToken });

  res
    .cookie("access", accessToken, { httpOnly: true })
    .cookie("refresh", refreshToken, { httpOnly: true })
    .json({
      message: "Email verified successfully",
      accessToken,
      refreshToken,
    });
}

export function logout(req, res) {
  /*
    #swagger.summary = 'User logout'
    #swagger.description = 'Logout the current user by clearing authentication cookies.'
    #swagger.responses[200] = {
      description: 'Logged out successfully.',
      schema: { message: 'Logged out successfully' }
    }
    #swagger.responses[401] = {
      description: 'Not authenticated.',
      schema: { message: 'Not authenticated' }
    }
  */
  const user = req.user || null;
  if (user === null) {
    console.log("Logout attempt without authentication");
    return res.status(401).json({ message: "Not authenticated" });
  }

  UserModel.update(user.id, { resetToken: null });

  console.log(`User logged out: ${user.email}, ID: ${user.id}`);
  res.clearCookie("access");
  res.clearCookie("refresh");
  res.json({ message: "Logged out successfully" });
}

export async function refreshToken(req, res) {
  /*
    #swagger.summary = 'Refresh access token'
    #swagger.description = 'Refresh the access token using a valid refresh token.'
    #swagger.parameters['refresh'] = {
      in: 'cookie',
      description: 'Refresh token cookie',
      required: false,
      schema: { refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Refresh token in request body (optional)',
      required: false,
      schema: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
    #swagger.responses[200] = {
      description: 'Access token refreshed successfully.',
      schema: {
        message: 'Access token refreshed',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
    #swagger.responses[401] = {
      description: 'Invalid or missing refresh token.',
      schema: { message: 'Invalid refresh token' }
    }
  */

  const bodyRefreshToken = req.body.token;
  const refreshToken = req.cookies.refresh || bodyRefreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const { payload: user, error } = decodeJwt(refreshToken);
  if (error || !user) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const storedUser = await UserModel.findById(user.id);

  if (!storedUser || storedUser.resetToken !== refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const userInfoPayload = {
    id: storedUser.id,
    fullName: storedUser.fullName,
    email: storedUser.email,
    role: storedUser.role,
    isVerified: storedUser.isVerified,
  };

  const newAccessToken = createJwt(userInfoPayload, {
    expiresIn: ACCESS_TOKEN_AGE,
  });

  const newRefreshToken = createJwt(userInfoPayload, {
    expiresIn: REFRESH_TOKEN_AGE,
  });

  // Update stored refresh token
  UserModel.update(storedUser.id, { resetToken: newRefreshToken });

  res
    .cookie("access", newAccessToken, { httpOnly: true })
    .cookie("refresh", newRefreshToken, { httpOnly: true })
    .json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
}

export function googleOAuthCallback(req, res) {
  const user = req.user || null;
  if (user === null) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const userInfoPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  const accessToken = createJwt(userInfoPayload, {
    expiresIn: ACCESS_TOKEN_AGE,
  });

  const refreshToken = createJwt(userInfoPayload, {
    expiresIn: REFRESH_TOKEN_AGE,
  });

  UserModel.update(user.id, { resetToken: refreshToken });

  if (FRONTEND_URL) {
    return res
      .cookie("access", accessToken, { httpOnly: true })
      .cookie("refresh", refreshToken, { httpOnly: true })
      .redirect(FRONTEND_URL);
  } else {
    res
      .cookie("access", accessToken, { httpOnly: true })
      .cookie("refresh", refreshToken, { httpOnly: true })
      .json({
        message: "Login via Google successful",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  }
}

export async function forgotPassword(req, res) {
  /*
    #swagger.summary = 'Request password reset'
    #swagger.description = 'Send password reset email with token'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User email',
      required: true,
      schema: { email: 'user@example.com' }
    }
    #swagger.responses[200] = {
      description: 'Reset email sent successfully'
    }
  */
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link will be sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${user.email}: ${resetLink}`); // For testing purposes
    await sendEmail(
      user.email,
      "Đặt lại mật khẩu - Auctio",
      `Nhấp vào link sau để đặt lại mật khẩu: ${resetLink}`,
      `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào ${user.fullName},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Đặt lại mật khẩu</a>
        </div>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">${resetLink}</p>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link will be sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
}

export async function resetPassword(req, res) {
  /*
    #swagger.summary = 'Reset password with token'
    #swagger.description = 'Reset user password using reset token'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Reset token and new password',
      required: true,
      schema: {
        token: 'reset-token-here',
        password: 'newPassword123'
      }
    }
    #swagger.responses[200] = {
      description: 'Password reset successfully'
    }
  */
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
}
