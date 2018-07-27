import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    CONNECT_TO_NET   : 'CONNECT_TO_NET',
    AUTHORISE        : 'AUTHORISE',
    DOWNGRADE_CONN   : 'DOWNGRADE_CONN',
    ADD_POST         : 'ADD_POST',
    SET_CURRENT_USER : 'SET_CURRENT_USER',
    SWITCH_WALL      : 'SWITCH_WALL',
    FETCH_POSTS      : 'FETCH_POSTS'
};

let safeApp = null;
const appInfo = {
    id     : 'net.maidsafe.example',
    name   : 'Patter',
    vendor : 'MaidSafe.net Ltd'
};

const unregisteredConn = async () =>
{
    const connReqUri = await safeApp.auth.genConnUri();
    const connUri = await window.safe.authorise( connReqUri );
    await safeApp.auth.loginFromUri( connUri );
};

const connect = async () =>
{
    if ( safeApp !== null && safeApp.isNetStateConnected() ) return;

    console.log( 'Connecting to the network...' );
    safeApp = await window.safe.initialiseApp( appInfo );
    await unregisteredConn();
    console.log( 'Read-only connection created...' );
};

const authoriseApp = async () =>
{
    console.log( 'Authorising application...' );
    const authReqUri = await safeApp.auth.genAuthUri();
    const authUri = await window.safe.authorise( authReqUri );
    await safeApp.auth.loginFromUri( authUri );
    console.log( 'Signed in...' );
};

const postNewPost = async ( webId, wallWebId, newPost ) =>
{
    // Now we can add the post in the posts container
    console.log( 'ADDING POST TO:', wallWebId );

    const postsMd =
        await safeApp.mutableData.newPublic( wallWebId.posts.xorName, wallWebId.posts.typeTag );
    const postsRdf = postsMd.emulateAs( 'rdf' );

    const graphId = `${wallWebId['@id']}/posts`;
    newPost.id = `${graphId}/${Math.round( Math.random() * 100000 )}`;
    newPost.actor = webId['#me']['@id'];
    newPost.actorImage = webId['#me'].image;
    newPost.actorNick = webId['#me'].nick;
    const id = postsRdf.sym( newPost.id );
    postsRdf.setId( graphId );
    console.log( 'GRAPH ID:', graphId );

    const ACTSTREAMS = postsRdf.namespace( 'https://www.w3.org/ns/activitystreams/' );

    postsRdf.add( id, ACTSTREAMS( 'type' ), postsRdf.literal( 'Note' ) );
    postsRdf.add( id, ACTSTREAMS( 'attributedTo' ), postsRdf.literal( webId['#me']['@id'] ) );
    postsRdf.add( id, ACTSTREAMS( 'summary' ), postsRdf.literal( newPost.summary ) );
    postsRdf.add( id, ACTSTREAMS( 'published' ), postsRdf.literal( newPost.published ) );
    postsRdf.add( id, ACTSTREAMS( 'content' ), postsRdf.literal( newPost.content ) );

    const serial = await postsRdf.serialise();
    console.log( 'NEW POST:', serial );

    await postsRdf.append();

    // console.log("NEW POST:", newPost);
    return newPost;
};

const fetchWallWebId = async ( webIdUri ) =>
{
    console.log( 'FETCH WALL WEBID:', webIdUri );
    const { serviceMd: webIdMd, type } = await safeApp.fetch( webIdUri );
    if ( type !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const entries = await webIdMd.getEntries();
    const list = await entries.listEntries();
    list.forEach( ( e ) =>
    {
        console.log( 'WEBID ENTRY:', e.key.toString(), e.value.buf.toString() );
    } );

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    const serial = await webIdRdf.serialise( 'application/ld+json' );
    console.log( 'Target WebID doc:', serial );

    const baseUri = webIdUri.split( '#' )[0];
    const webIdGraph = `${baseUri}#me`;
    const postsGraph = `${baseUri}/posts`;
    const FOAF = webIdRdf.namespace( 'http://xmlns.com/foaf/0.1/' );

    const nameMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'name' ), undefined );
    const name = nameMatch[0] && nameMatch[0].object.value;
    const nickMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'nick' ), undefined );
    const nick = nickMatch[0] && nickMatch[0].object.value;
    const websiteMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'website' ), undefined );
    const website = websiteMatch[0] && websiteMatch[0].object.value;
    const imageMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'image' ), undefined );
    const image = imageMatch[0] && imageMatch[0].object.value;

    const SAFETERMS = webIdRdf.namespace( 'http://safenetwork.org/safevocab/' );
    const xornameMatch = webIdRdf.statementsMatching( webIdRdf.sym( postsGraph ), SAFETERMS( 'xorName' ), undefined );
    const xorName = xornameMatch[0].object.value.split( ',' );
    const typetagMatch = webIdRdf.statementsMatching( webIdRdf.sym( postsGraph ), SAFETERMS( 'typeTag' ), undefined );
    const typeTag = parseInt( typetagMatch[0].object.value );

    const wallWebId = {
        '@id' : baseUri,
        '#me' : {
            '@id' : webIdGraph,
            name,
            nick,
            website,
            image
        },
        posts : {
            xorName,
            typeTag
        }
    };
    return wallWebId;
};

