import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { PATHS } from '../../constants';
import { Layout, Form, Row, Col, Input, Button, Avatar, Card, Switch } from 'antd';

const { Header } = Layout;
const FormItem = Form.Item;
const { Meta } = Card;
const Search = Input.Search;

class HeaderComponent extends React.Component
{

  render = ( ) =>
  {
      const selectedKeys = [];
      const { webId, location } = this.props;

      return (
          <div>
              <Row type='flex' align='bottom' style={{ margin: '10px 0px 20px 0px' }}>
                  <Col span={ 15 }>
                    <Row>
                      <h1>Not Twitter</h1>
                    </Row>
                    <Row>
                      <Search
                         placeholder="enter a WebID URI to search"
                         onSearch={ this.props.switchWall }
                         style={{ width: 270 }}
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
                                avatar={ (webId && webId.image) ? <Avatar src={ webId.image } /> : '' }
                                title={ (webId && webId.nick) ? webId.nick : '<Not signed>' }
                                description={ (webId && webId['@id']) ? webId['@id'] : '' }
                              />
                            </Card>
                          </Col>
                          <Col span={ 7 } style={{ paddingTop: '5px' }}>
                            { webId ? (
                              <Button size='small' type='danger' onClick={ this.props.downgradeConn }>
                                Sign out
                              </Button>
                            ) : (
                              <Button size='small' type='primary' onClick={ this.props.authorise }>
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
