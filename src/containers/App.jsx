import React from 'react';
// import PropTypes from 'prop-types';
import { withRouter, Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from '../actions/user_actions';

import styles from './global.css';
import HeaderComponent from '../components/Header/Header';
import Messager from '../components/Messager/Messager';
import PostsList from '../components/PostsList/PostsList';
import PostForm from '../components/PostForm/PostForm';

import { Layout, Row, Col, Avatar } from 'antd';

const { Header, Sider, Content, Footer } = Layout;

import unknown from '../../public/unknown.jpg';

class App extends React.Component
{
    render = () =>
    {
        const { users, match, addPost, switchWall, authorise, downgradeConn } = this.props;
        const webId = users && users.webId;
        const wallWebId = users && users.wallWebId;

        const image = wallWebId && wallWebId['#me'] && wallWebId['#me'].image;
        const nick = wallWebId && wallWebId['#me'] && wallWebId['#me'].nick;
        const id = wallWebId && wallWebId['#me'] && wallWebId['#me']['@id'];
        const name = wallWebId && wallWebId['#me'] && wallWebId['#me'].name;
        const website = wallWebId && wallWebId['#me'] && wallWebId['#me'].website;

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
                  </Col>
                </Row>
                { wallWebId ? (
                  <Row gutter={ 48 }>
                    <Col span={ 8 }>
                      { image ?
                        <img width='160' src={image} />
                        :
                        <img width='160' src={unknown} />
                      }<br/><br/>
                      <h2><b>{ nick }</b></h2>
                      <h3><i><a target="_blank" style={{ color: 'MidnightBlue' }} href={id}>{id}</a></i></h3>
                      <br/>
                      <h4><b>Name:</b> { name }</h4>
                      <h4><b>Website:</b> { website }</h4>
                    </Col>
                    <Col span={ 16 }>
                      <Row>
                        <Col span={ 24 } >
                          <PostForm users={ users } addPost={ addPost } { ...this.props } />
                        </Col>
                      </Row>
                      <Row>
                        <Col span={ 24 } >
                          <PostsList posts={ users.posts } name={ nick } wallWebId={ wallWebId } { ...this.props } />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ) : (
                  <p text-align='center'>
                    No WebID selected. Please use the search input above or select a WebID from the browser
                  </p>
                )}
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
