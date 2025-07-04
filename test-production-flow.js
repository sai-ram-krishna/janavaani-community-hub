// Test script to verify the complete user flow in production
// This will simulate registration, login, and issue reporting

const BASE_URL = 'https://janavaani-community-hub.onrender.com';

async function testProductionFlow() {
    console.log('🧪 Testing JANAVAANI Production Flow...\n');
    
    // Test 1: Check if server is running
    console.log('1. Checking server status...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/users/count`);
        const data = await response.json();
        console.log('✅ Server is running. Users in database:', data.count);
    } catch (error) {
        console.error('❌ Server is not accessible:', error.message);
        return;
    }
    
    // Test 2: Register a new test user
    console.log('\n2. Registering a new test user...');
    const testUser = {
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        phone: '9876543210',
        password: 'testPassword123',
        userType: 'citizen'
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Registration successful!');
            console.log('   User ID:', data.user.id);
            console.log('   User Name:', data.user.name);
            testUser.id = data.user.id;
        } else {
            console.error('❌ Registration failed:', data.message);
            return;
        }
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        return;
    }
    
    // Test 3: Login with the test user
    console.log('\n3. Logging in with test user...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
                userType: testUser.userType
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('   Logged in as:', data.user.name);
            console.log('   User ID from login:', data.user.id);
            testUser.loginData = data.user;
        } else {
            console.error('❌ Login failed:', data.message);
            return;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return;
    }
    
    // Test 4: Verify user exists in database
    console.log('\n4. Verifying user exists in database...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/users/verify/${testUser.id}`);
        console.log('   Response status:', response.status);
        console.log('   Response headers:', response.headers.get('content-type'));
        
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            
            if (data.exists) {
                console.log('✅ User verified in database');
                console.log('   User found:', data.user.name);
            } else {
                console.error('❌ User not found in database');
                console.log('   Total users in DB:', data.totalUsers);
                return;
            }
        } else {
            console.error('❌ Server returned HTML instead of JSON');
            const text = await response.text();
            console.log('   First 200 chars:', text.substring(0, 200));
        }
    } catch (error) {
        console.error('❌ User verification error:', error.message);
        return;
    }
    
    // Test 5: Submit an issue report
    console.log('\n5. Submitting an issue report...');
    const testIssue = {
        title: 'Test Issue ' + Date.now(),
        description: 'This is a test issue created by the automated testing script to verify the complete user flow.',
        category: 'infrastructure',
        priority: 'medium',
        location: {
            address: '123 Test Street, Test City',
            pincode: '123456',
            landmark: 'Near Test Park'
        },
        reporter: {
            name: testUser.name,
            email: testUser.email,
            phone: testUser.phone
        },
        userId: testUser.id
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testIssue)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Issue reported successfully!');
            console.log('   Issue ID:', data.issue.id);
            console.log('   Issue Title:', data.issue.title);
        } else {
            console.error('❌ Issue reporting failed:', data.message);
            console.log('   Error details:', data.error);
            return;
        }
    } catch (error) {
        console.error('❌ Issue reporting error:', error.message);
        return;
    }
    
    // Test 6: Check recent users
    console.log('\n6. Checking recent users...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/users/recent`);
        const data = await response.json();
        
        console.log('✅ Recent users retrieved:');
        console.log('   Total users:', data.total);
        console.log('   Recent users:', data.users.map(u => ({ name: u.name, email: u.email })));
    } catch (error) {
        console.error('❌ Recent users error:', error.message);
    }
    
    console.log('\n🎉 Production flow test completed successfully!');
    console.log('All core features are working properly in production.');
}

// Run the test
testProductionFlow().catch(console.error);
