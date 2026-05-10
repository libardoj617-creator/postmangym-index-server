/**
 * Módulo de autenticación
 * Maneja login y registro de usuarios
 */

export function initAuthEvents({
  btnLogin,
  btnRegister,
  btnEnviar,
  membresiaSelect,
  showMessage,
  onModoChange,
  onAuthSuccess,
  onAuthFailure
}) {
  let modo = "login";

  // Cambiar a LOGIN
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      modo = "login";
      btnLogin.classList.add("active-btn");
      btnLogin.classList.remove("inactive-btn");
      btnRegister.classList.add("inactive-btn");
      btnRegister.classList.remove("active-btn");
      if (btnEnviar) btnEnviar.textContent = "Iniciar sesión";
      onModoChange("login");
    });
  }

  // Cambiar a REGISTRO
  if (btnRegister) {
    btnRegister.addEventListener("click", () => {
      modo = "register";
      btnRegister.classList.add("active-btn");
      btnRegister.classList.remove("inactive-btn");
      btnLogin.classList.add("inactive-btn");
      btnLogin.classList.remove("active-btn");
      if (btnEnviar) btnEnviar.textContent = "Registrar";
      onModoChange("register");
    });
  }

  // Manejar cambio en membresía
  if (membresiaSelect) {
    membresiaSelect.addEventListener("change", () => {
      // el valor seleccionado se utiliza al registrar
    });
  }

  // Enviar datos Login/Registro
  if (btnEnviar) {
    btnEnviar.addEventListener("click", async () => {
      const usuarioInput = document.getElementById("usuario");
      const passwordInput = document.getElementById("password");

      const usuario = usuarioInput ? usuarioInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      showMessage("", "black");

      if (!usuario || !password) {
        showMessage("Debe llenar todos los campos", "red");
        return;
      }

      let data = { usuario, password };

      if (modo === "register") {
        const userRole = getUserRole();
        const membresiaSelectReg = document.getElementById("membresia");

        const tiempo_restante = membresiaSelectReg
          ? parseInt(membresiaSelectReg.value) || 0
          : 0;

        if (userRole === "admin") {
          const rolSelect = document.getElementById("rol");
          const rol = rolSelect ? rolSelect.value : "cliente";
          const membresia = tiempo_restante > 0 ? `${tiempo_restante} días` : "Inactiva";

          data = { ...data, rol, membresia, tiempo_restante };
        } else {
          // For regular registration, just send tiempo_restante
          data = { ...data, tiempo_restante };
        }
      }

      const url =
        modo === "login"
          ? "http://localhost:3000/api/login"
          : "http://localhost:3000/api/register";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        let result;
        try {
          result = await response.json();
        } catch (e) {
          showMessage(
            `Error: respuesta inesperada del servidor (${response.status})`,
            "red"
          );
          return;
        }

        if (result && typeof result === "object") {
          if (modo === "login" && result.ok && result.usuario) {
            onAuthSuccess(result.usuario);
          } else if (modo === "login") {
            onAuthFailure();
          }
          showMessage(
            result.ok ? result.mensaje : result.error,
            result.ok ? "green" : "red"
          );
        } else {
          showMessage("Respuesta inválida del servidor", "red");
        }
      } catch (error) {
        showMessage("Error al comunicar con el servidor", "red");
      }
    });
  }

  return {
    getModo: () => modo,
    setModo: (newModo) => {
      modo = newModo;
    }
  };
}

function getUserRole() {
  // Esta función se rellena desde el contexto del formulario.js
  // Por ahora retorna null para ser llamada desde el módulo
  return null;
}
