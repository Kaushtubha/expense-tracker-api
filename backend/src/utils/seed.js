require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

const seedData = async (shouldDisconnect = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_tracker';
      console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
      await mongoose.connect(mongoUri);
    }

    console.log('[Seed] Cleaning existing users and complaints...');
    await Promise.all([User.deleteMany({}), Complaint.deleteMany({})]);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. R.K. Verma (Chief Warden)',
      email: 'warden@hostel.edu',
      password: 'Password123!',
      role: 'admin',
      phone: '9811002233',
    });

    // 2. Create 3 Staff Members
    const [electrician, plumber, carpenter] = await Promise.all([
      User.create({
        name: 'Suresh Kumar (Electrician)',
        email: 'electrician@hostel.edu',
        password: 'Password123!',
        role: 'staff',
        phone: '9822003344',
      }),
      User.create({
        name: 'Ramesh Patel (Plumber)',
        email: 'plumber@hostel.edu',
        password: 'Password123!',
        role: 'staff',
        phone: '9833004455',
      }),
      User.create({
        name: 'Mahesh Sharma (Carpenter)',
        email: 'carpenter@hostel.edu',
        password: 'Password123!',
        role: 'staff',
        phone: '9844005566',
      }),
    ]);

    // 3. Create 5 Students
    const students = await Promise.all([
      User.create({
        name: 'Aarav Patel',
        email: 'student1@hostel.edu',
        password: 'Password123!',
        role: 'student',
        roomNumber: 'A-101',
        phone: '9855001122',
      }),
      User.create({
        name: 'Ananya Iyer',
        email: 'student2@hostel.edu',
        password: 'Password123!',
        role: 'student',
        roomNumber: 'A-102',
        phone: '9855002233',
      }),
      User.create({
        name: 'Rohan Gupta',
        email: 'student3@hostel.edu',
        password: 'Password123!',
        role: 'student',
        roomNumber: 'B-201',
        phone: '9855003344',
      }),
      User.create({
        name: 'Pooja Nair',
        email: 'student4@hostel.edu',
        password: 'Password123!',
        role: 'student',
        roomNumber: 'B-202',
        phone: '9855004455',
      }),
      User.create({
        name: 'Vikram Singh',
        email: 'student5@hostel.edu',
        password: 'Password123!',
        role: 'student',
        roomNumber: 'C-301',
        phone: '9855005566',
      }),
    ]);

    console.log('[Seed] Created 1 Admin, 3 Staff, and 5 Students.');

    // Helper date generator
    const now = Date.now();
    const hoursAgo = (h) => new Date(now - h * 3600 * 1000);

    // 4. Create 20 Realistic Sample Complaints
    const complaintsData = [
      // Water issues
      {
        title: 'Geyser not heating water in bathroom',
        description: 'The bathroom water heater switch turns red but water stays completely freezing cold.',
        category: 'water',
        priority: 'high',
        status: 'Open',
        student: students[0]._id,
        roomNumber: 'A-101',
        createdAt: hoursAgo(4),
        statusHistory: [
          { status: 'Open', changedBy: students[0]._id, note: 'Registered by student', timestamp: hoursAgo(4) },
        ],
      },
      {
        title: 'Bathroom tap leaking continuously',
        description: 'Cold water tap drips heavily causing water accumulation on floor.',
        category: 'water',
        priority: 'medium',
        status: 'In Progress',
        student: students[1]._id,
        roomNumber: 'A-102',
        assignedTo: plumber._id,
        createdAt: hoursAgo(18),
        statusHistory: [
          { status: 'Open', changedBy: students[1]._id, note: 'Registered by student', timestamp: hoursAgo(18) },
          { status: 'In Progress', changedBy: admin._id, note: 'Assigned to Ramesh Patel (Plumber)', timestamp: hoursAgo(12) },
        ],
      },
      {
        title: 'Washbasin drainage blocked completely',
        description: 'Water overflows whenever the tap is turned on for more than 10 seconds.',
        category: 'water',
        priority: 'urgent',
        status: 'Resolved',
        student: students[2]._id,
        roomNumber: 'B-201',
        assignedTo: plumber._id,
        createdAt: hoursAgo(48),
        resolvedAt: hoursAgo(24),
        statusHistory: [
          { status: 'Open', changedBy: students[2]._id, note: 'Registered by student', timestamp: hoursAgo(48) },
          { status: 'In Progress', changedBy: admin._id, note: 'Assigned to plumber', timestamp: hoursAgo(40) },
          { status: 'Resolved', changedBy: plumber._id, note: 'Cleaned pipe trap and unclogged sand', timestamp: hoursAgo(24) },
        ],
      },
      {
        title: 'Flush tank button stuck in pressed state',
        description: 'Water running continuously into toilet bowl.',
        category: 'water',
        priority: 'medium',
        status: 'Closed',
        student: students[3]._id,
        roomNumber: 'B-202',
        assignedTo: plumber._id,
        createdAt: hoursAgo(72),
        resolvedAt: hoursAgo(50),
        closedAt: hoursAgo(48),
        statusHistory: [
          { status: 'Open', changedBy: students[3]._id, note: 'Registered', timestamp: hoursAgo(72) },
          { status: 'In Progress', changedBy: admin._id, note: 'Assigned', timestamp: hoursAgo(65) },
          { status: 'Resolved', changedBy: plumber._id, note: 'Replaced siphon assembly', timestamp: hoursAgo(50) },
          { status: 'Closed', changedBy: admin._id, note: 'Verified by warden', timestamp: hoursAgo(48) },
        ],
      },

      // Electricity issues
      {
        title: 'Ceiling fan makes loud grinding noise on speed 3',
        description: 'Fan shakes and makes squeaking metallic sound disturbing sleep.',
        category: 'electricity',
        priority: 'medium',
        status: 'Open',
        student: students[4]._id,
        roomNumber: 'C-301',
        createdAt: hoursAgo(6),
        statusHistory: [
          { status: 'Open', changedBy: students[4]._id, note: 'Registered', timestamp: hoursAgo(6) },
        ],
      },
      {
        title: 'Study table power socket sparked and tripped breaker',
        description: 'Plugged in laptop adapter and socket gave a spark. Power cut off.',
        category: 'electricity',
        priority: 'urgent',
        status: 'In Progress',
        student: students[0]._id,
        roomNumber: 'A-101',
        assignedTo: electrician._id,
        createdAt: hoursAgo(10),
        statusHistory: [
          { status: 'Open', changedBy: students[0]._id, note: 'Registered', timestamp: hoursAgo(10) },
          { status: 'In Progress', changedBy: electrician._id, note: 'Checking short circuit in panel', timestamp: hoursAgo(8) },
        ],
      },
      {
        title: 'Tube light flickering violently in room',
        description: 'Starter or choke is malfunctioning. Unusable for studying at night.',
        category: 'electricity',
        priority: 'high',
        status: 'Resolved',
        student: students[1]._id,
        roomNumber: 'A-102',
        assignedTo: electrician._id,
        createdAt: hoursAgo(36),
        resolvedAt: hoursAgo(12),
        statusHistory: [
          { status: 'Open', changedBy: students[1]._id, note: 'Registered', timestamp: hoursAgo(36) },
          { status: 'In Progress', changedBy: admin._id, note: 'Assigned to electrician', timestamp: hoursAgo(20) },
          { status: 'Resolved', changedBy: electrician._id, note: 'Replaced LED tube light unit', timestamp: hoursAgo(12) },
        ],
      },
      {
        title: 'Exhaust fan in washroom not spinning',
        description: 'Switch turns on but motor is silent.',
        category: 'electricity',
        priority: 'low',
        status: 'Open',
        student: students[2]._id,
        roomNumber: 'B-201',
        createdAt: hoursAgo(8),
        statusHistory: [
          { status: 'Open', changedBy: students[2]._id, note: 'Registered', timestamp: hoursAgo(8) },
        ],
      },

      // Wi-Fi issues
      {
        title: 'Wi-Fi access point in corridor 2nd floor disconnected',
        description: 'Hostel_WiFi_2F SSID is invisible. Students cannot connect for online exams.',
        category: 'wifi',
        priority: 'urgent',
        status: 'In Progress',
        student: students[2]._id,
        roomNumber: 'B-201',
        assignedTo: electrician._id,
        createdAt: hoursAgo(14),
        statusHistory: [
          { status: 'Open', changedBy: students[2]._id, note: 'Registered', timestamp: hoursAgo(14) },
          { status: 'In Progress', changedBy: admin._id, note: 'Contacting campus network admin', timestamp: hoursAgo(10) },
        ],
      },
      {
        title: 'Extremely high latency and ping spikes on 5GHz',
        description: 'Ping to google.com is over 800ms between 8 PM and 11 PM.',
        category: 'wifi',
        priority: 'low',
        status: 'Open',
        student: students[3]._id,
        roomNumber: 'B-202',
        createdAt: hoursAgo(2),
        statusHistory: [
          { status: 'Open', changedBy: students[3]._id, note: 'Registered', timestamp: hoursAgo(2) },
        ],
      },
      {
        title: 'Captive portal login page failing with SSL error',
        description: 'Cannot authenticate credentials through hostel gateway.',
        category: 'wifi',
        priority: 'high',
        status: 'Resolved',
        student: students[4]._id,
        roomNumber: 'C-301',
        assignedTo: electrician._id,
        createdAt: hoursAgo(55),
        resolvedAt: hoursAgo(45),
        statusHistory: [
          { status: 'Open', changedBy: students[4]._id, note: 'Registered', timestamp: hoursAgo(55) },
          { status: 'Resolved', changedBy: admin._id, note: 'Flushed captive portal DNS cache', timestamp: hoursAgo(45) },
        ],
      },

      // Furniture issues
      {
        title: 'Study table drawer handle broken and stuck',
        description: 'Slider mechanism jammed with books inside.',
        category: 'furniture',
        priority: 'low',
        status: 'Open',
        student: students[0]._id,
        roomNumber: 'A-101',
        createdAt: hoursAgo(24),
        statusHistory: [
          { status: 'Open', changedBy: students[0]._id, note: 'Registered', timestamp: hoursAgo(24) },
        ],
      },
      {
        title: 'Bed wooden plank cracked in middle',
        description: 'Mattress sagging due to split center plank.',
        category: 'furniture',
        priority: 'high',
        status: 'In Progress',
        student: students[1]._id,
        roomNumber: 'A-102',
        assignedTo: carpenter._id,
        createdAt: hoursAgo(30),
        statusHistory: [
          { status: 'Open', changedBy: students[1]._id, note: 'Registered', timestamp: hoursAgo(30) },
          { status: 'In Progress', changedBy: carpenter._id, note: 'Ordering wooden support beam', timestamp: hoursAgo(15) },
        ],
      },
      {
        title: 'Wardrobe door hinges came loose from frame',
        description: 'Wardrobe door is hanging on one hinge and may fall.',
        category: 'furniture',
        priority: 'medium',
        status: 'Resolved',
        student: students[3]._id,
        roomNumber: 'B-202',
        assignedTo: carpenter._id,
        createdAt: hoursAgo(60),
        resolvedAt: hoursAgo(35),
        statusHistory: [
          { status: 'Open', changedBy: students[3]._id, note: 'Registered', timestamp: hoursAgo(60) },
          { status: 'Resolved', changedBy: carpenter._id, note: 'Realigned door and installed heavy-duty hinges', timestamp: hoursAgo(35) },
        ],
      },
      {
        title: 'Balcony door latch broken cannot lock',
        description: 'Wind blows door open during rain.',
        category: 'furniture',
        priority: 'urgent',
        status: 'Closed',
        student: students[4]._id,
        roomNumber: 'C-301',
        assignedTo: carpenter._id,
        createdAt: hoursAgo(90),
        resolvedAt: hoursAgo(75),
        closedAt: hoursAgo(70),
        statusHistory: [
          { status: 'Open', changedBy: students[4]._id, note: 'Registered', timestamp: hoursAgo(90) },
          { status: 'In Progress', changedBy: admin._id, note: 'Assigned', timestamp: hoursAgo(85) },
          { status: 'Resolved', changedBy: carpenter._id, note: 'Installed deadbolt latch', timestamp: hoursAgo(75) },
          { status: 'Closed', changedBy: admin._id, note: 'Completed', timestamp: hoursAgo(70) },
        ],
      },

      // Cleanliness issues
      {
        title: 'Corridor dustbin overflowing with food waste',
        description: 'Smell is entering adjacent rooms on 1st floor.',
        category: 'cleanliness',
        priority: 'high',
        status: 'Open',
        student: students[0]._id,
        roomNumber: 'A-101',
        createdAt: hoursAgo(5),
        statusHistory: [
          { status: 'Open', changedBy: students[0]._id, note: 'Registered', timestamp: hoursAgo(5) },
        ],
      },
      {
        title: 'Common washroom mirror stained and floor dirty',
        description: 'Daily housekeeping missed cleaning 2nd floor common bathroom.',
        category: 'cleanliness',
        priority: 'medium',
        status: 'In Progress',
        student: students[2]._id,
        roomNumber: 'B-201',
        assignedTo: plumber._id,
        createdAt: hoursAgo(16),
        statusHistory: [
          { status: 'Open', changedBy: students[2]._id, note: 'Registered', timestamp: hoursAgo(16) },
          { status: 'In Progress', changedBy: admin._id, note: 'Housekeeping supervisor instructed', timestamp: hoursAgo(8) },
        ],
      },
      {
        title: 'Water cooler drip tray stagnant water and algae',
        description: 'Health hazard for students drinking from 1st floor cooler.',
        category: 'cleanliness',
        priority: 'urgent',
        status: 'Resolved',
        student: students[1]._id,
        roomNumber: 'A-102',
        assignedTo: plumber._id,
        createdAt: hoursAgo(40),
        resolvedAt: hoursAgo(15),
        statusHistory: [
          { status: 'Open', changedBy: students[1]._id, note: 'Registered', timestamp: hoursAgo(40) },
          { status: 'Resolved', changedBy: plumber._id, note: 'Sterilized cooler and cleaned tray', timestamp: hoursAgo(15) },
        ],
      },

      // Other issues
      {
        title: 'Window glass pane shattered by tennis ball',
        description: 'Fragments on floor and cold draft entering.',
        category: 'other',
        priority: 'high',
        status: 'In Progress',
        student: students[4]._id,
        roomNumber: 'C-301',
        assignedTo: carpenter._id,
        createdAt: hoursAgo(20),
        statusHistory: [
          { status: 'Open', changedBy: students[4]._id, note: 'Registered', timestamp: hoursAgo(20) },
          { status: 'In Progress', changedBy: carpenter._id, note: 'Measuring replacement glass size', timestamp: hoursAgo(12) },
        ],
      },
      {
        title: 'Pigeon nest blocking AC condenser unit',
        description: 'Airflow blocked and feathers entering duct.',
        category: 'other',
        priority: 'low',
        status: 'Closed',
        student: students[3]._id,
        roomNumber: 'B-202',
        assignedTo: carpenter._id,
        createdAt: hoursAgo(120),
        resolvedAt: hoursAgo(95),
        closedAt: hoursAgo(90),
        statusHistory: [
          { status: 'Open', changedBy: students[3]._id, note: 'Registered', timestamp: hoursAgo(120) },
          { status: 'Resolved', changedBy: carpenter._id, note: 'Installed pigeon net over AC unit', timestamp: hoursAgo(95) },
          { status: 'Closed', changedBy: admin._id, note: 'Closed', timestamp: hoursAgo(90) },
        ],
      },
    ];

    await Complaint.insertMany(complaintsData);
    console.log(`[Seed] Seeded ${complaintsData.length} realistic complaints with full status audit trails.`);

    console.log('\n=========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('=========================================');
    console.log('Accounts created:');
    console.log('  Admin:       warden@hostel.edu       / Password123!');
    console.log('  Electrician: electrician@hostel.edu  / Password123!');
    console.log('  Plumber:     plumber@hostel.edu      / Password123!');
    console.log('  Carpenter:   carpenter@hostel.edu    / Password123!');
    console.log('  Student 1:   student1@hostel.edu     / Password123!');
    console.log('  Student 2:   student2@hostel.edu     / Password123!');
    console.log('=========================================\n');

    if (shouldDisconnect) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error(`[Seed Error] ${err.message}`);
    if (shouldDisconnect) {
      process.exit(1);
    } else {
      throw err;
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
