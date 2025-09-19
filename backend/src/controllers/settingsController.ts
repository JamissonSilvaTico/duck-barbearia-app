// FIX: Changed express import to use named imports for Request and Response to resolve type errors.
import { Request, Response } from "express";
import Settings, { ISettings } from "../models/Settings";

// @route   GET api/settings
// @desc    Obter as configurações da UI
// @access  Público
export const getSettings = async (req: Request, res: Response) => {
  try {
    // Só deve haver um documento de configurações
    let settings = await Settings.findOne();
    if (!settings) {
      // Se não existir, retorna valores padrão
      return res.json({
        logo: null,
        tagline:
          "Estilo, precisão e uma experiência única. Agende seu horário e redescubra seu visual.",
        buttonColor: "#d4af37",
        whatsappNumber: "",
      });
    }
    res.json(settings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

// @route   PUT api/settings
// @desc    Atualizar as configurações da UI
// @access  Privado (Admin)
export const updateSettings = async (req: Request, res: Response) => {
  const { logo, tagline, buttonColor, whatsappNumber } = req.body;

  const settingsFields: Partial<ISettings> = {};
  // Permitir que o logo seja nulo para remoção
  if (logo !== undefined) settingsFields.logo = logo;
  if (tagline) settingsFields.tagline = tagline;
  if (buttonColor) settingsFields.buttonColor = buttonColor;
  if (whatsappNumber !== undefined)
    settingsFields.whatsappNumber = whatsappNumber;

  try {
    // Usa findOneAndUpdate com upsert=true para criar o documento se ele não existir
    const updatedSettings = await Settings.findOneAndUpdate(
      {}, // Filtro vazio para pegar o único documento
      { $set: settingsFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updatedSettings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};
