/**
 * Seeder - Populate DB with sample data for development
 * Run: node utils/seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const sampleUsers = [
  { name: 'Admin User', email: 'admin@eventhub.in', password: 'Admin@123', role: 'admin' },
  { name: 'Priya Sharma', email: 'organizer@eventhub.in', password: 'Test@123', role: 'organizer' },
  { name: 'Rahul Verma', email: 'attendee@eventhub.in', password: 'Test@123', role: 'attendee' },
  { name: 'Ananya Singh', email: 'ananya@test.com', password: 'Test@123', role: 'attendee' },
];

const sampleEvents = (organizerId) => [
  {
    organizer: organizerId,
    title: 'React & Next.js Masterclass 2025',
    description: 'A 2-day intensive bootcamp covering React 19, Next.js 15, Server Components, and real-world project building. Perfect for developers looking to upskill.',
    category: 'technology',
    date: new Date('2025-05-15T09:00:00'),
    endDate: new Date('2025-05-16T18:00:00'),
    location: { venue: 'ITC Maratha', city: 'Mumbai', state: 'Maharashtra', address: 'Sahar Road, Andheri East' },
    ticketsTotal: 80,
    ticketsSold: 24,
    price: 2499,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    tags: ['react', 'nextjs', 'javascript', 'webdev'],
    isFeatured: true,
    status: 'published',
  },
  {
    organizer: organizerId,
    title: 'Sunburn Festival — Pune 2025',
    description: 'Asia\'s biggest electronic dance music festival returns! Featuring international DJs, immersive light shows, food courts, and an unforgettable atmosphere.',
    category: 'music',
    date: new Date('2025-06-20T16:00:00'),
    endDate: new Date('2025-06-22T02:00:00'),
    location: { venue: 'Mahalunge Grounds', city: 'Pune', state: 'Maharashtra', address: 'Balewadi, Pune' },
    ticketsTotal: 5000,
    ticketsSold: 3200,
    price: 1999,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    tags: ['edm', 'music', 'festival', 'dance'],
    isFeatured: true,
    status: 'published',
  },
  {
    organizer: organizerId,
    title: 'Startup India Summit 2025',
    description: 'Connect with 200+ founders, investors, and VCs. Pitch competitions, mentorship sessions, panel discussions on AI, SaaS, and the Indian startup ecosystem.',
    category: 'business',
    date: new Date('2025-05-28T10:00:00'),
    location: { venue: 'Bharat Mandapam', city: 'New Delhi', state: 'Delhi', address: 'Pragati Maidan, New Delhi' },
    ticketsTotal: 500,
    ticketsSold: 312,
    price: 4999,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    tags: ['startup', 'business', 'networking', 'vc'],
    isFeatured: true,
    status: 'published',
  },
  {
    organizer: organizerId,
    title: 'Yoga & Wellness Retreat',
    description: 'A rejuvenating weekend retreat featuring morning yoga sessions, meditation workshops, Ayurvedic diet consultations, and nature walks in the Himalayan foothills.',
    category: 'health',
    date: new Date('2025-06-07T06:00:00'),
    location: { venue: 'Ananda Spa Resort', city: 'Rishikesh', state: 'Uttarakhand', address: 'Narendra Nagar, Tehri Garhwal' },
    ticketsTotal: 40,
    ticketsSold: 35,
    price: 8999,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    tags: ['yoga', 'wellness', 'retreat', 'meditation'],
    status: 'published',
  },
  {
    organizer: organizerId,
    title: 'IPL Watch Party — Finals Night',
    description: 'Watch the IPL Finals on a giant 40ft screen! Live commentary, cricket trivia contests, food stalls, and surprise celebrity appearances.',
    category: 'sports',
    date: new Date('2025-05-25T19:00:00'),
    location: { venue: 'Phoenix Palassio Rooftop', city: 'Bengaluru', state: 'Karnataka', address: 'Hebbal, Bengaluru' },
    ticketsTotal: 300,
    ticketsSold: 298,
    price: 0,
    isFree: true,
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    tags: ['cricket', 'ipl', 'sports', 'free'],
    status: 'published',
  },
  {
    organizer: organizerId,
    title: 'Contemporary Art Exhibition: "Bharat Darshan"',
    description: 'An immersive art exhibition showcasing 50 contemporary Indian artists. Oil paintings, digital art, sculptures, and installation art exploring modern Indian identity.',
    category: 'art',
    date: new Date('2025-05-10T11:00:00'),
    endDate: new Date('2025-05-20T19:00:00'),
    location: { venue: 'National Gallery of Modern Art', city: 'Mumbai', state: 'Maharashtra', address: 'MG Road, Fort' },
    ticketsTotal: 200,
    ticketsSold: 45,
    price: 299,
    image: 'https://images.unsplash.com/photo-1578926288207-a90a5366d6e2?w=800',
    tags: ['art', 'exhibition', 'culture', 'contemporary'],
    isFeatured: true,
    status: 'published',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Event.deleteMany(), Booking.deleteMany()]);
  console.log('Cleared existing data...');

  // Create users
  const users = await User.create(sampleUsers);
  console.log(`Created ${users.length} users`);

  // Create events using the organizer's ID
  const organizer = users.find(u => u.role === 'organizer');
  const events = await Event.create(sampleEvents(organizer._id));
  console.log(`Created ${events.length} events`);

  // Create sample bookings
  const attendee = users.find(u => u.role === 'attendee');
  await Booking.create([
    { user: attendee._id, event: events[0]._id, ticketsBooked: 2, totalAmount: 4998, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'stripe' },
    { user: attendee._id, event: events[2]._id, ticketsBooked: 1, totalAmount: 4999, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'stripe' },
    { user: attendee._id, event: events[4]._id, ticketsBooked: 3, totalAmount: 0, status: 'confirmed', paymentStatus: 'free', paymentMethod: 'free' },
  ]);
  console.log('Created sample bookings');

  console.log('\n✅ Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Test accounts:');
  console.log('  Admin:     admin@eventhub.in     / Admin@123');
  console.log('  Organizer: organizer@eventhub.in / Test@123');
  console.log('  Attendee:  attendee@eventhub.in  / Test@123');
  console.log('─────────────────────────────────\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
