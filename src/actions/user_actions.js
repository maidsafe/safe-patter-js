import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    ADD_POST : 'ADD_POST'
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
