export const CATEGORIES = {
  food: {
    label: 'Makanan & Minuman',
    icon: 'Utensils',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    type: 'expense'
  },
  transport: {
    label: 'Transportasi',
    icon: 'Car',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    type: 'expense'
  },
  shopping: {
    label: 'Belanja',
    icon: 'ShoppingBag',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    type: 'expense'
  },
  entertainment: {
    label: 'Hiburan',
    icon: 'Gamepad2',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400',
    type: 'expense'
  },
  bills: {
    label: 'Tagihan & Langganan',
    icon: 'Receipt',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    type: 'expense'
  },
  salary: {
    label: 'Gaji Bulanan',
    icon: 'Wallet',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    type: 'income'
  },
  freelance: {
    label: 'Proyek Sampingan',
    icon: 'Briefcase',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    type: 'income'
  },
  gift: {
    label: 'Bonus / Hadiah',
    icon: 'Gift',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    type: 'income'
  },
  other: {
    label: 'Lainnya',
    icon: 'CircleDollarSign',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    type: 'all'
  }
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    title: 'Kopi Susu Gula Aren',
    category: 'food',
    type: 'expense',
    amount: 22000,
    time: '14:30 WIB',
    date: '2026-08-30',
    dateLabel: 'Hari Ini'
  },
  {
    id: 'tx-2',
    title: 'Makan Siang Nasi Padang',
    category: 'food',
    type: 'expense',
    amount: 35000,
    time: '12:15 WIB',
    date: '2026-08-30',
    dateLabel: 'Hari Ini'
  },
  {
    id: 'tx-3',
    title: 'Gojek ke Kantor',
    category: 'transport',
    type: 'expense',
    amount: 18000,
    time: '08:45 WIB',
    date: '2026-08-30',
    dateLabel: 'Hari Ini'
  },
  {
    id: 'tx-4',
    title: 'Transfer Klien Desain UI',
    category: 'freelance',
    type: 'income',
    amount: 750000,
    time: '19:20 WIB',
    date: '2026-08-29',
    dateLabel: 'Kemarin'
  },
  {
    id: 'tx-5',
    title: 'Belanja Bulanan Supermarket',
    category: 'shopping',
    type: 'expense',
    amount: 145000,
    time: '16:00 WIB',
    date: '2026-08-29',
    dateLabel: 'Kemarin'
  },
  {
    id: 'tx-6',
    title: 'Langganan Spotify Family',
    category: 'bills',
    type: 'expense',
    amount: 55000,
    time: '10:00 WIB',
    date: '2026-08-28',
    dateLabel: '28 Agustus 2026'
  },
  {
    id: 'tx-7',
    title: 'Gaji Pokok Awal Bulan',
    category: 'salary',
    type: 'income',
    amount: 2500000,
    time: '09:00 WIB',
    date: '2026-08-01',
    dateLabel: '1 Agustus 2026'
  },
  {
    id: 'tx-8',
    title: 'Sewa Kost & Listrik',
    category: 'bills',
    type: 'expense',
    amount: 1475000,
    time: '10:30 WIB',
    date: '2026-08-02',
    dateLabel: '2 Agustus 2026'
  }
];

export const USER_INFO = {
  name: 'Rizko',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};
