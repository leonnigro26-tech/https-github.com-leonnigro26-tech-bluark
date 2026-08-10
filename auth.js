async function authRequest(path, payload) {
  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
      credentials: "same-origin"
    });
  } catch {
    throw new Error("Abrí iniciar-bluark.bat y usá http://127.0.0.1:8000 para crear o ingresar a tu cuenta.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operación.");
  return data;
}

function updateAccountLink(user) {
  const navigation = document.querySelector(".nav-links, .new-nav");
  if (!navigation) return;
  const favorite = navigation.querySelector('a[href="favoritos.html"]');
  if (navigation.querySelector(".account-link")) return;
  const link = document.createElement("a");
  link.className = "account-link";
  link.href = "cuenta.html";
  link.textContent = user ? user.email.split("@")[0] : "Ingresar";
  if (favorite) navigation.insertBefore(link, favorite); else navigation.append(link);
}

async function currentUser() {
  try {
    const response = await fetch("/api/me", { credentials: "same-origin" });
    if (!response.ok) return null;
    return (await response.json()).user;
  } catch { return null; }
}

async function initializeAuth() {
  const user = await currentUser();
  updateAccountLink(user);
  const form = document.querySelector("[data-auth-form]");
  if (!form) return;
  const message = document.getElementById("authMessage");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (location.protocol === "file:") {
      message.textContent = "Para registrar una cuenta, abrí iniciar-bluark.bat y entrá desde http://127.0.0.1:8000.";
      message.className = "auth-message error";
      return;
    }
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const endpoint = form.dataset.authForm === "register" ? "/api/register" : "/api/login";
    try {
      const result = await authRequest(endpoint, { email, password });
      message.textContent = `¡Listo! Iniciaste sesión como ${result.user.email}.`;
      message.className = "auth-message success";
      updateAccountLink(result.user);
      setTimeout(() => { location.href = "index.html"; }, 700);
    } catch (error) {
      message.textContent = error.message;
      message.className = "auth-message error";
    }
  });
  document.getElementById("logoutButton")?.addEventListener("click", async () => {
    await authRequest("/api/logout");
    location.reload();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAuth, { once: true });
} else {
  initializeAuth();
}
