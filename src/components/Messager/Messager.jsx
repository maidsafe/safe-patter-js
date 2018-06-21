import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';

import PostForm from '../PostForm/PostForm';
// {
//     name: 'Josh1',
//     img : 'base6444',
//     inbox: {},
//     website: 'safe://some.tester',
//     pk : {}
// }


export default class Messager extends React.Component
{
    static propTypes =
    {
        // webIds : PropTypes.arrayOf( PropTypes.object ),
        match  : PropTypes.shape( { url: PropTypes.string } ).isRequired
    }

    static defaultProps =
    {
        webIds : []
    }

    render()
    {
        const { match } = this.props;
        // const { match, webIds } = this.props;
        // console.log( '>>>>>>>>>', this.props );
        return (
            <div className="wrapper">
                <Switch>
                    <Route
                        path={ `${match.url}/new` }
                        render={ ( props ) =>
                            ( <PostForm
                                { ...props }
                            /> )
                        }
                    />
                    <Route
                        path={ `${match.url}/:name` }
                        render={ ( props ) =>
                            ( <PostForm
                                { ...props }
                                to={ props.match.params.name  }
                            /> )
                        }
                    />
                    <Route path={ `${match.url}` } render={ () => <Redirect to={`${match.url}/new`} /> } />
                </Switch>
            </div>
        );
    }
}