const fetchActorWebId = async ( webIdUri ) =>
{
    const { serviceMd: webIdMd, type } = await safeApp.fetch( webIdUri );
    if ( type !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    const FOAF = webIdRdf.namespace( 'http://xmlns.com/foaf/0.1/' );
    const nickMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdUri ), FOAF( 'nick' ), undefined );
    const nick = nickMatch[0].object.value;
    const imageMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdUri ), FOAF( 'image' ), undefined );
    const image = imageMatch[0] && imageMatch[0].object.value;
    return { image, nick };
};

const fetchWallPosts = async ( wallWebId ) =>
{
    const postsMd = await safeApp.mutableData.newPublic( wallWebId.posts.xorName, wallWebId.posts.typeTag );
    const entries = await postsMd.getEntries();
    const list = await entries.listEntries();
    list.forEach( ( e ) =>
    {
        console.log( 'POSTS ENTRY:', e.key.toString(), e.value.toString() );
    } );
    const postsRdf = postsMd.emulateAs( 'rdf' );
    await postsRdf.nowOrWhenFetched();
    postsRdf.setId( wallWebId['@id'] );

    const serial = await postsRdf.serialise();
    console.log( 'Posts RDF:', serial );

    const keys = await postsMd.getKeys();
    const posts = [];
    const webIdsCache = {};

    const ACTSTREAMS = postsRdf.namespace( 'https://www.w3.org/ns/activitystreams/' );
    return Promise.all( keys.map( ( key ) => new Promise( ( resolve, reject ) =>
    {
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

        if ( webIdsCache[actor] )
        {
            post.actorImage = webIdsCache[actor].image;
            post.actorNick = webIdsCache[actor].nick;
            posts.push( post );
            return resolve();
        }

        return fetchActorWebId( actor )
            .then( ( actorWebId ) =>
            {
                webIdsCache[actor] = actorWebId;
                post.actorImage = webIdsCache[actor].image;
                post.actorNick = webIdsCache[actor].nick;
                posts.push( post );
                return resolve();
            } );
    } ) ) )
        .then( () =>
            posts );
};

export const {
    connectToNet,
    authorise,
    downgradeConn,
    addPost,
    setCurrentUser,
    switchWall,
    fetchPosts
} = createActions( {
    [TYPES.CONNECT_TO_NET] : async () =>
    {
        await connect();
        console.log( 'Current webId?: ', window.currentWebId );
        if ( window.currentWebId )
        {
            const wallWebId = { ...window.currentWebId };
            wallWebId.posts = { ...window.currentWebId.posts };
            wallWebId.posts.xorName = window.currentWebId.posts.xorName.split( ',' );
            wallWebId.posts.typeTag = parseInt( window.currentWebId.posts.typeTag );
            const posts = await fetchWallPosts( wallWebId );

            return { webId: null, wallWebId, posts };
        }

        return { webId: null, wallWebId: null, posts: [] };
    },
    [TYPES.AUTHORISE] : async () =>
    {
        await authoriseApp();
        console.log( 'Getting info of current WebID:', window.currentWebId );
        const webId = { ...window.currentWebId };
        webId.posts = { ...window.currentWebId.posts };
        webId.posts.xorName = webId.posts.xorName.split( ',' );
        webId.posts.typeTag = parseInt( webId.posts.typeTag );

        return webId;
    },
    [TYPES.DOWNGRADE_CONN] : async () =>
    {
        await unregisteredConn();
    },
    [TYPES.ADD_POST] : async ( webId, wallWebId, post ) =>
    {
        const newPost = await postNewPost( webId, wallWebId, post );
        return newPost;
    },
    [TYPES.SET_CURRENT_USER] : async ( webId ) =>
    {
        await connect();
        console.log( 'Getting info from Peruse for user:', webId );

        const wallWebId = { ...webId };
        wallWebId.posts = { ...webId.posts };
        wallWebId.posts.xorName = webId.posts.xorName.split( ',' );
        wallWebId.posts.typeTag = parseInt( webId.posts.typeTag );

        let webIdClone;
        if ( safeApp.auth.registered )
        {
            console.log( 'Switching the signed-in WebID also to:', webId );
            webIdClone = { ...webId };
            webIdClone.posts = { ...webId.posts };
            webIdClone.posts.xorName = webId.posts.xorName.split( ',' );
            webIdClone.posts.typeTag = parseInt( webId.posts.typeTag );
        }

        const posts = await fetchWallPosts( wallWebId );

        return { webId: webIdClone, wallWebId, posts };
    },
    [TYPES.SWITCH_WALL] : async ( wallWebIdUri ) =>
    {
        console.log( "Wall's user changed. Fetch info from the SAFE Network for user:", wallWebIdUri );
        const wallWebId = await fetchWallWebId( wallWebIdUri );
        const posts = await fetchWallPosts( wallWebId );
        return { wallWebId, posts, error: null };
    },
    [TYPES.FETCH_POSTS] : async ( wallWebId ) =>
    {
        console.log( 'Fetch all posts for the wall\'s WebID from the SAFE Network:', wallWebId['@id'] );
        const posts = await fetchWallPosts( wallWebId );
        return posts;
    }
} );
