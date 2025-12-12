document.addEventListener("DOMContentLoaded", () => {
  // Elementos
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnBorrar = document.getElementById("btnBorrar");
  const btnLista = document.getElementById("btnLista");
  const mensaje = document.getElementById("mensaje");

  let modo = "login"; // por defecto

  // Validación helper
  const showMessage = (text, color = "black") => {
    if (!mensaje) return;
    mensaje.style.whiteSpace = "pre-wrap"; // para mostrar saltos de línea
    mensaje.textContent = text;
    mensaje.style.color = color;
  };

  // Cambiar a LOGIN
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      modo = "login";
      btnLogin.classList.add("active-btn");
      btnLogin.classList.remove("inactive-btn");
      btnRegister.classList.add("inactive-btn");
      btnRegister.classList.remove("active-btn");
      if (btnEnviar) btnEnviar.textContent = "Iniciar sesión";
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
      if (btnEnviar) btnEnviar.textContent = "Registrarse";
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

      const data = { usuario, password };
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

        // Manejar respuestas no-JSON
        let result;
        try {
          result = await response.json();
        } catch (e) {
          // si no es JSON, mostrar status text
          showMessage(`Error: respuesta inesperada del servidor (${response.status})`, "red");
          return;
        }

        if (result && typeof result === "object") {
          showMessage(result.ok ? result.mensaje : result.error, result.ok ? "green" : "red");
        } else {
          showMessage("Respuesta inválida del servidor", "red");
        }
      } catch (error) {
        showMessage("Error al comunicar con el servidor", "red");
      }
    });
  }

  // BORRAR CLIENTE
  if (btnBorrar) {
    btnBorrar.addEventListener("click", async () => {
      const usuarioInput = document.getElementById("usuario");
      const usuario = usuarioInput ? usuarioInput.value.trim() : "";

      showMessage("", "black");

      if (!usuario) {
        showMessage("Ingrese el usuario a borrar", "red");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/borrarcliente/${encodeURIComponent(usuario)}`,
          { method: "DELETE" }
        );

        let result;
        try {
          result = await response.json();
        } catch (e) {
          showMessage(`Error: respuesta inesperada del servidor (${response.status})`, "red");
          return;
        }

        showMessage(result.ok ? result.mensaje : result.error, result.ok ? "green" : "red");
      } catch (error) {
        showMessage("Error al comunicar con el servidor", "red");
      }
    });
  }

  // LISTA DE CLIENTES
  if (btnLista) {
    btnLista.addEventListener("click", async () => {
      showMessage("Cargando lista...", "black");

      try {
        const response = await fetch("http://localhost:3000/api/listaclientes");
        let result;
        try {
          result = await response.json();
        } catch (e) {
          showMessage(`Error: respuesta inesperada del servidor (${response.status})`, "red");
          return;
        }

        if (!result || typeof result !== "object") {
          showMessage("Respuesta inválida del servidor", "red");
          return;
        }

        if (!result.ok && result.error) {
          showMessage(result.error, "red");
          return;
        }

        const clientes = result.data || result.clientes || [];
        if (!Array.isArray(clientes) || clientes.length === 0) {
          showMessage("No hay clientes registrados", "black");
          return;
        }

        // Mostrar lista con saltos de línea
        const listado = clientes
          .map((c, i) => {
            const nombre = c.usuario ?? c.nombre ?? JSON.stringify(c);
            return `${i + 1}. ${nombre}`;
          })
          .join("\n");

        showMessage(`Clientes:\n${listado}`, "green");
      } catch (error) {
        showMessage("Error al obtener la lista", "red");
      }
    });
  }
});