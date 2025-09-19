import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  duration: number; // in minutes
  price: number;
}

const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export default mongoose.model<IService>('Service', ServiceSchema);
