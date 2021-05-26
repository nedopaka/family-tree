import { combineReducers } from 'redux';
import userReducer from '../features/user/userSlice';
import familyTreeReducer from '../features/familyTree/familyTreeSlice';
import todosReducer from '../features/todos/todosSlice';
import visibilityFilterReducer from '../features/filters/filtersSlice';

export default combineReducers({
  user: userReducer,
  todos: todosReducer,
  familyTree: familyTreeReducer,
  visibilityFilter: visibilityFilterReducer,
});
