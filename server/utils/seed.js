const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const Meal = require('../models/Meal');

dotenv.config();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Room.deleteMany();
        await Meal.deleteMany();
        console.log('Cleared existing data...');

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@hostel.com',
            password: 'admin123',
            role: 'admin',
            phone: '9876543210'
        });
        console.log('✅ Admin created: admin@hostel.com / admin123');

        // Create Wardens
        const warden1 = await User.create({
            name: 'Rajesh Kumar',
            email: 'warden@hostel.com',
            password: 'warden123',
            role: 'warden',
            phone: '9876543211'
        });

        const warden2 = await User.create({
            name: 'Priya Sharma',
            email: 'warden2@hostel.com',
            password: 'warden123',
            role: 'warden',
            phone: '9876543212'
        });
        console.log('✅ Wardens created: warden@hostel.com / warden123');

        // Create Rooms
        const rooms = [];
        const blocks = ['A', 'B', 'C'];
        const types = ['single', 'double', 'triple'];
        const amenities = [
            ['WiFi', 'Fan', 'Desk'],
            ['WiFi', 'AC', 'Desk', 'Wardrobe'],
            ['WiFi', 'Fan', 'Desk', 'Wardrobe', 'Balcony']
        ];

        for (const block of blocks) {
            for (let floor = 1; floor <= 3; floor++) {
                for (let room = 1; room <= 4; room++) {
                    const typeIndex = (room - 1) % 3;
                    const capacity = typeIndex + 1;
                    rooms.push({
                        roomNumber: `${block}${floor}0${room}`,
                        floor,
                        block,
                        type: types[typeIndex],
                        capacity,
                        status: 'available',
                        amenities: amenities[typeIndex],
                        pricePerMonth: 3000 + (typeIndex * 2000)
                    });
                }
            }
        }

        const createdRooms = await Room.insertMany(rooms);
        console.log(`✅ ${createdRooms.length} rooms created across blocks A, B, C`);

        // Create Students
        const studentNames = [
            'Aarav Patel', 'Vivaan Singh', 'Aditya Sharma', 'Sai Kumar',
            'Arjun Reddy', 'Reyansh Gupta', 'Kavya Nair', 'Ananya Iyer',
            'Ishaan Joshi', 'Dhruv Mehta', 'Riya Verma', 'Neha Desai',
            'Rohan Tiwari', 'Tanvi Shah', 'Aisha Khan', 'Sahil Yadav'
        ];

        const students = [];
        for (let i = 0; i < studentNames.length; i++) {
            const student = await User.create({
                name: studentNames[i],
                email: `student${i + 1}@hostel.com`,
                password: 'student123',
                role: 'student',
                phone: `98765${String(43213 + i).padStart(5, '0')}`,
                studentId: `STU${String(2026001 + i)}`,
                department: ['CSE', 'ECE', 'ME', 'CE'][i % 4],
                year: ['1st', '2nd', '3rd', '4th'][i % 4],
                parentName: `Parent of ${studentNames[i]}`,
                parentPhone: `91234${String(56789 + i).padStart(5, '0')}`,
                address: `House ${i + 1}, Street ${i + 1}, City`
            });
            students.push(student);
        }
        console.log(`✅ ${students.length} students created: student1@hostel.com / student123`);

        // Allocate some students to rooms
        for (let i = 0; i < 8; i++) {
            const room = createdRooms[i];
            const student = students[i];
            room.occupants.push(student._id);
            if (room.occupants.length >= room.capacity) room.status = 'full';
            await room.save();
            student.room = room._id;
            student.block = room.block;
            await student.save();
        }
        console.log('✅ 8 students allocated to rooms');

        // Create meal schedule
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealData = [
            { breakfast: 'Idli, Sambar, Chutney', lunch: 'Rice, Dal, Sabji, Roti', dinner: 'Roti, Paneer, Dal, Rice', snacks: 'Tea, Biscuits' },
            { breakfast: 'Poha, Jalebi, Milk', lunch: 'Rice, Rajma, Salad, Roti', dinner: 'Roti, Chole, Rice, Raita', snacks: 'Samosa, Tea' },
            { breakfast: 'Paratha, Curd, Pickle', lunch: 'Rice, Dal Fry, Aloo Gobi, Roti', dinner: 'Roti, Mix Veg, Dal, Rice', snacks: 'Bread Pakora, Tea' },
            { breakfast: 'Upma, Vada, Coconut Chutney', lunch: 'Rice, Kadhi, Bhindi, Roti', dinner: 'Biryani, Raita, Salad', snacks: 'Tea, Cake' },
            { breakfast: 'Puri, Aloo Sabji, Halwa', lunch: 'Rice, Dal Tadka, Palak, Roti', dinner: 'Roti, Egg Curry/Paneer, Rice', snacks: 'Burger, Juice' },
            { breakfast: 'Chole Bhature, Lassi', lunch: 'Rice, Sambar, Poriyal, Roti', dinner: 'Roti, Dal Makhani, Rice, Sweet', snacks: 'Pizza, Cold Drink' },
            { breakfast: 'Dosa, Sambar, Chutney', lunch: 'Pulao, Raita, Paneer, Roti', dinner: 'Roti, Chicken/Paneer Tikka, Rice', snacks: 'Ice Cream, Tea' },
        ];

        for (let i = 0; i < days.length; i++) {
            await Meal.create({
                day: days[i],
                ...mealData[i],
                weekLabel: 'Current Week',
                createdBy: warden1._id
            });
        }
        console.log('✅ Meal schedule created for the week');

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:   admin@hostel.com / admin123');
        console.log('   Warden:  warden@hostel.com / warden123');
        console.log('   Student: student1@hostel.com / student123');
    } catch (error) {
        console.error('Seed error:', error);
        throw error;
    }
};

// If run directly from CLI, connect to DB first
if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB...');
            return seedData();
        })
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = seedData;
