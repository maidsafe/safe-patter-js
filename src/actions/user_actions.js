import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    CONNECT_TO_NET   : 'CONNECT_TO_NET',
    ADD_POST         : 'ADD_POST',
    SET_CURRENT_USER : 'SET_CURRENT_USER',
    SWITCH_WALL      : 'SWITCH_WALL',
    SEND_MESSAGE     : 'SEND_MESSAGE',
    FETCH_POSTS      : 'FETCH_POSTS'
};

let safeApp = null;

const connect = async () =>
{
    if ( safeApp !== null && safeApp.isNetStateConnected() ) return;

    console.log( 'Connecting to the network...' );
    const appInfo = {
        id     : 'net.maidsafe.example',
        name   : 'Not Twitter SAFE App',
        vendor : 'MaidSafe.net Ltd'
    };

    safeApp = await window.safe.initialiseApp( appInfo );
    const authReqUri = await safeApp.auth.genAuthUri();
    const authUri = await window.safe.authorise( authReqUri );
    await safeApp.auth.loginFromUri( authUri );
};

const postNewPost = async ( webId, wallWebId, newPost ) =>
{
    // Now we can add the post in the posts container
    const postsContainer =
        await safeApp.mutableData.newPublic( wallWebId.posts.xorName, wallWebId.posts.typeTag );
    const postsRdf = postsContainer.emulateAs( 'rdf' );

    const graphId = `${wallWebId['@id']}/posts`;
    newPost.id = `${graphId}/${Math.round( Math.random() * 100000 )}`;
    newPost.actor = webId['@id'];
    const id = postsRdf.sym( newPost.id );
    console.log( 'GRAPH ID:', graphId );
    postsRdf.setId( graphId );

    const ACTSTREAMS = postsRdf.namespace( 'https://www.w3.org/ns/activitystreams/' );

    postsRdf.add( id, ACTSTREAMS( 'type' ), postsRdf.literal( 'Note' ) );
    postsRdf.add( id, ACTSTREAMS( 'attributedTo' ), postsRdf.literal( webId['@id'] ) );
    postsRdf.add( id, ACTSTREAMS( 'summary' ), postsRdf.literal( newPost.summary ) );
    postsRdf.add( id, ACTSTREAMS( 'published' ), postsRdf.literal( newPost.published ) );
    postsRdf.add( id, ACTSTREAMS( 'content' ), postsRdf.literal( newPost.content ) );

    const serial = await postsRdf.serialise( 'application/ld+json' );
    console.log( 'SERIAL NEW POST:', serial );

    await postsRdf.append();

    // console.log("NEW POST:", newPost);
    return newPost;
};

