import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    ADD_POST         : 'ADD_POST',
    SET_CURRENT_USER : 'SET_CURRENT_USER',
    SEND_MESSAGE     : 'SEND_MESSAGE'
};

// export const {
//     // addPost :
//     // , removeBookmark
//
// } = createActions( TYPES.ADD_POST );
// }

export const {
    addPost,
    setCurrentUser,
    sendMessage
} = createActions( {
    [TYPES.ADD_POST] : async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things...' );
            resolve( post );
        } );

        await x;

        return x;
    },
    [TYPES.SET_CURRENT_USER] : async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for getting User if needed...' );
            resolve( post );
        } );

        await x;

        return x;
    },
    [TYPES.SEND_MESSAGE] : async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for sending a message...' );
            resolve( post );
        } );

        await x;

        return x;
    }
} );
