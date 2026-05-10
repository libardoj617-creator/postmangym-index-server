import { initListaClientes } from "./lista-de-clientes.js";
import { initActivarMembresia } from "./activar-membresia.js";
import {
  createShowMessage,
  toggleAdminFieldsFactory,
  toggleAdminControlsFactory,
  toggleUserInfoFactory
} from "./ui-helpers.js";
import { initAuthEvents } from "./auth.js";
import { initBorrarCliente, initCerrarSesion } from "./admin.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnLogout = document.getElementById("btnLogout");
  const btnBorrar = document.getElementById("btnBorrar");
  const btnLista = document.getElementById("btnLista");
  const btnActivarMembresia = document.getElementById("btnActivarMembresia");
  const btnConfirmarActivar = document.getElementById("btnConfirmarActivar");
  const activarPanel = document.getElementById("activar-membresia-panel");
  const activarUsuario = document.getElementById("activar-usuario");
  const activarDias = document.getElementById("activar-dias");
  const btnPago = document.getElementById("btnPago");
  const mensaje = document.getElementById("mensaje");
  const clientesListado = document.getElementById("clientes-listado");
  const userTitle = document.getElementById("user-title");
  const clientInfo = document.getElementById("client-info");
  const membershipLabel = document.getElementById("membership-label");
  const tiempoLabel = document.getElementById("tiempo-label");
  const statusMembershipLabel = document.getElementById("status-membership-label");
  const adminFields = document.getElementById("admin-fields");
  const membresiaSelect = document.getElementById("membresia");

  let modo = "login";
  let userRole = null;
  let currentUser = null;

  // Crear funciones de UI
  const showMessage = createShowMessage(mensaje);
  const toggleAdminFields = toggleAdminFieldsFactory(adminFields);
  const toggleAdminControls = toggleAdminControlsFactory({
    btnRegister,
    btnBorrar,
    btnLista,
    btnActivarMembresia,
    btnLogout,
    activarPanel,
    clientesListado
  });
  const toggleUserInfo = toggleUserInfoFactory({
    userTitle,
    clientInfo,
    membershipLabel,
    tiempoLabel,
    statusMembershipLabel
  });

  const resetToLogin = () => {
    modo = "login";
    userRole = null;
    currentUser = null;
    if (btnLogin) {
      btnLogin.classList.add("active-btn");
      btnLogin.classList.remove("inactive-btn");
    }
    if (btnRegister) {
      btnRegister.classList.add("inactive-btn");
      btnRegister.classList.remove("active-btn");
    }
    if (btnEnviar) btnEnviar.textContent = "Ingresar";
    if (clientesListado) {
      clientesListado.style.display = "none";
      clientesListado.innerHTML = "";
    }
    if (activarPanel) {
      activarPanel.style.display = "none";
    }
    toggleAdminControls(userRole, modo);
    toggleAdminFields(userRole, modo);
    toggleUserInfo(userRole, currentUser);
  };

  // Inicializar visibilidad
  toggleAdminControls(userRole, modo);
  toggleAdminFields(userRole, modo);
  toggleUserInfo(userRole, currentUser);

  // Inicializar autenticación
  const authHandler = initAuthEvents({
    btnLogin,
    btnRegister,
    btnEnviar,
    membresiaSelect,
    showMessage,
    onModoChange: (newModo) => {
      modo = newModo;
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    },
    onAuthSuccess: (usuario) => {
      currentUser = usuario;
      userRole = usuario.rol;
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    },
    onAuthFailure: () => {
      userRole = null;
      currentUser = null;
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    }
  });

  // Inicializar administración
  initBorrarCliente({ btnBorrar, showMessage });
  initCerrarSesion({ btnLogout, onLogout: resetToLogin });

  // Inicializar membresía y lista de clientes
  initActivarMembresia({
    btnActivarMembresia,
    btnConfirmarActivar,
    activarPanel,
    activarUsuario,
    activarDias,
    showMessage
  });

  initListaClientes({ btnLista, clientesListado, showMessage });
});
