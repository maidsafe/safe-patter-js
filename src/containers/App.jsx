import React from 'react';
// import PropTypes from 'prop-types';
import { withRouter, Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from '../actions/user_actions';

import styles from './global.css';
import HeaderComponent from '../components/Header/Header';
import Messager from '../components/Messager/Messager';
import List from '../components/List/List';

import PostForm from '../components/PostForm/PostForm';

import { Layout, Row, Col } from 'antd';

const { Content } = Layout;


class App extends React.Component
{
    render = () =>
    {
        const { user, match, addPost } = this.props;
        // console.log('app props', this.props)
        return (
            <div style={ {
                maxWidth : '800px',
                display  : 'block',
                margin   : '0 auto'
            } }
            >
                <Row
                    gutter={ {
                        xs : 8, sm : 16, md : 24, lg : 32
                    } }
                    type="flex"
                    justify="center"

                >
                    <Col span={ 24 }>
                        <Layout className={ styles.appContainer }>
                            <Route path="/" component={ HeaderComponent } />
                            <Content>
                                <Switch>
                                    <Route path="/message" render={ ( props ) => <Messager user={ user } { ...props } /> } />
                                    <Route path="/create/new" render={ ( props ) => <PostForm user={ user } addPost={ addPost } { ...props } /> } />
                                    <Route path="/timeline" render={ () => <List user={ user } /> } />
                                    <Route path="/" render={ () => <Redirect to="/timeline" /> } />

                                </Switch>
                            </Content>
                        </Layout>

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
        user : state.user
    };
}
export default withRouter( connect( mapStateToProps, mapDispatchToProps )( App ) );
