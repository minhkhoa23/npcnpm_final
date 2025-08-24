// Test script to verify API endpoints are working
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEndpoints() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('🧪 Testing API endpoints...\n');
    
    const endpoints = [
        { name: 'Health Check', url: `${baseUrl}/health` },
        { name: 'Upcoming Tournaments', url: `${baseUrl}/tournaments/upcoming` },
        { name: 'Featured News', url: `${baseUrl}/news/featured` },
        { name: 'All Tournaments', url: `${baseUrl}/tournaments` },
        { name: 'All Competitors', url: `${baseUrl}/competitors` },
        { name: 'League of Legends Teams', url: `${baseUrl}/competitors/by-game/League%20of%20Legends` }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing: ${endpoint.name}`);
            const response = await fetch(endpoint.url);
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log(`✅ ${endpoint.name}: SUCCESS`);
                if (data.data) {
                    if (data.data.tournaments) {
                        console.log(`   - Found ${data.data.tournaments.length} tournaments`);
                    }
                    if (data.data.news) {
                        console.log(`   - Found ${data.data.news.length} news articles`);
                    }
                    if (data.data.competitors) {
                        console.log(`   - Found ${data.data.competitors.length} teams`);
                    }
                }
            } else {
                console.log(`❌ ${endpoint.name}: FAILED`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Message: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ERROR`);
            console.log(`   Error: ${error.message}`);
        }
        console.log('');
    }
}

testEndpoints().catch(console.error);
