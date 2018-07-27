import React from 'react';
import { Layout, Form, Row, Col, Input, Button, Avatar, Card, Icon, message } from 'antd';
// import Messager from '../components/Messager/Messager';
import PostsList from '../PostsList/PostsList';
import PostForm from '../PostForm/PostForm';
import unknown from '../../../public/unknown.jpg';


class WallComponent extends React.Component
{
    state = {
        searchWebIdUri : '',
    }

    componentDidMount = ( ) =>
    {
        const { match, users } = this.props;

        if ( !users.connected ) return;

        this.checkAndLoadProfile( match );
    }

    componentWillReceiveProps = ( newProps ) =>
    {
        const { match, users } = newProps;

        if ( !users.connected ) return;

        this.checkAndLoadProfile( match );
    }

    checkAndLoadProfile = ( match ) =>
    {
        const { switchWall } = this.props;

        if ( !switchWall ) return;

        if ( !match || !match.params || !match.params.uri )
        {
            if ( !window.currentWebId ) return;

            const windowIdUri = window.currentWebId['#me']['@id'];

            if ( windowIdUri !== this.fetchingProfile )
            {
                this.fetchingProfile = windowIdUri;
                switchWall( `${windowIdUri}` );
            }
            return;
        }

        const theUri = `safe://${match.params.uri}#me`;

        if ( theUri !== this.fetchingProfile )
        {
            this.fetchingProfile = theUri;

            switchWall( `${theUri}` );
        }
    }

  render = ( ) =>
  {
      const { webId, users, addPost } = this.props;

      const image = webId && webId['#me'] && webId['#me'].image;
      const nick = webId && webId['#me'] && webId['#me'].nick;
      const id = webId && webId['#me'] && webId['#me']['@id'];
      const name = webId && webId['#me'] && webId['#me'].name;
      const website = webId && webId['#me'] && webId['#me'].website;

      return (
          <div>
              { webId ? (
                  <Row gutter={ 48 }>
                      <Col span={ 8 }>
                          { image ?
                              <img width="160" src={ image } />
                              :
                              <img width="160" src={ unknown } />
                          }<br /><br />
                          <h2><b>{ nick }</b></h2>
                          <h3><i><a target="_blank" style={ { color: 'MidnightBlue' } } href={ id }>{id}</a></i></h3>
                          <br />
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
                                  <PostsList posts={ users.posts } name={ nick } webId={ webId } { ...this.props } />
                              </Col>
                          </Row>
                      </Col>
                  </Row>
              ) : (
                  <p text-align="center">
                  No WebID selected. Please use the search input above or select a WebID from the browser
                  </p>
              )}
          </div>
      );
  };
}

export default WallComponent;
