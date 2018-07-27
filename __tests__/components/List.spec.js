import React from 'react';
import { shallow, mount } from 'enzyme';

import PostsList from 'components/PostsList/PostsList';

describe( 'PostsList', () =>
{
    let wrapper;
    let instance;
    let props;

    beforeEach( () =>
    {
        props = {
        };

        wrapper = shallow( <PostsList { ...props } /> );
        instance = wrapper.instance();
    } );

    describe( 'constructor( props )', () =>
    {
        it( 'should have name PostsList', () =>
        {
            expect( instance.constructor.name ).toBe( 'PostsList' );
        } );
    } );


    describe( 'render()', () =>
    {
        beforeEach( () =>
        {
            props = { ...props, user: { posts: [] } };
            wrapper = shallow( <PostsList { ...props } /> );
        } );

        it( 'should not contain an Card component if no posts or inbox', () =>
        {
            expect( wrapper.find( 'Card' ).length ).toBe( 0 );
        } );

        it( 'should contain an Card component with a post (no inbox)', () =>
        {
            props = { ...props, posts: [{ text: 'hithere' }] };
            wrapper = shallow( <PostsList { ...props } /> );
            expect( wrapper.find( 'Card' ).length ).toBe( 1 );
        } );


        it( 'should contain two Card components with a post and an inbox message', () =>
        {
            props = { ...props, posts: [{ text: 'hithere' }], inbox: [{ text: 'hello yourself' }] };
            wrapper = shallow( <PostsList { ...props } /> );
            expect( wrapper.find( 'Card' ).length ).toBe( 2 );
        } );

        it( 'should contain a Card with timestamp + ago for a recent post', () =>
        {
            props = { ...props, posts: [{ text: 'hithere', timestamp: Date.now() - 200 }] };
            wrapper = shallow( <PostsList { ...props } /> );
            expect( wrapper.html() ).toEqual( expect.stringMatching( /ago\./ ) );
        } );
    } );
} );
