import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, List } from 'antd';
import { PATHS } from '../../constants';

const IdList = ( props ) =>
{
    const posts = props.posts;
    posts.sort( ( a, b) => b.timestamp - a.timestamp);

    return (
        <div>
            <h2>Your Post History:</h2>
            <List>
                { posts.map( ( post, i ) => (
                    <List.Item key={ i }>
                        { post.text}
                    </List.Item>
                ) )}
            </List>
        </div>
    );
}

export default IdList;
