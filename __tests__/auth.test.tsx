import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Login from "../app/(auth-pages)/sign-in/page";

// Mock the signInAction with a redirect response
jest.mock("../app/actions", () => ({
  signInAction: jest.fn().mockImplementation(() => {
    return Promise.resolve(new Response(null, {
      status: 302,
      headers: { Location: "/sign-in?error=Invalid credentials" },
    }));
  }),
}));

// Mock searchParams as a **plain object** (not a Promise)
const mockSearchParams = { error: "Invalid credentials" };

test("User can type email and password", async () => {
  render(<Login searchParams={{}} />); // ✅ No Promise needed

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);

  await userEvent.type(emailInput, "testuser@example.com");
  await userEvent.type(passwordInput, "password123");

  expect(emailInput).toHaveValue("testuser@example.com");
  expect(passwordInput).toHaveValue("password123");
});

test("Shows error message on invalid login", async () => {
  render(<Login searchParams={mockSearchParams} />); // ✅ No Promise needed

  // Check for the error message
  const errorMessage = await screen.findByText(/invalid credentials/i);
  expect(errorMessage).toBeInTheDocument();
});
