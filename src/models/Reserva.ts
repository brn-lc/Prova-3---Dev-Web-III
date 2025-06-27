import mongoose, { Schema, Document } from "mongoose";

// Interface para tipagem forte com TypeScript
export interface IReserva extends Document {
  nomeCliente: string;
  numeroMesa: number;
  dataReserva: Date;
  status: "disponível" | "reservado" | "ocupado";
  contatoCliente: string;
}

// Schema do Mongoose
const ReservaSchema: Schema = new Schema(
  {
    nomeCliente: {
      type: String,
      required: [true, "O nome do cliente é obrigatório."],
      trim: true,
    },
    numeroMesa: {
      type: Number,
      required: [true, "O número da mesa é obrigatório."],
      min: [1, "O número da mesa deve ser no mínimo 1."],
    },
    dataReserva: {
      type: Date,
      required: [true, "A data e hora da reserva são obrigatórias."],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["disponível", "reservado", "ocupado"],
        message: "{VALUE} não é um status válido.",
      },
      default: "reservado",
    },
    contatoCliente: {
      type: String,
      required: [true, "O contato do cliente é obrigatório."],
    },
  },
  {
    timestamps: true, // Adiciona os campos createdAt e updatedAt
  }
);

// Cria e exporta o modelo
export default mongoose.model<IReserva>("Reserva", ReservaSchema);
