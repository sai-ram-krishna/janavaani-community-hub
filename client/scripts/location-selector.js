// Location hierarchy functionality
class LocationSelector {
    constructor() {
        this.locationData = {};
        this.stateSelect = document.getElementById('state');
        this.districtSelect = document.getElementById('district');
        this.mandalSelect = document.getElementById('mandal');
        this.villageSelect = document.getElementById('village');
        
        this.init();
    }
    
    async init() {
        await this.loadLocationData();
        this.setupEventListeners();
    }
    
    async loadLocationData() {
        try {
            const response = await fetch('data/locations.json');
            this.locationData = await response.json();
            console.log('Location data loaded:', this.locationData);
        } catch (error) {
            console.error('Error loading location data:', error);
            // Fallback data
            this.locationData = {
                "Andhra Pradesh": {
                    "Anantapur": {
                        "Kalyandurg": ["Gorantla", "Kambadur"],
                        "Hindupur": ["Lepakshi", "Penukonda"]
                    },
                    "Guntur": {
                        "Tenali": ["Kollipara", "Kakumanu"],
                        "Mangalagiri": ["Tadikonda", "Pedakakani"]
                    }
                },
                "Telangana": {
                    "Hyderabad": {
                        "Serilingampally": ["Gachibowli", "Kondapur"],
                        "Kukatpally": ["Miyapur", "Bachupally"]
                    },
                    "Warangal": {
                        "Warangal Urban": ["Kazipet", "Hanamkonda"],
                        "Warangal Rural": ["Geesugonda", "Dharmasagar"]
                    }
                }
            };
        }
    }
    
    setupEventListeners() {
        if (this.stateSelect) {
            this.stateSelect.addEventListener('change', (e) => this.onStateChange(e));
        }
        
        if (this.districtSelect) {
            this.districtSelect.addEventListener('change', (e) => this.onDistrictChange(e));
        }
        
        if (this.mandalSelect) {
            this.mandalSelect.addEventListener('change', (e) => this.onMandalChange(e));
        }
    }
    
    onStateChange(event) {
        const selectedState = event.target.value;
        this.resetDropdowns(['district', 'mandal', 'village']);
        
        if (selectedState && this.locationData[selectedState]) {
            this.populateDistricts(selectedState);
            this.districtSelect.disabled = false;
        } else {
            this.districtSelect.disabled = true;
        }
    }
    
    onDistrictChange(event) {
        const selectedState = this.stateSelect.value;
        const selectedDistrict = event.target.value;
        this.resetDropdowns(['mandal', 'village']);
        
        if (selectedDistrict && this.locationData[selectedState][selectedDistrict]) {
            this.populateMandals(selectedState, selectedDistrict);
            this.mandalSelect.disabled = false;
        } else {
            this.mandalSelect.disabled = true;
        }
    }
    
    onMandalChange(event) {
        const selectedState = this.stateSelect.value;
        const selectedDistrict = this.districtSelect.value;
        const selectedMandal = event.target.value;
        this.resetDropdowns(['village']);
        
        if (selectedMandal && this.locationData[selectedState][selectedDistrict][selectedMandal]) {
            this.populateVillages(selectedState, selectedDistrict, selectedMandal);
            this.villageSelect.disabled = false;
        } else {
            this.villageSelect.disabled = true;
        }
    }
    
    populateDistricts(state) {
        const districts = Object.keys(this.locationData[state]);
        this.populateSelect(this.districtSelect, districts, 'Select District');
    }
    
    populateMandals(state, district) {
        const mandals = Object.keys(this.locationData[state][district]);
        this.populateSelect(this.mandalSelect, mandals, 'Select Mandal');
    }
    
    populateVillages(state, district, mandal) {
        const villages = this.locationData[state][district][mandal];
        this.populateSelect(this.villageSelect, villages, 'Select Village');
    }
    
    populateSelect(selectElement, options, placeholder) {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }
    
    resetDropdowns(dropdownNames) {
        dropdownNames.forEach(name => {
            const element = document.getElementById(name);
            if (element) {
                element.innerHTML = `<option value="">Select ${name.charAt(0).toUpperCase() + name.slice(1)}</option>`;
                element.disabled = true;
            }
        });
    }
    
    getSelectedLocation() {
        return {
            state: this.stateSelect?.value || '',
            district: this.districtSelect?.value || '',
            mandal: this.mandalSelect?.value || '',
            village: this.villageSelect?.value || '',
            fullAddress: `${this.villageSelect?.value || ''}, ${this.mandalSelect?.value || ''}, ${this.districtSelect?.value || ''}, ${this.stateSelect?.value || ''}`.replace(/(^,)|(,$)/g, '').replace(/,+/g, ', ')
        };
    }
    
    validateLocationSelection() {
        const location = this.getSelectedLocation();
        if (!location.state || !location.district || !location.mandal || !location.village) {
            return {
                isValid: false,
                message: 'Please select State, District, Mandal, and Village'
            };
        }
        return { isValid: true };
    }
}

// Initialize location selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('state')) {
        window.locationSelector = new LocationSelector();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationSelector;
}
