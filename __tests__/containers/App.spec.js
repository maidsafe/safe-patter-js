import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import App from 'containers/App';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers';


function configureStore( initialState )
{
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware( thunk )
    );
}

describe( 'App', () =>
{
    let wrapper;
    const initialEntries = ['/'];
    let props;

    beforeEach( () =>
    {
        const store = configureStore( {} );

        props = {
            store : configureStore( {} )
        };

        wrapper = mount( <MemoryRouter initialEntries={ initialEntries } initialIndex={ 0 } >
            <App { ...props } />
        </MemoryRouter> );
    } );


    describe( 'render()', () =>
    {
        it( 'should contain a Switch component', () =>
        {
            expect( wrapper.find( 'Switch' ).length ).toBe( 1 );
        } );


        it( 'should have a Header', () =>
        {
            props = { ...props };

            wrapper = mount( <MemoryRouter initialEntries={ ['/'] } >
                <App { ...props } />
            </MemoryRouter> );

            expect( wrapper.find( 'HeaderComponent' ).length ).toBe( 1 );
        } );
    } );


    describe( '/', () =>
    {
        it( 'should have a PostsList (as it redirects to timeline)', () =>
        {
            props = {
                ...props
            };

            wrapper = mount( <MemoryRouter initialEntries={ ['/'] } >
                <App { ...props } />
            </MemoryRouter> );

            expect( wrapper.find( 'PostsList' ).length ).toBe( 1 );
        } );

        it( 'should have a no form', () =>
        {
            props = { ...props };

            wrapper = mount( <MemoryRouter initialEntries={ ['/'] } >
                <App { ...props } />
                             </MemoryRouter> );
            expect( wrapper.find( 'Editor' ).length ).toBe( 0 );
            expect( wrapper.find( 'PostForm' ).length ).toBe( 0 );
        } );
    } );


    describe( '/timeline', () =>
    {
        it( 'should have a PostsList', () =>
        {
            props = {
                ...props
            };

            wrapper = mount( <MemoryRouter initialEntries={ ['/timeline'] } >
                <App { ...props } />
            </MemoryRouter> );

            expect( wrapper.find( 'PostsList' ).length ).toBe( 1 );
        } );
    } );


    describe( '/create', () =>
    {
        it( 'should have a form', () =>
        {
            props = { ...props };

            wrapper = mount( <MemoryRouter initialEntries={ ['/create/new'] } >
                <App { ...props } />
            </MemoryRouter> );
            expect( wrapper.find( 'Messager' ).length ).toBe( 0 );
            expect( wrapper.find( 'PostForm' ).length ).toBe( 1 );
        } );

        it( 'should have a form when redirected from just create', () =>
        {
            props = { ...props };

            wrapper = mount( <MemoryRouter initialEntries={ ['/create'] } >
                <App { ...props } />
            </MemoryRouter> );
            expect( wrapper.find( 'Messager' ).length ).toBe( 0 );
            expect( wrapper.find( 'PostForm' ).length ).toBe( 1 );
        } );
    } );
} );
