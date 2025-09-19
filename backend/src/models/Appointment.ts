import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  customer: mongoose.Schema.Types.ObjectId;
  service: mongoose.Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
}

const AppointmentSchema: Schema = new Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
});

// Index para otimizar buscas por data
AppointmentSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
