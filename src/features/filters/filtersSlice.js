import { createSlice } from '@reduxjs/toolkit';

export const VisibilityFilters = {
  SHOW_ALL: 'all',
  SHOW_COMPLETED: 'completed',
  SHOW_ACTIVE: 'active',
  SHOW_TODO: 'todo',
};

const filtersSlice = createSlice({
  name: 'visibilityFilters',
  initialState: VisibilityFilters.SHOW_ALL,
  reducers: {
    setVisibilityFilter(state, action) {
      return action.payload;
    },
  },
});

export const { setVisibilityFilter } = filtersSlice.actions;

export default filtersSlice.reducer;
