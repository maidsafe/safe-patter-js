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
        text : Form.createFormField( {
            ...post,
            value : post.text || '',
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
        const { addPost, sendMessage } = this.props;

        e.preventDefault();
        this.props.form.validateFields( ( err, values ) =>
        {
            if ( !err )
            {
                const postToAdd = { ...values };
                postToAdd.timestamp = Date.now();

                console.log( 'Received values of form: ', values );
                if( this.recipientUnknown )
                {
                    return sendMessage( postToAdd );
                }
                addPost( postToAdd );
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
                    {getFieldDecorator( 'text', {
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
