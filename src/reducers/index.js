import { combineReducers } from 'redux';
import users from './user_reducer';

// Add your new reducer here
const reducers = {
    users
};

const rootReducer = combineReducers( reducers );

export default rootReducer;
