import { NextResponse } from "next/server";
import { customerController } from "@/controllers";
import { JWT_SECRET } from "@/middleware/authMiddleware";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone, googleId } = body;

    let customerUser = null;

    if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, message: "Please provide your Name, Email, and Password." },
          { status: 400 }
        );
      }
      customerUser = await customerController.registerCustomer({ name, email, password, phone });
    } else if (action === "google") {
      if (!email) {
        return NextResponse.json(
          { success: false, message: "Google account email is required." },
          { status: 400 }
        );
      }
      customerUser = await customerController.loginWithGoogle({ email, name, googleId });
    } else {
      // Default: login
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: "Please enter both Email and Password." },
          { status: 400 }
        );
      }
      customerUser = await customerController.loginCustomer({ email, password });
    }

    const token = jwt.sign(
      {
        id: customerUser.id,
        email: customerUser.email,
        name: customerUser.name,
        role: "customer",
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({
      success: true,
      message: action === "register" ? "Account registered successfully!" : "Signed in successfully!",
      customer: customerUser,
      token,
    });

    response.cookies.set({
      name: "thoranam_customer_token",
      value: token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Customer Auth API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Customer authentication failed." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Signed out successfully.",
  });

  response.cookies.set({
    name: "thoranam_customer_token",
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
