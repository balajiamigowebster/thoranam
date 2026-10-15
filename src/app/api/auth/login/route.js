import { NextResponse } from "next/server";
import { authController } from "@/controllers";
import { AUTH_COOKIE_NAME, JWT_SECRET } from "@/middleware/authMiddleware";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both User ID and Password." },
        { status: 400 }
      );
    }

    // Verify credentials via authController (uses bcrypt.compare)
    const result = await authController.verifyLogin(userId.trim(), password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    // Create session JWT token valid for 7 days
    const token = jwt.sign(
      {
        id: result.user.id,
        userId: result.user.userId,
        name: result.user.name,
        role: result.user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful. Redirecting to Dashboard...",
      user: result.user,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth login API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during authentication." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
