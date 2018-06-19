import { combineReducers } from 'redux';
import user from './user_reducer';

// Add your new reducer here
const reducers = {
    user
};

const rootReducer = combineReducers( reducers );

export default rootReducer;
