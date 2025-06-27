import { Request, Response } from "express";
import Reserva, { IReserva } from "../models/reserva";

// --- Criar uma nova reserva ---
export const criarReserva = async (req: Request, res: Response) => {
  try {
    const novaReserva = new Reserva(req.body);
    await novaReserva.save();
    res
      .status(201)
      .json({ message: "Reserva criada com sucesso!", reserva: novaReserva });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Erro ao criar reserva.", error: error.message });
  }
};

// --- Listar todas as reservas ---
export const listarReservas = async (req: Request, res: Response) => {
  try {
    const { cliente, mesa } = req.query;
    let filtro = {};

    if (cliente) {
      filtro = { nomeCliente: new RegExp(cliente as string, "i") };
    } else if (mesa) {
      filtro = { numeroMesa: Number(mesa) };
    }

    const reservas = await Reserva.find(filtro).sort({ dataReserva: -1 });
    res.status(200).json(reservas);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao buscar reservas.", error: error.message });
  }
};

// --- Obter status das mesas ---
export const obterStatusMesas = async (req: Request, res: Response) => {
  try {
    // Encontra a reserva mais recente para cada mesa para determinar seu status atual
    const statusMesas = await Reserva.aggregate([
      { $sort: { dataReserva: -1 } },
      {
        $group: {
          _id: "$numeroMesa",
          status: { $first: "$status" },
          nomeCliente: { $first: "$nomeCliente" },
          dataReserva: { $first: "$dataReserva" },
          reservaId: { $first: "$_id" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(statusMesas);
  } catch (error: any) {
    res.status(500).json({
      message: "Erro ao buscar status das mesas.",
      error: error.message,
    });
  }
};

// --- Atualizar uma reserva ---
export const atualizarReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservaAtualizada = await Reserva.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reservaAtualizada) {
      return res.status(404).json({ message: "Reserva não encontrada." });
    }
    res.status(200).json({
      message: "Reserva atualizada com sucesso!",
      reserva: reservaAtualizada,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Erro ao atualizar reserva.", error: error.message });
  }
};

// --- Excluir uma reserva ---
export const excluirReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservaExcluida = await Reserva.findByIdAndDelete(id);
    if (!reservaExcluida) {
      return res.status(404).json({ message: "Reserva não encontrada." });
    }
    res.status(200).json({ message: "Reserva cancelada com sucesso!" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao excluir reserva.", error: error.message });
  }
};
