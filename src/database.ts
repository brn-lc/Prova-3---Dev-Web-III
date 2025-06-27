import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // String de conexão do MongoDB. Altere para a sua se necessário.
    // O banco de dados 'reserva' será criado automaticamente se não existir.
    const mongoURI = "mongodb://localhost:27017/reserva";

    await mongoose.connect(mongoURI);

    console.log("MongoDB conectado com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    // Encerra o processo com falha
    process.exit(1);
  }
};

export default connectDB;
