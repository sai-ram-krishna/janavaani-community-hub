// Location dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
  // Sample location data - replace with actual data from locations.json
  const locationData = {
    "Andhra Pradesh": {
      "Anantapur": {
        "Anantapur": ["Anantapur", "Gooty", "Tadipatri"],
        "Guntakal": ["Guntakal", "Uravakonda", "Tadpatri"]
      },
      "Krishna": {
        "Vijayawada": ["Vijayawada", "Gannavaram", "Ibrahimpatnam"],
        "Machilipatnam": ["Machilipatnam", "Gudivada", "Pedana"]
      }
    },
    "Telangana": {
      "Hyderabad": {
        "Hyderabad": ["Secunderabad", "Kukatpally", "Madhapur"],
        "Serilingampally": ["Gachibowli", "Kondapur", "Miyapur"]
      },
      "Warangal": {
        "Warangal": ["Warangal", "Kazipet", "Hanamkonda"],
        "Jangaon": ["Jangaon", "Ghanpur", "Chilpur"]
      }
    }
  };

  const stateSelect = document.getElementById('stateSelect');
  const districtSelect = document.getElementById('districtSelect');
  const mandalSelect = document.getElementById('mandalSelect');
  const villageSelect = document.getElementById('villageSelect');

  // Populate states
  Object.keys(locationData).forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  // Handle state change
  stateSelect.addEventListener('change', function() {
    const selectedState = this.value;
    
    // Clear dependent dropdowns
    districtSelect.innerHTML = '<option value="">Select District</option>';
    mandalSelect.innerHTML = '<option value="">Select Mandal</option>';
    villageSelect.innerHTML = '<option value="">Select Village</option>';
    
    if (selectedState && locationData[selectedState]) {
      Object.keys(locationData[selectedState]).forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

  // Handle district change
  districtSelect.addEventListener('change', function() {
    const selectedState = stateSelect.value;
    const selectedDistrict = this.value;
    
    // Clear dependent dropdowns
    mandalSelect.innerHTML = '<option value="">Select Mandal</option>';
    villageSelect.innerHTML = '<option value="">Select Village</option>';
    
    if (selectedState && selectedDistrict && locationData[selectedState][selectedDistrict]) {
      Object.keys(locationData[selectedState][selectedDistrict]).forEach(mandal => {
        const option = document.createElement('option');
        option.value = mandal;
        option.textContent = mandal;
        mandalSelect.appendChild(option);
      });
    }
  });

  // Handle mandal change
  mandalSelect.addEventListener('change', function() {
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;
    const selectedMandal = this.value;
    
    // Clear village dropdown
    villageSelect.innerHTML = '<option value="">Select Village</option>';
    
    if (selectedState && selectedDistrict && selectedMandal && 
        locationData[selectedState][selectedDistrict][selectedMandal]) {
      locationData[selectedState][selectedDistrict][selectedMandal].forEach(village => {
        const option = document.createElement('option');
        option.value = village;
        option.textContent = village;
        villageSelect.appendChild(option);
      });
    }
  });
});
