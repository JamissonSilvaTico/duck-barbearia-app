import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Settings from '../models/Settings';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      // Lança um erro se a URI não estiver definida.
      // Isso informa ao TypeScript que a execução não continuará,
      // garantindo que 'mongoURI' é uma string na linha seguinte.
      throw new Error('ERRO: A variável de ambiente MONGODB_URI não está definida.');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB Conectado...');
  } catch (err: any) {
    console.error('Falha ao conectar ao MongoDB:', err.message);
    // Sai do processo com falha
    process.exit(1);
  }
};

export const seedAdminUser = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const password = process.env.DEFAULT_ADMIN_PASSWORD || 'comamor';
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            await new User({ password: passwordHash }).save();
            console.log('Usuário administrador padrão criado com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao semear usuário administrador:', error);
    }
};

export const seedInitialSettings = async () => {
    try {
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await new Settings({
                tagline: "Estilo, precisão e uma experiência única. Agende seu horário e redescubra seu visual.",
                buttonColor: "#d4af37",
            }).save();
            console.log('Configurações iniciais salvas com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao semear configurações iniciais:', error);
    }
}

export default connectDB;