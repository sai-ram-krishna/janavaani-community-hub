// Test script to create sample issues for testing browse functionality
const sampleIssues = [
    {
        title: "Broken Street Light on Main Road",
        description: "The street light near the community center has been out for weeks. This creates safety concerns for pedestrians and drivers at night.",
        category: "electricity",
        priority: "high",
        location: {
            state: "Telangana",
            district: "Hyderabad",
            mandal: "Secunderabad",
            village: "Marredpally",
            address: "Main Road, near Community Center",
            pincode: "500026",
            fullAddress: "Main Road, near Community Center, Marredpally, Secunderabad, Hyderabad, Telangana"
        },
        submittedBy: {
            userId: "6864bcb90b05f81447536370",
            name: "Sample User",
            email: "user@example.com",
            phone: "9876543210"
        }
    },
    {
        title: "Water Supply Issues in Residential Area",
        description: "Residents have been experiencing low water pressure and intermittent supply for the past month. Multiple households are affected.",
        category: "water",
        priority: "urgent",
        location: {
            state: "Telangana",
            district: "Hyderabad",
            mandal: "Secunderabad",
            village: "Sainikpuri",
            address: "Block B, Apartments",
            pincode: "500094",
            fullAddress: "Block B, Apartments, Sainikpuri, Secunderabad, Hyderabad, Telangana"
        },
        submittedBy: {
            userId: "6864bcb90b05f81447536370",
            name: "Another User",
            email: "user2@example.com",
            phone: "9876543211"
        }
    },
    {
        title: "Potholes on School Road",
        description: "Multiple large potholes have formed on the road leading to the primary school. This poses risks to children and vehicles.",
        category: "roads",
        priority: "medium",
        location: {
            state: "Andhra Pradesh",
            district: "Visakhapatnam",
            mandal: "Gajuwaka",
            village: "Pedagantyada",
            address: "School Road, near Primary School",
            pincode: "530044",
            fullAddress: "School Road, near Primary School, Pedagantyada, Gajuwaka, Visakhapatnam, Andhra Pradesh"
        },
        submittedBy: {
            userId: "6864bcb90b05f81447536370",
            name: "Parent User",
            email: "parent@example.com",
            phone: "9876543212"
        }
    },
    {
        title: "Garbage Collection Delay",
        description: "Garbage has not been collected from our street for over a week. This is causing sanitation issues and attracting pests.",
        category: "sanitation",
        priority: "high",
        location: {
            state: "Telangana",
            district: "Hyderabad",
            mandal: "Kukatpally",
            village: "KPHB",
            address: "Phase 3, Road No. 5",
            pincode: "500072",
            fullAddress: "Phase 3, Road No. 5, KPHB, Kukatpally, Hyderabad, Telangana"
        },
        submittedBy: {
            userId: "6864bcb90b05f81447536370",
            name: "Resident User",
            email: "resident@example.com",
            phone: "9876543213"
        }
    },
    {
        title: "Noise Pollution from Construction Site",
        description: "Construction work starts very early (5 AM) and continues late into the night, disturbing residents' sleep and peace.",
        category: "other",
        priority: "medium",
        location: {
            state: "Telangana",
            district: "Hyderabad",
            mandal: "Madhapur",
            village: "Hitech City",
            address: "Near IT Tower",
            pincode: "500081",
            fullAddress: "Near IT Tower, Hitech City, Madhapur, Hyderabad, Telangana"
        },
        submittedBy: {
            userId: "6864bcb90b05f81447536370",
            name: "IT Professional",
            email: "itpro@example.com",
            phone: "9876543214"
        }
    }
];

async function createTestIssues() {
    console.log('Creating test issues...');
    
    for (let i = 0; i < sampleIssues.length; i++) {
        const issue = sampleIssues[i];
        try {
            const response = await fetch('http://localhost:5000/api/issues/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(issue)
            });
            
            const result = await response.json();
            if (response.ok) {
                console.log(`✅ Created issue: ${issue.title}`);
            } else {
                console.log(`❌ Failed to create issue: ${issue.title} - ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ Error creating issue: ${issue.title} - ${error.message}`);
        }
    }
    
    console.log('Finished creating test issues!');
}

createTestIssues();
