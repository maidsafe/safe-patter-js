import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, List } from 'antd';
import { PATHS } from '../../constants';

const IdList = ( props ) =>
    (
        <div>
            <h2>Your Post History:</h2>
            <List>
                { props.posts.map( ( post, i ) => (
                    <List.Item key={ i }>
                        { post.text}
                    </List.Item>
                ) )}
            </List>
        </div>
    );

export default IdList;
