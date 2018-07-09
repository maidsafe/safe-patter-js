import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { PATHS } from '../../constants';
import { Layout, Form, Row, Col, Input, Button } from 'antd';

const { Header } = Layout;
const FormItem = Form.Item;

class HeaderComponent extends React.Component
{
  render = ( ) =>
  {
      const selectedKeys = [];
      const { user, switchWall, location } = this.props;
      const webId = user && user.webId;
      const wallWebId = user && user.wallWebId;

      // set menu as active on load if on a specific path
      Object.keys( PATHS ).forEach( path =>
      {
          location.pathname.startsWith( PATHS[path] ) ? selectedKeys.push( PATHS[path] ) : '';
      } );

      return (
          <div>
              <h1>Not Twitter</h1>
              <div>Logged in as: { webId ? `${webId.nick} (${webId['@id']})` : '<not selected>'}</div>
              <br /><br />
              <Form layout="vertical" onSubmit={ () => switchWall("safe://mywebid.gabriel") } >
                <FormItem
                  label={ wallWebId && wallWebId['@id'] }
                  extra="Enter a WebID URI to search"
                >
                  <Row gutter={8}>
                    <Col span={8}>
                      <Input />
                    </Col>
                    <Col span={8}>
                      <Button
                          htmlType="submit"
                          type="primary"
                      >Search
                      </Button>
                    </Col>
                  </Row>
                </FormItem>
              </Form>
              <h3>Name: { wallWebId && wallWebId.name }</h3>
              <h3>Nickname: { wallWebId && wallWebId.nick }</h3>
              <h3>Website: { wallWebId && wallWebId.website }</h3>
              <h3>Image: { wallWebId && wallWebId.image }</h3>
              <Menu mode="horizontal" selectedKeys={ selectedKeys }>
                  <Menu.Item key={ PATHS.TIMELINE }>
                      <NavLink to={ PATHS.TIMELINE } >Home</NavLink>
                  </Menu.Item>
                  <Menu.Item key={ PATHS.CREATE }>
                      <NavLink to={ PATHS.CREATE } >Create</NavLink>
                  </Menu.Item>
                  <Menu.Item key={ PATHS.MESSAGE }>
                      <NavLink to={ PATHS.MESSAGE } >Message</NavLink>
                  </Menu.Item>
              </Menu>
          </div>
      );
  };
};

export default HeaderComponent;
