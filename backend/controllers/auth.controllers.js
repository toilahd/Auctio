import * as z from "zod";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { createJwt, decodeJwt } from "./../utils/jwtUtil.js";
import UserModel from "../models/User.js";

const prisma = new PrismaClient();

const ACCESS_TOKEN_AGE = "2min";
const REFRESH_TOKEN_AGE = "30d";

const FRONTEND_URL = process.env.FRONTEND_URL;

export function whoAmI(req, res) {
  return res.json({ user: req.user, error: req.tokenError });
}

export async function login(req, res) {
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
  // Make validation schema
  const signupSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(3),
    fullName: z.string().max(100).min(1),
    address: z.string().max(200),
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
      .json({
        message: "Login via Google successful",
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
      .redirect(FRONTEND_URL);
  }

  res
    .cookie("access", accessToken, { httpOnly: true })
    .cookie("refresh", refreshToken, { httpOnly: true })
    .json({
      message: "Login via Google successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
}
