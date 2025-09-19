import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  password: string;
}

const UserSchema: Schema = new Schema({
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IUser>('User', UserSchema);
