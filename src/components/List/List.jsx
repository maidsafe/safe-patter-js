import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { PATHS } from '../../constants';

const { Meta } = Card;


function timeSince( timeStamp )
{
    const timeStampDate = new Date( timeStamp );

    let now = new Date(),
        secondsPast = ( now.getTime() - timeStampDate.getTime() ) / 1000;
    if ( secondsPast < 60 )
    {
        return `${parseInt( secondsPast )}s`;
    }
    if ( secondsPast < 3600 )
    {
        return `${parseInt( secondsPast / 60 )}m`;
    }
    if ( secondsPast <= 86400 )
    {
        return `${parseInt( secondsPast / 3600 )}h`;
    }
    if ( secondsPast > 86400 )
    {
        day = timeStampDate.getDate();
        month = timeStampDate.toDateString().match( / [a-zA-Z]*/ )[0].replace( ' ', '' );
        year = timeStampDate.getFullYear() == now.getFullYear() ? '' : ` ${timeStampDate.getFullYear()}`;
        return `${day} ${month}${year}`;
    }
}


const IdList = ( props ) =>
{
    const { user } = props;
    const { posts, inbox } = user;

    const allPosts = [...posts, ...inbox];

    allPosts.sort( ( a, b ) => b.timestamp - a.timestamp );

    return (
        <div>
            <h2>Your Post Timeline, {user ? user.name : ''}:</h2>
            <div style={ {
                display       : 'flex',
                flexDirection : 'column',
                alignContent  : 'space-between'
            } }
            >
                { allPosts.map( ( post, i ) => (
                    <Card
                        hoverable
                        key={ i }
                        title={
                            <div>
                                {
                                    post.from &&
                                    <div>From: {post.from}</div>
                                }
                                <Meta description={ `${timeSince( post.timestamp )} ago.` } />
                            </div>
                        }
                        style={ { margin: '1rem' } }
                    >

                        { post.text}
                    </Card>
                ) )}
            </div>
        </div>
    );
};

export default IdList;
