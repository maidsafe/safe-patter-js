import { TYPES } from '../actions/user_actions';

const initialState = {
    webId : '',
    targetWebId : '',
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
            console.log("Let's get the posts then")
            const newUser = { ...payload, id: `safe://josh.${payload.id}` };
            const targetUser = { ...payload, id: `safe://josh.${payload.id}` };
            return { ...state, webId: newUser, targetWebId: targetUser };
        }
        case TYPES.ADD_POST:
        {
            const oldPosts = state.posts;
            console.log("Let's update list of posts")
            const postArray = [...oldPosts, payload];
            console.log("POSTS:", postArray)
            return { ...state, posts: postArray };
        }

        default:
            return state;
    }
};
