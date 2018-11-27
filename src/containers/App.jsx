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
            users, match, addPost, switchWall, authorise, downgradeConn, fetchPosts
        } = this.props;
        const webId = users && users.webId;
        const wallWebId = users && users.wallWebId;

        console.log( 'Selected WebID:', webId );
        console.log( 'WallWebId:', wallWebId );
        return (
            <div className={ styles.hdrContainer }>
                <Row>
                    <Col span={ 24 }>
                        <Route
                            path="/"
                            render={ () => (
                                <HeaderComponent
                                    webId={ webId }
                                    switchWall={ switchWall }
                                    auhorise={ authorise }
                                    downgradeConn={ downgradeConn }
                                    { ...this.props }
                                /> )
                            }
                        />
                        <Switch>
                            <Route
                                path="/home"
                                render={ () => (
                                    <Wall
                                        webId={ wallWebId }
                                        switchWall={ switchWall }
                                        users={ users }
                                        addPost={ addPost }
                                        fetchPosts={ fetchPosts }
                                    />
                                ) }
                            />

                            <Route
                                path="/profile/:uri"
                                render={ ( props ) => (
                                    <Wall
                                        webId={ wallWebId }
                                        users={ users }
                                        addPost={ addPost }
                                        match={ props.match }
                                        fetchPosts={ fetchPosts }
                                        switchWall={ switchWall }
                                    />
                                ) }
                            />
                            {/* <Wall webId={ wallWebId } users={ users } addPost={ addPost } /> */}
                            <Route path="/" render={ () => <Redirect to="/home" /> } />
                        </Switch>

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
