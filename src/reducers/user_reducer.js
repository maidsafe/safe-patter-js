import { TYPES } from '../actions/user_actions';

const initialState = {
    webId : {
      id: '',
      name: '',
      nick: '',
      website: '',
      image: ''
    },
    wallWebId : {
      id: '',
      name: '',
      nick: '',
      website: '',
      image: ''
    },
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
            return {
              ...state,
              webId: payload.users.webId,
              wallWebId: payload.users.wallWebId,
              posts: payload.posts
            };
        }
        case TYPES.ADD_POST:
        {
            const oldPosts = state.posts;
            console.log("Let's update list of posts")
            const postArray = [...oldPosts, payload];
            return { ...state, posts: postArray };
        }
        case TYPES.SWITCH_WALL:
        {
            return {
              ...state,
              wallWebId: payload.wallWebId,
              posts: payload.posts
            };
        }
        case TYPES.FETCH_POSTS:
        {
            console.log("Let's ffully update list of posts")
            return { ...state, posts: payload };
        }

        default:
            return state;
    }
};
