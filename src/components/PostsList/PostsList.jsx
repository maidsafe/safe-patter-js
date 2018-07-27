import React from 'react';
import PropTypes from 'prop-types';
import { List, Card, Avatar, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';

function timeSince( timeStamp )
{
    if ( !timeStamp ) return '';

    const timeStampDate = new Date( timeStamp );

    const now = new Date();
    const secondsPast = ( now.getTime() - timeStampDate.getTime() ) / 1000;
    let day;
    let month;
    let year;

    if ( secondsPast < 60 )
    {
        return `${parseInt( secondsPast )}s ago.`;
    }
    if ( secondsPast < 3600 )
    {
        return `${parseInt( secondsPast / 60 )}m ago.`;
    }
    if ( secondsPast <= 86400 )
    {
        return `${parseInt( secondsPast / 3600 )}h ago.`;
    }
    if ( secondsPast > 86400 )
    {
        day = timeStampDate.getDate();
        month = timeStampDate.toDateString().match( / [a-zA-Z]*/ )[0].replace( ' ', '' );
        year = timeStampDate.getFullYear() == now.getFullYear() ? '' : ` ${timeStampDate.getFullYear()}`;
        return `${day} ${month}${year}`;
    }
}


class PostsList extends React.Component
{
    state = {
        reloading : false
    }
    static propTypes = {
        posts : PropTypes.array
    }

    static defaultProps = {
        posts : []
    }

    handleReload = async () =>
    {
        const { fetchPosts, webId } = this.props;
        this.setState( { reloading: true } );
        await fetchPosts( webId );
        this.setState( { reloading: false } );
    }

    render = () =>
    {
        const { posts, name } = this.props;

        const allPosts = [...posts];

        allPosts.sort( ( a, b ) => new Date( b.published ) - new Date( a.published ) );

        return (
            <div>
                <Row>
                    <Col span={ 12 }><h2>{name || ''}'s posts timeline</h2></Col>
                    <Col span={ 2 } offset={ 10 }>
                        <Button
                            disabled={ allPosts.length == 0 }
                            shape="circle"
                            size="small"
                            icon="sync"
                            loading={ !!this.state.reloading }
                            onClick={ this.handleReload }
                        />
                    </Col>
                </Row>

                <List
                    itemLayout="horizontal"
                    dataSource={ allPosts }
                    renderItem={ item => (
                        <List.Item>
                            <List.Item.Meta span={15} style={{ width: "100%", border: "1px solid blue" }}
                                avatar={ item.actorImage ?
                                    <Avatar size="small" src={ item.actorImage } />
                                    :
                                    <Avatar style={ { backgroundColor: 'gray', verticalAlign: 'middle' } } >
                                        {item.actorNick.substring( 0, 1 ).toUpperCase()}
                                    </Avatar>
                                }
                                title={
                                    <div>
                                        <b>{item.actorNick}</b>
                                    <i>(<Link
                                        // target="_blank"
                                        style={ { color: 'MidnightBlue' } }
                                        to={ `/profile/${item.actor.replace('safe://', '').replace('#me', '')}` }>{item.actor}</Link>
                                    )
                                    </i>
                                </div>
                                }
                                description={
                                    <div style={{ border: "1px solid red" }}>
                                        <Row span={15}>
                                            {item.summary}
                                        </Row>
                                        <Row span={15}>
                                            {item.content}
                                        </Row>
                                    </div>
                                }
                            />
                            <div style={{ border: "1px solid red" }}>{ item.published ? timeSince( new Date( item.published ) ) : '' }</div>
                        </List.Item>
                    ) }
                />
            </div>
        );
    }
}

export default PostsList;
