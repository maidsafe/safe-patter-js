import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { PATHS } from '../../constants';

const { Meta } = Card;


function timeSince( timeStamp )
{
console.log("TIME:", timeStamp)
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


class List extends React.Component
{
    static propTypes = {
        posts : PropTypes.array,
        inbox : PropTypes.array
    }
    static defaultProps = {
        posts : [],
        inbox : [],
    }


    render = () =>
    {
        const { posts, name, inbox } = this.props;

        const allPosts = [...posts, ...inbox];

        allPosts.sort( ( a, b ) => new Date(b.published) - new Date(a.published) );

        return (
            <div>
                <h2>Your Post Timeline, {name || ''}:</h2>
                <div style={ {
                    display       : 'flex',
                    flexDirection : 'column',
                    alignContent  : 'space-between'
                } }
                >
                    { allPosts.map( ( post, i ) =>
                    {
                        const theTimeSince = post.published ? timeSince( new Date(post.published) ) : '';

                        if ( post.content )
                        {
                            return ( <Card
                                hoverable
                                key={ i }
                                title={
                                    <div>
                                        {
                                            post.actor &&
                                            <div>From: {post.actor}</div>
                                        }
                                        <Meta description={ theTimeSince } />
                                    </div>
                                    }
                                    style={ { margin: '1rem' } }
                                >
                                  <Card
                                    title={ post.summary }
                                  >
                                  { post.content}
                                  </Card>
                                </Card>
                            );
                        }
                    } )}
                </div>
            </div>
        );
    }
}


export default List;
