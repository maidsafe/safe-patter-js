import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import Messager from 'components/Messager/Messager';

describe( 'Messager', () =>
{
    let wrapper;
    let instance;
    let props;

    beforeEach( () =>
    {
        props = {
            match : { url: '/message' }
        };

        wrapper = shallow( <Messager { ...props } /> );
        instance = wrapper.instance();
    } );

    describe( 'constructor( props )', () =>
    {
        it( 'should have name Messager', () =>
        {
            expect( instance.constructor.name ).toBe( 'Messager' );
        } );
    } );

    describe( 'render()', () =>
    {
        beforeEach( () =>
        {
            props = { ...props };

            wrapper = shallow( <Messager { ...props } /> );
        } );

        it( 'should contain two Route components', () =>
        {
            expect( wrapper.find( 'Route' ).length ).toBe( 3 );
        } );

        it( 'should not have idForm if no name given', () =>
        {
            expect( wrapper.find( 'IdForm' ).length ).toBe( 0 );
        } );
    } );
} );
