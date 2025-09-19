import React, { useState, useEffect } from "react";
import { Service } from "../../types";
import { api } from "../../utils/api";

type ServiceFormData = Omit<Service, "_id">;

const ServiceForm: React.FC<{
  service: Service | null;
  onSave: (serviceData: ServiceFormData, id?: string) => void;
  onCancel: () => void;
}> = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || "",
    duration: service?.duration || 30,
    price: service?.price || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Garante que valores numéricos sejam armazenados como números
    const parsedValue = name === "name" ? value : parseInt(value, 10) || 0;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, service?._id);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-dark p-6 rounded-lg mb-6 space-y-4"
    >
      <h2 className="text-xl font-bold text-brand-gold">
        {service ? "Editar Serviço" : "Adicionar Novo Serviço"}
      </h2>
      <input
        type="text"
        name="name"
        placeholder="Nome do Serviço"
        value={formData.name}
        onChange={handleChange}
        className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30"
        required
      />
      <div className="flex gap-4">
        <input
          type="number"
          name="duration"
          placeholder="Duração (min)"
          value={formData.duration}
          onChange={handleChange}
          className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Preço (R$)"
          value={formData.price}
          onChange={handleChange}
          className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30"
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-brand-gray/20 text-brand-gray font-bold py-2 px-4 rounded-md hover:bg-brand-gray/40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-md hover:bg-brand-light-gold"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api<Service[]>("/services");
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services", error);
      alert("Erro ao buscar serviços.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (
    serviceData: ServiceFormData,
    id?: string
  ) => {
    try {
      if (isAdding) {
        await api("/services", { method: "POST", body: serviceData });
      } else if (id) {
        await api(`/services/${id}`, { method: "PUT", body: serviceData });
      }
      await fetchServices(); // Re-fetch para atualizar a lista
    } catch (error) {
      console.error("Failed to save service", error);
      alert("Erro ao salvar serviço.");
    } finally {
      setEditingService(null);
      setIsAdding(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await api(`/services/${id}`, { method: "DELETE" });
        await fetchServices(); // Re-fetch para atualizar a lista
      } catch (error) {
        console.error("Failed to delete service", error);
        alert("Erro ao excluir serviço.");
      }
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-gold">
          Gerenciar Serviços
        </h1>
        {!isAdding && !editingService && (
          <button
            onClick={handleAddNew}
            className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-md hover:bg-brand-light-gold"
          >
            Adicionar Novo Serviço
          </button>
        )}
      </div>

      {(isAdding || editingService) && (
        <ServiceForm
          service={editingService}
          onSave={handleSaveService}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-brand-dark rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-light-dark">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Duração</th>
              <th className="p-4 font-semibold">Preço</th>
              <th className="p-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-brand-gray">
                  Carregando...
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr
                  key={service._id}
                  className="border-b border-brand-light-dark/50"
                >
                  <td className="p-4">{service.name}</td>
                  <td className="p-4">{service.duration} min</td>
                  <td className="p-4 text-brand-gold">
                    R$ {service.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setEditingService(service);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesPage;
