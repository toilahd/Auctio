import * as z from "zod";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { createJwt, decodeJwt } from "./../utils/jwtUtil.js";
import UserModel from "../models/User.js";

const prisma = new PrismaClient();

const ACCESS_TOKEN_AGE = "2min";
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
  return res.json({ user: req.user, error: req.tokenError });
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
        password: 'yourPassword',
        captcha: 'reCAPTCHA response token'
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
      description: 'Invalid input or reCAPTCHA verification failed.',
      schema: { message: 'Invalid input' }
    }
    #swagger.responses[401] = {
      description: 'Invalid credentials.',
      schema: { message: 'Invalid credentials' }
    }
    #swagger.responses[500] = {
      description: 'reCAPTCHA verification failed.',
      schema: { message: 'reCAPTCHA verification failed' }
    }
  */

  // Make validation schema
  const loginSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(3),
    captcha: z.string().min(1),
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
    userId: foundUser.id,
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
  const userInfoPayload = {
    userId: newUser.id,
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
    return res.status(401).json({ message: "Not authenticated" });
  }

  UserModel.update(user.userId, { resetToken: null });

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

  const storedUser = await UserModel.findById(user.userId);

  if (!storedUser || storedUser.resetToken !== refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const userInfoPayload = {
    userId: storedUser.id,
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
    userId: user.id,
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
