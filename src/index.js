import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

import App from './containers/App';
import rootReducer from './reducers';

import * as userActions from './actions/user_actions';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [thunk, promiseMiddleware];
const enhancer = composeEnhancers( applyMiddleware( ...middleware ) );

function configureStore( initialState )
{
    return createStore(
        rootReducer,
        initialState,
        enhancer
    );
}

// Authorise app and connect to the network up front
// store.dispatch( userActions.connectToNet() );
const store = configureStore( {} );


if ( window.webIdEventEmitter )
{
    console.log( 'webId emitter exists!' );

    if( window.webIdEventEmitter['_events'].length === 0 )
    {
        window.webIdEventEmitter.once( 'update', ( webId ) =>
        {
            console.log('webId from update', webId)
            store.dispatch( userActions.setCurrentUser( webId ) );
        } );
    }
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
