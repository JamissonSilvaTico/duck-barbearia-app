

// FIX: Use namespace import for express to ensure correct type resolution.
import * as express from 'express';
import Service, { IService } from '../models/Service';

// @route   GET api/services
// @desc    Obter todos os serviços
// @access  Público
export const getServices = async (req: express.Request, res: express.Response) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @route   POST api/services
// @desc    Criar um novo serviço
// @access  Privado (Admin)
export const createService = async (req: express.Request, res: express.Response) => {
  const { name, duration, price } = req.body;

  try {
    const newService = new Service({
      name,
      duration,
      price,
    });

    const service = await newService.save();
    res.json(service);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @route   PUT api/services/:id
// @desc    Atualizar um serviço
// @access  Privado (Admin)
export const updateService = async (req: express.Request, res: express.Response) => {
  const { name, duration, price } = req.body;

  const serviceFields: Partial<IService> = {};
  if (name) serviceFields.name = name;
  if (duration) serviceFields.duration = duration;
  if (price) serviceFields.price = price;

  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: 'Serviço não encontrado' });

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: serviceFields },
      { new: true }
    );
    res.json(service);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @route   DELETE api/services/:id
// @desc    Deletar um serviço
// @access  Privado (Admin)
export const deleteService = async (req: express.Request, res: express.Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: 'Serviço não encontrado' });

    await Service.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Serviço removido' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};