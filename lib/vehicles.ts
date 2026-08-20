export const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  region: string;
  condition: string;
  fuel: string;
  transmission: string;
  badge: string;
  dealer: string;
  promoted?: boolean;
  verified?: boolean;
  sellerType: string;
  bodyType: string;
  image: string;
}

// Use just filenames - getImageUrl() will build the full URL
export const vehicles: Vehicle[] = [
  { 
    id: 1, make: "Toyota", model: "Land Cruiser Prado", variant: "TX-L 2.8D 4WD", 
    year: 2021, price: 118000000, mileage: 48200, region: "Dar es Salaam", 
    condition: "Foreign Used", fuel: "Diesel", transmission: "Automatic", 
    badge: "Great Price", dealer: "Safari Motors", promoted: true, verified: true, 
    sellerType: "Dealer", bodyType: "SUV", 
    image: "toyota-prado-2021.webp" 
  },
  { 
    id: 2, make: "Toyota", model: "Harrier", variant: "Premium Hybrid", 
    year: 2020, price: 67000000, mileage: 63800, region: "Arusha", 
    condition: "Foreign Used", fuel: "Hybrid", transmission: "Automatic", 
    badge: "Good Price", dealer: "Kili Auto House", verified: true, 
    sellerType: "Dealer", bodyType: "SUV", 
    image: "toyota-harrier-2020.webp" 
  },
  { 
    id: 3, make: "Mazda", model: "CX-5", variant: "2.5 AWD", 
    year: 2022, price: 76000000, mileage: 21800, region: "Dodoma", 
    condition: "Local Used", fuel: "Petrol", transmission: "Automatic", 
    badge: "Fair Price", dealer: "Private seller", sellerType: "Private", 
    bodyType: "SUV", 
    image: "mazda-cx5-2022.webp" 
  },
  { 
    id: 4, make: "Nissan", model: "X-Trail", variant: "Autech 4WD", 
    year: 2019, price: 49500000, mileage: 81700, region: "Mwanza", 
    condition: "Foreign Used", fuel: "Petrol", transmission: "Automatic", 
    badge: "Good Price", dealer: "Lake Zone Motors", verified: true, 
    sellerType: "Dealer", bodyType: "SUV", 
    image: "nissan-xtrail-2019.webp" 
  },
  { 
    id: 5, make: "Suzuki", model: "Jimny", variant: "GLX 4WD", 
    year: 2023, price: 83500000, mileage: 6900, region: "Dar es Salaam", 
    condition: "Brand New", fuel: "Petrol", transmission: "Automatic", 
    badge: "Great Price", dealer: "Safari Motors", verified: true, 
    sellerType: "Dealer", bodyType: "SUV", 
    image: "suzuki-jimny-2023.webp" 
  },
  { 
    id: 6, make: "Honda", model: "Fit", variant: "e:HEV Home", 
    year: 2021, price: 33500000, mileage: 42800, region: "Mbeya", 
    condition: "Reconditioned", fuel: "Hybrid", transmission: "Automatic", 
    badge: "Fair Price", dealer: "Private seller", sellerType: "Private", 
    bodyType: "Hatchback", 
    image: "honda-fit-2021.webp" 
  },
];

export const getVehicle = (id: number | string) => vehicles.find((vehicle) => vehicle.id === Number(id));

export const vehiclePath = (vehicle: Vehicle) =>
  `/car-for-sale/${slugify(vehicle.make)}/${slugify(vehicle.model)}/${slugify(vehicle.variant)}/${vehicle.id}`;
