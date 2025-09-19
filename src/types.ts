export interface Service {
  _id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Customer {
  _id?: string;
  name: string;
  phone: string;
  instagram?: string;
}

// Interface para um agendamento retornado pela API (com campos populados)
export interface PopulatedAppointment {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
  };
  service: {
    _id: string;
    name: string;
    price: number;
  };
  startTime: string; // A API retornará a data como string ISO
  endTime: string;
}

// Interface para criar um novo agendamento
export interface NewAppointment {
    customer: Customer;
    serviceId: string;
    startTime: Date;
}
