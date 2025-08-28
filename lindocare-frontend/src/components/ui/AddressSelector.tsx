import React, { useState, useEffect } from 'react';
import Select from './Select';
import {
  getProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  getCellsBySector,
  getVillagesByCell,
  Province,
  District,
  Sector,
  Cell,
  Village
} from '../../data/rwandaLocations';

export interface AddressData {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  street: string;
}

interface AddressSelectorProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Partial<Record<keyof AddressData, string>>;
  required?: boolean;
  disabled?: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  errors = {},
  required = true,
  disabled = false
}) => {
  const [provinces] = useState<Province[]>(getProvinces());
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update districts when province changes
  useEffect(() => {
    if (value.province) {
      const newDistricts = getDistrictsByProvince(value.province);
      setDistricts(newDistricts);
      
      // Reset dependent fields if current selections are no longer valid
      const isDistrictValid = newDistricts.some(d => d.id === value.district);
      if (!isDistrictValid && value.district) {
        onChange({
          ...value,
          district: '',
          sector: '',
          cell: '',
          village: ''
        });
      }
    } else {
      setDistricts([]);
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [value.province]);

  // Update sectors when district changes
  useEffect(() => {
    if (value.province && value.district) {
      const newSectors = getSectorsByDistrict(value.province, value.district);
      setSectors(newSectors);
      
      const isSectorValid = newSectors.some(s => s.id === value.sector);
      if (!isSectorValid && value.sector) {
        onChange({
          ...value,
          sector: '',
          cell: '',
          village: ''
        });
      }
    } else {
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [value.province, value.district]);

  // Update cells when sector changes
  useEffect(() => {
    if (value.province && value.district && value.sector) {
      const newCells = getCellsBySector(value.province, value.district, value.sector);
      setCells(newCells);
      
      const isCellValid = newCells.some(c => c.id === value.cell);
      if (!isCellValid && value.cell) {
        onChange({
          ...value,
          cell: '',
          village: ''
        });
      }
    } else {
      setCells([]);
      setVillages([]);
    }
  }, [value.province, value.district, value.sector]);

  // Update villages when cell changes
  useEffect(() => {
    if (value.province && value.district && value.sector && value.cell) {
      const newVillages = getVillagesByCell(value.province, value.district, value.sector, value.cell);
      setVillages(newVillages);
      
      const isVillageValid = newVillages.some(v => v.id === value.village);
      if (!isVillageValid && value.village) {
        onChange({
          ...value,
          village: ''
        });
      }
    } else {
      setVillages([]);
    }
  }, [value.province, value.district, value.sector, value.cell]);

  const handleFieldChange = (field: keyof AddressData, newValue: string) => {
    setIsAnimating(true);
    onChange({
      ...value,
      [field]: newValue
    });
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Location icons
  const LocationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const BuildingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const MapIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );

  const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const RoadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-600">
          <LocationIcon />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
          <p className="text-sm text-gray-600">Select your complete address for accurate delivery</p>
        </div>
      </div>

      {/* Address selection grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4   transition-all duration-300 ${isAnimating ? 'opacity-95' : 'opacity-100'}`}>
        {/* Province */}
        <div className="md:col-span-2 ">
          <Select
            label="Province"
            options={provinces.map(p => ({ id: p.id, name: p.name }))}
            value={value.province}
            onChange={(val) => handleFieldChange('province', val)}
            placeholder="Select your province"
            required={required}
            disabled={disabled}
            error={errors.province}
            icon={<MapIcon />}
            emptyMessage="No provinces available"
          />
        </div>

        {/* District */}
        <div className="md:col-span-2">
          <Select
            label="District"
            options={districts.map(d => ({ id: d.id, name: d.name }))}
            value={value.district}
            onChange={(val) => handleFieldChange('district', val)}
            placeholder={value.province ? "Select your district" : "Select province first"}
            required={required}
            disabled={disabled || !value.province}
            error={errors.district}
            icon={<BuildingIcon />}
            emptyMessage={value.province ? "No districts available" : "Please select a province first"}
          />
        </div>

        {/* Sector */}
        <Select
          label="Sector"
          options={sectors.map(s => ({ id: s.id, name: s.name }))}
          value={value.sector}
          onChange={(val) => handleFieldChange('sector', val)}
          placeholder={value.district ? "Select your sector" : "Select district first"}
          required={required}
          disabled={disabled || !value.district}
          error={errors.sector}
          icon={<MapIcon />}
          emptyMessage={value.district ? "No sectors available" : "Please select a district first"}
        />

        {/* Cell */}
        <Select
          label="Cell"
          options={cells.map(c => ({ id: c.id, name: c.name }))}
          value={value.cell}
          onChange={(val) => handleFieldChange('cell', val)}
          placeholder={value.sector ? "Select your cell" : "Select sector first"}
          required={required}
          disabled={disabled || !value.sector}
          error={errors.cell}
          icon={<BuildingIcon />}
          emptyMessage={value.sector ? "No cells available" : "Please select a sector first"}
        />

        {/* Village */}
        <Select
          label="Village"
          options={villages.map(v => ({ id: v.id, name: v.name }))}
          value={value.village}
          onChange={(val) => handleFieldChange('village', val)}
          placeholder={value.cell ? "Select your village" : "Select cell first"}
          required={required}
          disabled={disabled || !value.cell}
          error={errors.village}
          icon={<HomeIcon />}
          emptyMessage={value.cell ? "No villages available" : "Please select a cell first"}
        />

        {/* Street - Traditional input with styling to match Select component */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <RoadIcon />
            </div>
            <input
              type="text"
              value={value.street}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              placeholder="Enter your street address"
              required={required}
              disabled={disabled}
              className={`
                w-full pl-12 pr-4 py-3 
                border-2 rounded-lg transition-all duration-200
                ${disabled 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' 
                  : errors.street 
                    ? 'border-red-300 bg-white hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }
                placeholder-gray-400 text-gray-900 font-medium
                focus:outline-none
              `}
            />
          </div>
          {errors.street && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.street}
            </p>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border-blue-600 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Address Completion</span>
          <span className="text-sm text-gray-500">
            {Object.values(value).filter(v => v.trim()).length}/6 fields
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(Object.values(value).filter(v => v.trim()).length / 6) * 100}%` 
            }}
          ></div>
        </div>
        {Object.values(value).filter(v => v.trim()).length === 6 && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Address completed successfully!
          </div>
        )}
      </div>

      {/* Address preview */}
      {(value.province || value.district || value.sector || value.cell || value.village || value.street) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-600 rounded-lg">
          <h4 className="text-sm font-medium text-blue-600 mb-2">Address Preview:</h4>
          <p className="text-sm text-gray-800">
            {[value.street, value.village, value.cell, value.sector, value.district, value.province]
              .filter(Boolean)
              .join(', ') || 'Please fill in your address details above'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
