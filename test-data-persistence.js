const fs = require('fs');
const path = require('path');

// Test script to verify data persistence in JSON files
console.log('🧪 Testing data persistence...\n');

// Read current users.json
const usersPath = path.join(__dirname, 'src/backend/data/users.json');
const tournamentsPath = path.join(__dirname, 'src/backend/data/tournaments.json');

try {
    // Read users before test
    const usersBefore = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    console.log(`📊 Users before test: ${usersBefore.length}`);
    
    // Read tournaments before test  
    const tournamentsBefore = JSON.parse(fs.readFileSync(tournamentsPath, 'utf8'));
    console.log(`🏆 Tournaments before test: ${tournamentsBefore.length}`);

    console.log('\n✅ Data files are accessible');
    console.log('📝 You can now test:');
    console.log('1. Register a new user at http://localhost:3000/register.html');
    console.log('2. Login with the new user credentials');
    console.log('3. Check that user appears in users.json file');
    console.log('4. Create a tournament as organizer');
    console.log('5. Check that tournament appears in tournaments.json file');
    console.log('\n🔍 User role routing:');
    console.log('- Regular users: redirected to /dashboard.html');
    console.log('- Organizers: redirected to /organizer-dashboard.html');
    console.log('- Admins: redirected to /dashboard.html');
    
} catch (error) {
    console.error('❌ Error reading data files:', error.message);
}
