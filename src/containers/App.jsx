import React from 'react';
// import PropTypes from 'prop-types';
import { withRouter, Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from '../actions/user_actions';

import styles from './global.css';
import HeaderComponent from '../components/Header/Header';

import Wall from '../components/Wall/Wall';

import { Layout, Row, Col, Avatar } from 'antd';

const {
    Header, Sider, Content, Footer
} = Layout;

class App extends React.Component
{
    render = () =>
    {
        const {
            users, match, addPost, switchWall, authorise, downgradeConn
        } = this.props;
        const webId = users && users.webId;
        const wallWebId = users && users.wallWebId;


        return (
            <div style={ {
                maxWidth : '800px',
                display  : 'block',
                margin   : '0 auto'
            } }
            >

                <Row>
                    <Col span={ 24 }>
                        <HeaderComponent
                            webId={ webId }
                            switchWall={ switchWall }
                            auhorise={ authorise }
                            downgradeConn={ downgradeConn }
                            { ...this.props }
                        />
                        <Wall webId={ wallWebId } users={ users } addPost={ addPost } />
                    </Col>
                </Row>

            </div>
        );
    }
}


function mapDispatchToProps( dispatch )
{
    const actions =
    {
        ...userActions,
    };
    return bindActionCreators( actions, dispatch );
}

function mapStateToProps( state )
{
    return {
        users : state.users
    };
}
export default withRouter( connect( mapStateToProps, mapDispatchToProps )( App ) );
