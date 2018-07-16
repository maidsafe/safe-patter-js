import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { PATHS } from '../../constants';
import { Layout, Form, Row, Col, Input, Button, Avatar, Card, Switch, notification } from 'antd';

const { Header } = Layout;
const FormItem = Form.Item;
const { Meta } = Card;
const Search = Input.Search;

class HeaderComponent extends React.Component
{
  handleSearch = async ( webIdUri ) =>
  {
      try {
          await this.props.switchWall(`safe://${webIdUri}`);
      } catch (err) {
          console.log("WebID entered not found:", err);
          //FIXME: we need to include the icons files with the site for this to work
          /*notification.open({
              message: 'WebID entered not found',
              description: 'Verify that the WebID entered is correct and try again',
              duration: 5,
          });*/
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
          <div>
              <Row type='flex' align='bottom' style={{ margin: '10px 0 30px 0' }} >
                  <Col span={ 15 }>
                    <Row>
                      <h1>Not Twitter</h1>
                    </Row>
                    <Row>
                      <Search
                         addonBefore="safe://"
                         placeholder="enter a WebID URI to search"
                         onSearch={ this.handleSearch }
                         style={{ width: 330 }}
                         enterButton="Search"
                         size="small"
                       />
                    </Row>
                  </Col>
                  <Col span={ 9 }>
                      <Row style={{ padding: 0 }}>
                          <Col span={ 17 }>
                            <Card
                              style={{ width: 300 }}
                            >
                              <Meta
                                avatar={ image ?
                                  <Avatar src={image} />
                                  : ( id ?
                                      (<Avatar style={{ backgroundColor: 'gray', verticalAlign: 'middle' }} >
                                        {nick ? nick.substring(0, 1).toUpperCase() : ''}
                                      </Avatar>)
                                    : '' )
                                }
                                title={ nick ? nick : <span>&nbsp;</span> }
                                description={ id ? id :
                                  (window.currentWebId
                                    ? 'Sign in to be able to post messages'
                                    : 'Select a WebID from the browser'
                                  )
                                }
                              />
                            </Card>
                          </Col>
                          <Col span={ 7 } style={{ paddingTop: '5px' }}>
                            { webId ? (
                              <Button size='small' type='danger' onClick={ this.props.downgradeConn }>
                                Sign out
                              </Button>
                            ) : (
                              <Button disabled={ window.currentWebId ? false : true } size='small' type='primary' onClick={ this.props.authorise }>
                                Sign in
                              </Button>
                            )}
                          </Col>
                      </Row>
                  </Col>
              </Row>
          </div>
      );
  };
};

export default HeaderComponent;
