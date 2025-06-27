import { Router } from "express";
import {
  criarReserva,
  listarReservas,
  atualizarReserva,
  excluirReserva,
  obterStatusMesas,
} from "../controllers/reservaController";

const router = Router();

// Rota para obter o status visual das mesas
router.get("/status-mesas", obterStatusMesas);

// Rotas CRUD
router.post("/", criarReserva);
router.get("/", listarReservas);
router.put("/:id", atualizarReserva);
router.delete("/:id", excluirReserva);

export default router;
