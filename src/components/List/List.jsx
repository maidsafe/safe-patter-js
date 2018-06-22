import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { PATHS } from '../../constants';

const { Meta } = Card;


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

        allPosts.sort( ( a, b ) => b.timestamp - a.timestamp );


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
                        const theTimeSince = post.timestamp ? timeSince( post.timestamp ) : '';

                        if ( post.text )
                        {
                            return ( <Card
                                hoverable
                                key={ i }
                                title={
                                    <div>
                                        {
                                            post.from &&
                                            <div>From: {post.from}</div>
                                        }
                                        <Meta description={ theTimeSince } />
                                    </div>
                                    }
                                    style={ { margin: '1rem' } }
                                >
                                { post.text}
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
