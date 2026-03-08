// property.slice.ts - Redux slice for property state
// Install: npm install @reduxjs/toolkit react-redux

/*
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Property, PropertyFilter } from './property.types';

interface PropertyState {
  items: Property[];
  selectedProperty: Property | null;
  filters: PropertyFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  items: [],
  selectedProperty: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.items = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    setFilters: (state, action: PayloadAction<PropertyFilter>) => {
      state.filters = action.payload;
    },
  },
});

export const { setProperties, setSelectedProperty, setFilters } = propertySlice.actions;
export default propertySlice.reducer;
*/

export {};
