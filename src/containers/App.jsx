import React from 'react';
// import PropTypes from 'prop-types';
import { withRouter, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as webIdsActions from '../actions/webIds_actions';

import styles from './global.css';
import Header from '../components/Header/Header';
import Editor from '../components/Editor/Editor';
import List from '../components/List/List';

import IdForm from '../components/IdForm/IdForm';


class App extends React.Component
{
    render = () =>
    {
        const { user, match } = this.props;

        return (

            <div className={ styles.appContainer }>
                <Route path="/" component={ Header } />
                <Switch>
                    <Route path="/edit" render={ (props) => <Editor user={ user } { ...props }/> } />
                    <Route path="/create/new" component={ IdForm } />
                    <Route path="/" render={ () => <List posts={ user.posts } /> } />
                </Switch>
            </div>
        );
    }
}


function mapDispatchToProps( dispatch )
{
    const actions =
    {
        ...webIdsActions,
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
