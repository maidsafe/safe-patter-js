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
const mapPropsToFields = ( { post } ) => {
    if( !post ) return;

    return {
        text : Form.createFormField( {
            ...post,
            value : post.text || '',
        } )
    }
} ;

/**
 * Form for post creation/editing. Uses and design Form components (and form.create() method)
 * to create a form that can be easily validated/populated.
 * @extends React
 */
class PostForm extends React.Component
{
    static propTypes = {
        text : PropTypes.string,
        submit : PropTypes.func
    }
    static defaultProps = {
        text: 'Your not tweet here...',
        submit : ( values ) => console.log( 'Submisssion', values )
    }

    handleSubmit = ( e ) =>
    {
        const { addPost } = this.props;

        e.preventDefault();
        this.props.form.validateFields( ( err, values ) =>
        {
            if ( !err )
            {
                const postToAdd = { ...values };
                postToAdd.timestamp = Date.now();

                console.log( 'Received values of form: ', values );
                addPost( postToAdd )
            }
        } );
    }


    render = ( ) =>
    {
        const { getFieldDecorator } = this.props.form;

        const { id, submit } = this.props;
        return (
            <Form layout="vertical" onSubmit={ this.handleSubmit } >
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
