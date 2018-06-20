import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { PATHS } from '../../constants';
import { Layout } from 'antd';

const { Header } = Layout;

const HeaderComponent = ( props ) =>
{
    const selectedKeys = [];
    const location = props.location.pathname;

    // set menu as active on load if on a specific path
    Object.keys( PATHS ).forEach( path =>
    {
        location.startsWith( PATHS[path] ) ? selectedKeys.push( PATHS[path] ) : '';
    } );

    return (
        <div>
            <h1>Not Twitter</h1>
            <Menu mode="horizontal" selectedKeys={ selectedKeys }>
                <Menu.Item key={ PATHS.HOME }>
                    <NavLink to={ PATHS.HOME } >Home</NavLink>
                </Menu.Item>
                <Menu.Item key={ PATHS.CREATE }>
                    <NavLink to={ PATHS.CREATE } >Create</NavLink>
                </Menu.Item>
                {/* <Menu.Item key={ PATHS.EDIT }>
                    <NavLink to={ PATHS.EDIT } >Edit</NavLink>
                </Menu.Item> */}
            </Menu>
        </div>
    );
};

export default HeaderComponent;
