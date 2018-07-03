import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'antd';
import Avatar from '../Avatar/Avatar';

const FormItem = Form.Item;

/**
 * Helper function for ant design forms to populate
 * the form with passed values.
 * @param  {Object} id post object
 */
const mapPropsToFields = ( { post } ) =>
{
    if ( !post ) return;

    return {
        content : Form.createFormField( {
            ...post,
            value : post.content || '',
        } )
    };
};

/**
 * Form for post creation/editing. Uses and design Form components (and form.create() method)
 * to create a form that can be easily validated/populated.
 * @extends React
 */
class PostForm extends React.Component
{
    static propTypes = {
        text   : PropTypes.string,
        to     : PropTypes.string
    }
    static defaultProps = {
        text   : 'Your not tweet here...'
    }

    handleSubmit = ( e ) =>
    {
        const { addPost, sendMessage, user } = this.props;

        e.preventDefault();
        this.props.form.validateFields( ( err, values ) =>
        {
            if ( !err )
            {
                const postToAdd = { ...values };
                const nowTimestamp = new Date();
                postToAdd.published = nowTimestamp.toISOString();

                console.log( 'Received values of form: ', values );
                if( this.recipientUnknown )
                {
                    return sendMessage( postToAdd );
                }
                addPost( user.webId, user.targetWebId, postToAdd );
            }
        } );
    }


    render = ( ) =>
    {
        const { getFieldDecorator } = this.props.form;

        const { to, match } = this.props;

        this.recipientUnknown = !to && match.url.startsWith( '/message' );

        return (
            <Form layout="vertical" onSubmit={ this.handleSubmit } >
                {
                    this.recipientUnknown &&
                        <FormItem label="To" >
                            {getFieldDecorator( 'to', {
                                rules : [{ required: true, message: 'Please select someone to message.' }],
                            } )( <Input
                                // and icons removed as attempts to access a font online
                                // prefix={ <Icon type="user" style={ { color: 'rgba(0,0,0,.25)' } } /> }
                                placeholder="Someone super important..."
                            /> )}
                        </FormItem>

                }
                <FormItem label="New Post" >
                    {getFieldDecorator( 'summary', {
                        rules : [{ required: true, message: 'Please input a title' }],
                    } )( <Input
                        // and icons removed as attempts to access a font online
                        // prefix={ <Icon type="user" style={ { color: 'rgba(0,0,0,.25)' } } /> }
                        placeholder="A summary..."
                    /> )}
                    {getFieldDecorator( 'content', {
                        rules : [{ required: true, message: 'Please input some text!' }],
                    } )( <Input.TextArea
                        // and icons removed as attempts to access a font online
                        // prefix={ <Icon type="user" style={ { color: 'rgba(0,0,0,.25)' } } /> }
                        placeholder="Something super important..."
                    /> )}
                </FormItem>
                {/* <Form.Item type="input" label="inbox">
                        <Input defaultValue={ id.inbox } />
                    </Form.Item> */}
                <Button
                    htmlType="submit"
                    type="primary"
                >Post
                </Button>
            </Form>
        );
    }
}

const WrappedPostForm = Form.create( { mapPropsToFields } )( PostForm );

export default WrappedPostForm;
