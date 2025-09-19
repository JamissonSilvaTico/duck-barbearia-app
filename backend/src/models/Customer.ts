import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  instagram?: string;
}

const CustomerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Um cliente é único pelo telefone
  },
  instagram: {
    type: String,
  },
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
