export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

const API_BASE = "http://localhost:5000";

export async function signUpUser(data: SignUpPayload) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to sign up");
  }

  return res.json();
}

export async function signInUser(data: SignInPayload) {
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to sign in");
  }

  return res.json();
}
