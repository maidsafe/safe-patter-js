import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

import App from './containers/App';
import rootReducer from './reducers';

import * as userActions from './actions/user_actions';


function configureStore( initialState )
{
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware( promiseMiddleware, thunk ),
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
}

const store = configureStore( {} );

// Authorise app and connect to the network up front
//store.dispatch( userActions.connectToNet() );


if ( window.webIdEventEmitter )
{
    console.log( 'webId emitter exists!' );

    window.webIdEventEmitter.on( 'update', ( webId ) =>
    {
        store.dispatch( userActions.setCurrentUser( webId ) );
    } );
}

if ( window.currentWebId )
{
    store.dispatch( userActions.setCurrentUser( window.currentWebId ) );
}

const reactRoot = document.getElementById( 'react-root' );

render(
    <BrowserRouter>
        <App store={ store } />
    </BrowserRouter>
    ,
    reactRoot
);
