// FIX: Changed type-only import to a regular import for Express types.
import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import Customer from "../models/Customer";
import Service from "../models/Service";
import mongoose from "mongoose";

// @route   POST api/appointments
// @desc    Criar um novo agendamento
// @access  Público
export const createAppointment = async (req: Request, res: Response) => {
  const { customer, serviceId, startTime } = req.body;

  if (
    !customer ||
    !customer.name ||
    !customer.phone ||
    !serviceId ||
    !startTime
  ) {
    return res
      .status(400)
      .json({ msg: "Por favor, forneça todos os campos obrigatórios." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Encontrar o serviço para obter a duração
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Serviço não encontrado" });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    // 2. Verificar se o horário já está ocupado
    const existingAppointment = await Appointment.findOne({
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
      ],
    }).session(session);

    if (existingAppointment) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ msg: "Este horário não está mais disponível." });
    }

    // 3. Encontrar ou criar o cliente
    let customerDoc = await Customer.findOneAndUpdate(
      { phone: customer.phone },
      { name: customer.name, instagram: customer.instagram },
      { new: true, upsert: true, session: session }
    );

    // 4. Criar o agendamento
    const newAppointment = new Appointment({
      customer: customerDoc._id,
      service: serviceId,
      startTime: start,
      endTime: end,
    });

    await newAppointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(newAppointment);
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

// @route   GET api/appointments
// @desc    Obter todos os agendamentos (para admin)
// @access  Privado (Admin)
export const getAppointments = async (req: Request, res: Response) => {
  try {
    // Lógica de filtro (simplificada, pode ser expandida)
    const { serviceId, days, month } = req.query;
    const filter: any = {};

    if (serviceId && serviceId !== "all") {
      filter.service = serviceId;
    }

    const now = new Date();
    if (days) {
      const startDate = new Date();
      startDate.setDate(now.getDate() - parseInt(days as string));
      filter.startTime = { $gte: startDate };
    }

    if (month && month !== "all") {
      const year = now.getFullYear();
      const monthIndex = parseInt(month as string);
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);
      filter.startTime = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate("customer", "name phone")
      .populate("service", "name price")
      .sort({ startTime: -1 });

    res.json(appointments);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

// @route   GET api/appointments/availability
// @desc    Obter horários disponíveis
// @access  Público
export const getAvailability = async (req: Request, res: Response) => {
  const { date, serviceId } = req.query;

  if (!date || !serviceId) {
    return res.status(400).json({ msg: "Data e serviço são obrigatórios." });
  }

  try {
    const service = await Service.findById(serviceId as string);
    if (!service) {
      return res.status(404).json({ msg: "Serviço não encontrado" });
    }

    const serviceDuration = service.duration;
    const requestedDate = new Date(date as string);

    const startOfDay = new Date(requestedDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setUTCHours(23, 59, 59, 999));

    const existingAppointments = await Appointment.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    const openingTime = 9 * 60; // 9:00 AM em minutos
    const closingTime = 18 * 60; // 6:00 PM em minutos
    const interval = 15; // Verificar a cada 15 minutos

    const availableSlots: string[] = [];

    for (
      let t = openingTime;
      t <= closingTime - serviceDuration;
      t += interval
    ) {
      const slotStart = new Date(startOfDay);
      slotStart.setMinutes(t);

      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

      const isOverlapping = existingAppointments.some(
        (appt) => slotStart < appt.endTime && slotEnd > appt.startTime
      );

      if (!isOverlapping) {
        availableSlots.push(
          slotStart.toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    }

    res.json(availableSlots);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

// @route   DELETE api/appointments/:id
// @desc    Deletar um agendamento
// @access  Privado (Admin)
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: "Agendamento não encontrado" });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ msg: "Agendamento removido com sucesso" });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Agendamento não encontrado" });
    }
    res.status(500).send("Erro no servidor");
  }
};
