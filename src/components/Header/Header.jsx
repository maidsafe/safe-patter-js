import React from 'react';
import { Layout, Form, Row, Col, Input, Button, Avatar, Card, Icon, message } from 'antd';
import { Link } from 'react-router-dom';

const { Header } = Layout;
const FormItem = Form.Item;
const { Meta } = Card;
const Search = Input.Search;

class HeaderComponent extends React.Component
{
  state = {
      searchWebIdUri : '',
  }

  onChangeSearchUri = ( e ) =>
  {
      this.setState( { searchWebIdUri: e.target.value } );
  }

  handleSearch = async ( webIdUri ) =>
  {
      if ( webIdUri.length == 0 ) return;

      try
      {
          await this.props.switchWall( `safe://${webIdUri}` );
          this.setState( { searchWebIdUri: '' } );
          this.searchInput.blur();
      }
      catch ( err )
      {
          console.log( 'WebID entered not found:', err );
          message.error( 'WebID entered not found', 2 );
      }
  }

  render = ( ) =>
  {
      const selectedKeys = [];
      const { webId, location } = this.props;

      const image = webId && webId['#me'] && webId['#me'].image;
      const nick = webId && webId['#me'] && webId['#me'].nick;
      const id = webId && webId['#me'] && webId['#me']['@id'];

      return (
          <div style={{ backgroundColor: "#F0F8FF" }}>
              <Row type="flex" align="top" style={ { margin: '10px 0 30px 0' } } >
                  <Col span={ 15 }>
                      <Row>
                          <Link to="/"><h1>Patter</h1></Link>
                      </Row>
                      <Row>
                          <Search
                              addonBefore="safe://"
                              placeholder="navigate to a WebID URI's wall"
                              value={ this.state.searchWebIdUri }
                              onSearch={ this.handleSearch }
                              onChange={ this.onChangeSearchUri }
                              style={ { width: 330 } }
                              enterButton={ <Icon type="user" /> }
                              size="small"
                              ref={ node => this.searchInput = node }
                          />
                      </Row>
                  </Col>
                  <Col span={ 9 }>
                      <Row style={ { padding: 0 } }>
                          <Col span={ 17 }>
                              <Card
                                  style={ { width: 300 } }
                              >
                                  <Meta
                                      avatar={ image ?
                                          <Avatar src={ image } />
                                          : ( id ?
                                              ( <Avatar style={ { backgroundColor: 'gray', verticalAlign: 'middle' } } >
                                                  {nick ? nick.substring( 0, 1 ).toUpperCase() : ''}
                                              </Avatar> )
                                              : '' )
                                      }
                                      title={ nick || <br /> }
                                      description={ id || ( window.currentWebId
                                          ? 'Identify yourself to post messages'
                                          : 'Select a WebID from the browser'
                                      )
                                      }
                                  />
                              </Card>
                          </Col>
                          <Col span={ 7 } style={ { paddingTop: '5px' } }>
                              { webId ? (
                                  <Button size="small" type="danger" onClick={ this.props.downgradeConn }>
                                forget me
                                  </Button>
                              ) : (
                                  <Button disabled={ !window.currentWebId } size="small" type="primary" onClick={ this.props.authorise }>
                                id me
                                  </Button>
                              )}
                          </Col>
                      </Row>
                  </Col>
              </Row>
          </div>
      );
  };
}

export default HeaderComponent;
