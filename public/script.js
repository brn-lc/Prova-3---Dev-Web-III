document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "/api/reservas";

  // Elementos do formulário
  const form = document.getElementById("reserva-form");
  const reservaIdInput = document.getElementById("reserva-id");
  const nomeClienteInput = document.getElementById("nomeCliente");
  const contatoClienteInput = document.getElementById("contatoCliente");
  const numeroMesaInput = document.getElementById("numeroMesa");
  const dataReservaInput = document.getElementById("dataReserva");
  const statusInput = document.getElementById("status");
  const formButtonText = document.getElementById("form-button-text");
  const clearFormBtn = document.getElementById("clear-form-btn");

  // Elementos da lista e filtros
  const listaReservas = document.getElementById("lista-reservas");
  const filtroClienteInput = document.getElementById("filtro-cliente");
  const filtroMesaInput = document.getElementById("filtro-mesa");
  const semReservasMsg = document.getElementById("sem-reservas");

  // Mapa de mesas
  const mapaMesas = document.getElementById("mapa-mesas");
  const TOTAL_MESAS = 20; // Defina o número total de mesas do restaurante

  // Notificação
  const notification = document.getElementById("notification");

  // --- FUNÇÕES DE LÓGICA ---

  // Exibe notificação
  const showNotification = (message, type = "success") => {
    notification.textContent = message;
    notification.className = `bg-${type} show`;
    setTimeout(() => {
      notification.className = "";
    }, 3000);
  };

  // Formata a data para exibição
  const formatarData = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  // Formata a data para o input datetime-local
  const formatarDataParaInput = (dateString) => {
    if (!dateString) return "";
    const data = new Date(dateString);
    data.setMinutes(data.getMinutes() - data.getTimezoneOffset()); // Ajuste para o fuso horário local
    return data.toISOString().slice(0, 16);
  };

  // Limpar e resetar o formulário
  const resetForm = () => {
    form.reset();
    reservaIdInput.value = "";
    formButtonText.textContent = "Criar Reserva";
    statusInput.value = "reservado";
  };

  // Preencher formulário para edição
  const preencherFormulario = (reserva) => {
    reservaIdInput.value = reserva._id;
    nomeClienteInput.value = reserva.nomeCliente;
    contatoClienteInput.value = reserva.contatoCliente;
    numeroMesaInput.value = reserva.numeroMesa;
    dataReservaInput.value = formatarDataParaInput(reserva.dataReserva);
    statusInput.value = reserva.status;
    formButtonText.textContent = "Atualizar Reserva";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Renderizar a lista de reservas
  const renderizarReservas = (reservas) => {
    listaReservas.innerHTML = "";
    if (reservas.length === 0) {
      semReservasMsg.classList.remove("hidden");
    } else {
      semReservasMsg.classList.add("hidden");
    }

    reservas.forEach((reserva) => {
      const statusClass = {
        disponível: "bg-green-100 text-green-800",
        reservado: "bg-orange-100 text-orange-800",
        ocupado: "bg-red-100 text-red-800",
      };

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${
                      reserva.nomeCliente
                    }</div>
                    <div class="text-sm text-gray-500">${
                      reserva.contatoCliente
                    }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">${
                  reserva.numeroMesa
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatarData(
                  reserva.dataReserva
                )}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusClass[reserva.status] || ""
                    }">
                        ${
                          reserva.status.charAt(0).toUpperCase() +
                          reserva.status.slice(1)
                        }
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 edit-btn" data-id="${
                      reserva._id
                    }"><i class="fa-solid fa-pencil"></i></button>
                    <button class="text-red-600 hover:text-red-900 ml-4 delete-btn" data-id="${
                      reserva._id
                    }"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
      listaReservas.appendChild(tr);

      // Adiciona listeners aos botões de editar e deletar da linha recém-criada
      tr.querySelector(".edit-btn").addEventListener("click", () =>
        preencherFormulario(reserva)
      );
      tr.querySelector(".delete-btn").addEventListener("click", () =>
        deletarReserva(reserva._id)
      );
    });
  };

  // Renderizar o mapa de mesas
  const renderizarMapaMesas = (statusMesas) => {
    mapaMesas.innerHTML = "";
    const mesasStatusMap = new Map(
      statusMesas.map((item) => [item._id, item.status])
    );

    for (let i = 1; i <= TOTAL_MESAS; i++) {
      const status = mesasStatusMap.get(i) || "disponível";
      const statusClass = {
        disponível: "mesa-disponivel",
        reservado: "mesa-reservado",
        ocupado: "mesa-ocupado",
      };

      const mesaDiv = document.createElement("div");
      mesaDiv.className = `mesa text-white text-center font-bold p-4 rounded-lg shadow-lg flex flex-col justify-center items-center ${statusClass[status]}`;
      mesaDiv.innerHTML = `<i class="fa-solid fa-utensils mb-1"></i>Mesa ${i}`;
      mesaDiv.title = `Status: ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`;
      mapaMesas.appendChild(mesaDiv);
    }
  };

  // --- FUNÇÕES DE API ---

  // Buscar todas as reservas (com filtros)
  const buscarReservas = async () => {
    try {
      const cliente = filtroClienteInput.value;
      const mesa = filtroMesaInput.value;
      let url = API_URL;

      const params = new URLSearchParams();
      if (cliente) params.append("cliente", cliente);
      if (mesa) params.append("mesa", mesa);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao buscar reservas.");
      const data = await response.json();
      renderizarReservas(data);
    } catch (error) {
      console.error("Erro:", error);
      showNotification(error.message, "error");
    }
  };

  // Buscar status das mesas para o mapa
  const buscarStatusMesas = async () => {
    try {
      const response = await fetch(`${API_URL}/status-mesas`);
      if (!response.ok) throw new Error("Falha ao buscar status das mesas.");
      const data = await response.json();
      renderizarMapaMesas(data);
    } catch (error) {
      console.error("Erro:", error);
      showNotification(error.message, "error");
    }
  };

  // Criar ou atualizar reserva
  const submeterFormulario = async (e) => {
    e.preventDefault();
    const id = reservaIdInput.value;

    const dadosReserva = {
      nomeCliente: nomeClienteInput.value,
      contatoCliente: contatoClienteInput.value,
      numeroMesa: parseInt(numeroMesaInput.value),
      dataReserva: dataReservaInput.value,
      status: statusInput.value,
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosReserva),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ocorreu um erro.");
      }

      showNotification(result.message, "success");
      resetForm();
      buscarReservas();
      buscarStatusMesas();
    } catch (error) {
      console.error("Erro:", error);
      showNotification(error.message, "error");
    }
  };

  // Deletar reserva
  const deletarReserva = async (id) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ocorreu um erro ao deletar.");
      }

      showNotification(result.message, "success");
      buscarReservas();
      buscarStatusMesas();
      resetForm(); // Limpa o formulário caso a reserva deletada estivesse em edição
    } catch (error) {
      console.error("Erro:", error);
      showNotification(error.message, "error");
    }
  };

  // --- LISTENERS DE EVENTOS ---

  // Submissão do formulário
  form.addEventListener("submit", submeterFormulario);

  // Limpar formulário
  clearFormBtn.addEventListener("click", resetForm);

  // Listeners para os filtros (com debounce para não fazer requisições a cada tecla)
  let debounceTimer;
  const handleFilterChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      buscarReservas();
    }, 500); // 500ms de delay
  };

  filtroClienteInput.addEventListener("input", handleFilterChange);
  filtroMesaInput.addEventListener("input", handleFilterChange);

  // --- INICIALIZAÇÃO ---
  const init = () => {
    buscarReservas();
    buscarStatusMesas();
  };

  init();
});
