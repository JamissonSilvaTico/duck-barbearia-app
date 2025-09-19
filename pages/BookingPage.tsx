import React, { useState, useEffect, useCallback } from 'react';
import { Service, Customer } from '../types';
import { CalendarIcon, ClockIcon, ScissorsIcon, UserIcon } from '../components/icons';
import { api } from '../utils/api';

const BookingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', instagram: '' });
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await api<Service[]>('/services');
                setServices(data);
            } catch (error) {
                console.error("Failed to fetch services", error);
                setError("Não foi possível carregar os serviços. Tente novamente mais tarde.");
            }
        };
        fetchServices();
    }, []);

    const fetchAvailability = useCallback(async () => {
        if (!selectedDate || !selectedService) return;
        
        setIsLoadingSlots(true);
        setAvailableTimeSlots([]);
        setSelectedTime(null);

        try {
            // Formata a data como YYYY-MM-DD
            const dateString = selectedDate.toISOString().split('T')[0];
            const slots = await api<string[]>(`/appointments/availability?date=${dateString}&serviceId=${selectedService._id}`);
            setAvailableTimeSlots(slots);
        } catch (error) {
            console.error("Failed to fetch availability", error);
            setError("Não foi possível buscar os horários. Tente outra data.");
        } finally {
            setIsLoadingSlots(false);
        }
    }, [selectedDate, selectedService]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const isCustomerFormValid = customer.name.trim() !== '' && customer.phone.trim() !== '';

    const submitBooking = async () => {
        if (!customer || !selectedService || !selectedDate || !selectedTime) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);

        try {
            await api('/appointments', {
                method: 'POST',
                body: {
                    customer,
                    serviceId: selectedService._id,
                    startTime: startTime.toISOString(),
                }
            });
            alert(`Agendamento confirmado!\n\nCliente: ${customer.name}\nServiço: ${selectedService.name}\nData: ${selectedDate.toLocaleDateString('pt-BR')}\nHora: ${selectedTime}`);
            window.location.hash = '#/';
        } catch (error: any) {
            alert(`Erro ao confirmar agendamento: ${error.message}`);
        }
    }

    return (
        <div className="min-h-screen bg-brand-light-dark flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-brand-dark rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side / Info */}
                <div className="w-full md:w-1/3 bg-brand-light-dark p-8 text-white flex flex-col">
                     <h2 className="text-3xl font-bold text-brand-gold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Seu Agendamento</h2>
                    <div className="space-y-4 mt-4 text-brand-gray flex-grow">
                        <div className={`flex items-center space-x-3 ${step >= 1 ? 'text-brand-gold' : ''}`}>
                            <UserIcon className="w-5 h-5" />
                            <span>{customer.name || 'Seus Dados'}</span>
                        </div>
                         <div className={`flex items-center space-x-3 ${step >= 2 ? 'text-brand-gold' : ''}`}>
                            <ScissorsIcon className="w-5 h-5" />
                            <span>{selectedService?.name || 'Serviço'}</span>
                        </div>
                         <div className={`flex items-center space-x-3 ${step >= 3 ? 'text-brand-gold' : ''}`}>
                            <CalendarIcon className="w-5 h-5" />
                            <span>{selectedDate?.toLocaleDateString('pt-BR') || 'Data'}</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${step >= 3 && selectedTime ? 'text-brand-gold' : ''}`}>
                            <ClockIcon className="w-5 h-5" />
                            <span>{selectedTime || 'Horário'}</span>
                        </div>
                    </div>
                    {selectedService && (
                        <div className="mt-auto border-t border-brand-gold/20 pt-4">
                            <div className="flex justify-between text-lg">
                                <span>Total:</span>
                                <span className="font-bold text-brand-gold">R$ {selectedService.price.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side / Form */}
                <div className="w-full md:w-2/3 p-8">
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {/* Step 1: Customer Info */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center"><UserIcon className="w-6 h-6 mr-2 text-brand-gold"/> 1. Seus Dados</h3>
                            <div className="space-y-4">
                                <input type="text" name="name" placeholder="Nome Completo *" value={customer.name} onChange={handleCustomerChange} className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                                <input type="tel" name="phone" placeholder="Telefone *" value={customer.phone} onChange={handleCustomerChange} className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                                <input type="text" name="instagram" placeholder="@instagram (opcional)" value={customer.instagram} onChange={handleCustomerChange} className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                            </div>
                            <button onClick={() => setStep(2)} disabled={!isCustomerFormValid} className="mt-8 w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-md hover:bg-brand-light-gold transition disabled:bg-gray-500 disabled:cursor-not-allowed">Próximo</button>
                        </div>
                    )}

                    {/* Step 2: Select Service */}
                    {step === 2 && (
                         <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center"><ScissorsIcon className="w-6 h-6 mr-2 text-brand-gold"/> 2. Escolha o Serviço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                               {services.map(service => (
                                   <button key={service._id} onClick={() => { setSelectedService(service); setStep(3); }} className={`p-4 rounded-lg text-left border-2 transition ${selectedService?._id === service._id ? 'bg-brand-gold/20 border-brand-gold' : 'bg-brand-light-dark border-brand-gold/30 hover:border-brand-gold'}`}>
                                       <h4 className="font-bold">{service.name}</h4>
                                       <p className="text-sm text-brand-gray">{service.duration} min - R$ {service.price.toFixed(2)}</p>
                                   </button>
                               ))}
                            </div>
                             <button onClick={() => setStep(1)} className="mt-8 w-full bg-brand-gray/20 text-brand-gray font-bold py-3 rounded-md hover:bg-brand-gray/40 transition">Voltar</button>
                        </div>
                    )}
                    
                    {/* Step 3: Select Date & Time */}
                    {step === 3 && (
                        <div>
                             <h3 className="text-2xl font-bold mb-6 flex items-center"><CalendarIcon className="w-6 h-6 mr-2 text-brand-gold"/> 3. Escolha Data e Hora</h3>
                             <input 
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))} // Avoid timezone issues
                                className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold mb-4"
                             />
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                                 {isLoadingSlots ? <p className="col-span-full text-center">Buscando horários...</p> : 
                                 availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                                     <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 rounded-md border-2 transition ${selectedTime === time ? 'bg-brand-gold text-brand-dark font-bold' : 'bg-brand-light-dark border-brand-gold/30 hover:border-brand-gold'}`}>
                                         {time}
                                     </button>
                                 )) : <p className="col-span-full text-center text-brand-gray">Nenhum horário disponível para este dia.</p>}
                             </div>
                              <div className="flex gap-4 mt-8">
                                <button onClick={() => { setSelectedTime(null); setStep(2); }} className="w-full bg-brand-gray/20 text-brand-gray font-bold py-3 rounded-md hover:bg-brand-gray/40 transition">Voltar</button>
                                <button onClick={submitBooking} disabled={!selectedTime} className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-md hover:bg-brand-light-gold transition disabled:bg-gray-500 disabled:cursor-not-allowed">Confirmar Agendamento</button>
                              </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
