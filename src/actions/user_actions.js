import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    ADD_POST : 'ADD_POST',
    SET_CURRENT_USER: 'SET_CURRENT_USER'
};

// export const {
//     // addPost :
//     // , removeBookmark
//
// } = createActions( TYPES.ADD_POST );
// }

export const addPost = createAction(
    TYPES.ADD_POST,

    // sim a promise for the network environment
    async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things...' );
            resolve( post );
        } );

        await x;

        return x;
    }
);

export const setCurrentUser = createAction(
    TYPES.SET_CURRENT_USER,

    // sim a promise for the network environment
    async ( userObjOrId ) =>
    {
        //TODO: parse if only ID/public id etc
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for getting User if needed...' );
            resolve( userObjOrId );
        } );

        await x;

        return x;
    }
);