const fetchWallWebId = async ( webIdUri ) =>
{
    const { serviceMd: webIdMd, type } = await safeApp.fetch( webIdUri );
    if ( type !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const postsRdf = webIdMd.emulateAs( 'rdf' );
    await postsRdf.nowOrWhenFetched();

    // const serial = await postsRdf.serialise();
    // console.log("Target WebID doc:", serial);

    const FOAF = postsRdf.namespace( 'http://xmlns.com/foaf/0.1/' );
    let match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}#me` ), FOAF( 'name' ), undefined );
    const name = match[0].object.value;
    match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}#me` ), FOAF( 'nick' ), undefined );
    const nick = match[0].object.value;
    match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}#me` ), FOAF( 'website' ), undefined );
    const website = match[0].object.value;
    match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}#me` ), FOAF( 'image' ), undefined );
    const image = match[0].object.value;

    const SAFETERMS = postsRdf.namespace( 'http://safenetwork.org/safevocab/' );
    match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}/posts` ), SAFETERMS( 'xorName' ), undefined );
    const xorName = match[0].object.value.split( ',' );
    match = postsRdf.statementsMatching( postsRdf.sym( `${webIdUri}/posts` ), SAFETERMS( 'typeTag' ), undefined );
    const typeTag = parseInt( match[0].object.value );

    const wallWebId = {
        id    : webIdUri,
        name,
        nick,
        website,
        image,
        posts : {
            xorName,
            typeTag
        }
    };
    return wallWebId;
};

const fetchWallPosts = async ( wallWebId ) =>
{
    const postsMd = await safeApp.mutableData.newPublic( wallWebId.posts.xorName, wallWebId.posts.typeTag );
    const entries = await postsMd.getEntries();
    const list = await entries.listEntries();
    list.forEach( ( e ) =>
    {
        console.log( 'LIST:', e.key.toString(), e.value.buf.toString() );
    } );

    const postsRdf = postsMd.emulateAs( 'rdf' );
    await postsRdf.nowOrWhenFetched();
    postsRdf.setId(wallWebId['@id'])
    const serial = await postsRdf.serialise();
    console.log( 'Target WebID doc:', serial );

    const keys = await postsMd.getKeys();
    const posts = [];

    const ACTSTREAMS = postsRdf.namespace( 'https://www.w3.org/ns/activitystreams/' );
    keys.forEach( ( key ) =>
    {
        // console.log("KEYS:", key.toString())
        const id = key.toString();
        let match = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'type' ), undefined );
        const type = match[0].object.value;
        match = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'attributedTo' ), undefined );
        const actor = match[0].object.value;
        match = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'published' ), undefined );
        const published = match[0].object.value;
        match = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'summary' ), undefined );
        const summary = match[0].object.value;
        match = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'content' ), undefined );
        const content = match[0].object.value;
        const post = {
            id,
            type,
            actor,
            published,
            summary,
            content
        };
        posts.push( post );
    } );
    return posts;
};

export const {
    connectToNet,
    addPost,
    setCurrentUser,
    switchWall,
    sendMessage,
    fetchPosts
} = createActions( {
    [TYPES.CONNECT_TO_NET] : async () =>
    {
        await connect();
    },
    [TYPES.ADD_POST] : async ( webId, wallWebId, post ) =>
    {
        const newPost = await postNewPost( webId, wallWebId, post );
        return newPost;
    },
    [TYPES.SET_CURRENT_USER] : async ( webId ) =>
    {
/*        webId = {
          "@id": "safe://mywebid.gabriel#me",
          "@type": "http://xmlns.com/foaf/0.1/Person",
          image: "data:image/jpeg;base64",
          name: "gabriel",
          nick: "bochaco",
          website: "safe://bla.com",
          posts: {
            "@id": "safe://asdadadsad/posts",
            "@type": "http://safenetwork.org/safevocab/Posts",
            title: "Container for social apps posts",
            typeTag: "303030",
            xorName: "194,220,162,140,187,247,45,216,106,62,249,77,72,51,146,34,78,83,55,19,193,179,16,107,81,10,186,242,253,50,167,111"
          }
        };*/

        console.log( 'Getting info from Peruse for user:', webId  );
        await connect();
        webId.posts.xorName = webId.posts.xorName.split(',');
        webId.posts.typeTag = parseInt( webId.posts.typeTag );
        const wallWebId = { ...webId };
        const posts = await fetchWallPosts( wallWebId ); // TODO: trigger the FETCH_POSTS actions instead

        return { webId, wallWebId, posts };
    },
    [TYPES.SWITCH_WALL] : async ( wallWebIdUri ) =>
    {
        console.log( 'Target user changed. Fetch info from the SAFE Network for user:', wallWebIdUri );
        const wallWebId = await fetchWallWebId( wallWebIdUri );
        const posts = await fetchWallPosts( wallWebId ); // TODO: trigger the FETCH_POSTS actions instead
        return { wallWebId, posts };
    },
    [TYPES.FETCH_POSTS] : async ( wallWebId ) =>
    {
        console.log( 'Fetch all posts for the wall\'s WebID from the SAFE Network:', wallWebId['@id'] );
        const posts = await fetchWallPosts( wallWebId );
        return posts;
    },
    [TYPES.SEND_MESSAGE] : async ( wallWebIdUri ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for sending a message...' );
            resolve( wallWebIdUri );
        } );

        await x;

        return x;
    },
} );
