import { TYPES } from '../actions/user_actions';

const initialState = {
    webId : '',
    posts : [
    ],
    inbox : [
    ]

};

export default ( state = initialState, action ) =>
{
    const { payload } = action;

    switch ( action.type )
    {
        case TYPES.SET_CURRENT_USER:
        {
            const newUser = payload;

            return newUser;
        }
        case TYPES.ADD_POST:
        {
            const oldPosts = state.posts;
            const postArray = [...oldPosts, payload];

            return { ...state, posts: postArray };
        }

        default:
            return state;
    }
};
