import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  logo?: string; // Armazenado como base64 string
  tagline: string;
  buttonColor: string;
  whatsappNumber?: string;
}

const SettingsSchema: Schema = new Schema({
  logo: {
    type: String,
  },
  tagline: {
    type: String,
    required: true,
  },
  buttonColor: {
    type: String,
    required: true,
  },
  whatsappNumber: {
    type: String,
  },
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
