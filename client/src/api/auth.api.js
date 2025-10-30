// client/src/api/auth.api.js
// ============================================================================
// Auth API — robuste aux différentes formes de payload (data/email/username)
// et toujours avec credentials: 'include' pour les cookies
// ============================================================================

const BASE_URL = import.meta.env.VITE_SERVER_URL; // ex: "http://localhost:5000/"

// Petite normalisation pour accepter {data} ou {email} ou {username}
function normalizeLoginPayload(values) {
  const data = values?.data ?? values?.email ?? values?.username ?? ""; // évite undefined

  return { data, password: values?.password ?? "" };
}

export async function signUp(values) {
  try {
    const response = await fetch(`${BASE_URL}user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function authGoogle(values) {
  const token = values.access_token;
  try {
    const response = await fetch(`${BASE_URL}user/auth-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function signIn(values) {
  try {
    // ✅ Accepte email/username/data
    const payload = normalizeLoginPayload(values);

    const response = await fetch(`${BASE_URL}user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // L’API renvoie { user, message } en succès, ou { message } en erreur
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${BASE_URL}user/current`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signout() {
  try {
    await fetch(`${BASE_URL}user/deleteToken`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    console.log(error);
  }
}

export async function updateUserProfile(data) {
  try {
    const response = await fetch(`${BASE_URL}user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}
