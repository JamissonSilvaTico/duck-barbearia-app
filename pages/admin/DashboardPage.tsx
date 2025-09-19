import React, { useState, useEffect, useMemo } from 'react';
import { PopulatedAppointment, Service } from '../../types';
import { api } from '../../utils/api';

const DashboardPage: React.FC = () => {
    const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filterService, setFilterService] = useState('all');
    const [filterDays, setFilterDays] = useState('30');
    const [filterMonth, setFilterMonth] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await api<Service[]>('/services');
                setServices(servicesData);
            } catch (error) {
                console.error("Failed to fetch services", error);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filterService !== 'all') params.append('serviceId', filterService);
                if (filterDays !== 'all') params.append('days', filterDays);
                if (filterMonth !== 'all') params.append('month', filterMonth);
                
                const appointmentsData = await api<PopulatedAppointment[]>(`/appointments?${params.toString()}`);
                setAppointments(appointmentsData);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [filterService, filterDays, filterMonth]);
    
    const handleDeleteAppointment = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.')) {
            try {
                await api(`/appointments/${id}`, { method: 'DELETE' });
                setAppointments(prev => prev.filter(app => app._id !== id));
            } catch (error) {
                console.error("Failed to delete appointment", error);
                alert('Não foi possível excluir o agendamento.');
            }
        }
    };

    const totalRevenue = useMemo(() => {
        return appointments.reduce((total, app) => total + (app.service?.price || 0), 0);
    }, [appointments]);
    
    const FilterButton: React.FC<{value: string, current: string, setter: (v:string)=>void, children: React.ReactNode}> = ({value, current, setter, children}) => (
        <button 
            onClick={() => setter(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${current === value ? 'bg-brand-gold text-brand-dark' : 'bg-brand-light-dark hover:bg-brand-gold/20'}`}
        >
            {children}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-gold mb-6">Agendamentos</h1>

            <div className="bg-brand-dark p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-sm font-medium text-brand-gray mb-2 block">Filtrar por Serviço</label>
                        <select onChange={(e) => setFilterService(e.target.value)} value={filterService} className="w-full bg-brand-light-dark p-2 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold">
                            <option value="all">Todos os Serviços</option>
                            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-brand-gray mb-2 block">Filtrar por Período</label>
                        <div className="flex space-x-2">
                           <FilterButton value="7" current={filterDays} setter={(v) => {setFilterDays(v); setFilterMonth('all');}}>7 dias</FilterButton>
                           <FilterButton value="15" current={filterDays} setter={(v) => {setFilterDays(v); setFilterMonth('all');}}>15 dias</FilterButton>
                           <FilterButton value="30" current={filterDays} setter={(v) => {setFilterDays(v); setFilterMonth('all');}}>30 dias</FilterButton>
                           <FilterButton value="all" current={filterDays} setter={(v) => setFilterDays(v)}>Todos</FilterButton>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-brand-gray mb-2 block">Filtrar por Mês</label>
                         <select onChange={(e) => {setFilterMonth(e.target.value); setFilterDays('all');}} value={filterMonth} className="w-full bg-brand-light-dark p-2 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold">
                            <option value="all">Todos os Meses</option>
                            {[...Array(12).keys()].map(i => <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="bg-brand-dark p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-brand-light-gray">Resumo Financeiro</h2>
                <p className="text-3xl font-bold text-brand-gold mt-2">R$ {totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-brand-gray">Total para o período e filtros selecionados.</p>
            </div>

            <div className="bg-brand-dark rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-light-dark">
                        <tr>
                            <th className="p-4 font-semibold">Cliente</th>
                            <th className="p-4 font-semibold">Serviço</th>
                            <th className="p-4 font-semibold">Data</th>
                            <th className="p-4 font-semibold">Valor</th>
                            <th className="p-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr>
                                <td colSpan={5} className="text-center p-8 text-brand-gray">Carregando agendamentos...</td>
                            </tr>
                        ) : appointments.length > 0 ? appointments.map(app => {
                             return (
                                <tr key={app._id} className="border-b border-brand-light-dark/50">
                                    <td className="p-4">{app.customer?.name || 'Cliente removido'}</td>
                                    <td className="p-4">{app.service?.name || 'Serviço removido'}</td>
                                    <td className="p-4">{new Date(app.startTime).toLocaleString('pt-BR')}</td>
                                    <td className="p-4 text-brand-gold">R$ {app.service?.price.toFixed(2) || 'N/A'}</td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleDeleteAppointment(app._id)}
                                            className="text-red-500 hover:text-red-400 font-medium transition"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                             )
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-brand-gray">Nenhum agendamento encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardPage;