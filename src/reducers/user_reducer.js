import { TYPES } from '../actions/user_actions';

const initialState = {
    webId     : null,
    wallWebId : null,
    posts     : [],
};

export default ( state = initialState, action ) =>
{
    const { payload } = action;

    switch ( action.type )
    {
        case TYPES.AUTHORISE:
        {
            return { ...state, webId: payload };
        }
        case TYPES.DOWNGRADE_CONN:
        {
            return { ...state, webId: null };
        }
        case TYPES.CONNECT_TO_NET:
        {
            return { ...state, connected: true }
        }
        case TYPES.SET_CURRENT_USER:
        {
            console.log('setting current useerrrr', state.wallWebId)
            return {
                ...state,
                webId     : payload.webId,
                wallWebId : state.wallWebId || payload.wallWebId,
                posts     : payload.posts
            };
        }
        case TYPES.ADD_POST:
        {
            const oldPosts = state.posts;
            console.log( "Let's update list of posts" );
            const postArray = [...oldPosts, payload];
            return { ...state, posts: postArray };
        }
        case TYPES.SWITCH_WALL:
        {
            if ( payload.message ) return { ...state };
            console.log('whaaaaaat switching??????????????////', payload)
            return {
                ...state,
                wallWebId : payload.wallWebId,
                posts     : payload.posts
            };
        }
        case TYPES.FETCH_POSTS:
        {
            console.log( "Let's fully update list of posts" );
            return { ...state, posts: payload };
        }

        default:
            return state;
    }
};
