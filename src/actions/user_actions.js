import { createAction, createActions } from 'redux-actions';

export const TYPES = {
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
    name   : 'Not Twitter SAFE App',
    vendor : 'MaidSafe.net Ltd'
};

const unregisteredConn = async () => {
    const connReqUri = await safeApp.auth.genConnUri();
    const connUri = await window.safe.authorise( connReqUri );
    await safeApp.auth.loginFromUri( connUri );
}

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
    console.log("Signed in...")
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
    newPost.actorImage = webId.image;
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
    console.log( 'JSON-LD NEW POST:', serial );

    await postsRdf.append();

    // console.log("NEW POST:", newPost);
    return newPost;
};

const fetchWallWebId = async ( webIdUri ) =>
{
    console.log("FETCH WEBID:", webIdUri)
    const { serviceMd: webIdMd, type } = await safeApp.fetch( webIdUri );
    if ( type !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    // const serial = await webIdRdf.serialise();
    // console.log("Target WebID doc:", serial);

    const FOAF = webIdRdf.namespace( 'http://xmlns.com/foaf/0.1/' );
    let match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}#me` ), FOAF( 'name' ), undefined );
    const name = match[0].object.value;
    match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}#me` ), FOAF( 'nick' ), undefined );
    const nick = match[0].object.value;
    match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}#me` ), FOAF( 'website' ), undefined );
    const website = match[0].object.value;
    match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}#me` ), FOAF( 'image' ), undefined );
    const image = match[0].object.value;

    const SAFETERMS = webIdRdf.namespace( 'http://safenetwork.org/safevocab/' );
    match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}/posts` ), SAFETERMS( 'xorName' ), undefined );
    const xorName = match[0].object.value.split( ',' );
    match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}/posts` ), SAFETERMS( 'typeTag' ), undefined );
    const typeTag = parseInt( match[0].object.value );

    const wallWebId = {
        "@id": webIdUri,
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

const fetchWebIdImage = async ( webIdUri ) =>
{
    console.log("FETCH WEBID IMAGE:", webIdUri)
    const { serviceMd: webIdMd, type } = await safeApp.fetch( webIdUri );
    if ( type !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    const FOAF = webIdRdf.namespace( 'http://xmlns.com/foaf/0.1/' );
    const match = webIdRdf.statementsMatching( webIdRdf.sym( `${webIdUri}` ), FOAF( 'image' ), undefined );
    const image = match[0].object.value;
    return image;
};

const fetchWallPosts = async ( wallWebId ) =>
{
    const postsMd = await safeApp.mutableData.newPublic( wallWebId.posts.xorName, wallWebId.posts.typeTag );
    const postsRdf = postsMd.emulateAs( 'rdf' );
    await postsRdf.nowOrWhenFetched();
    postsRdf.setId(wallWebId['@id'])
    const serial = await postsRdf.serialise();
    console.log( "Wall's WebID profile doc:", serial );

    const keys = await postsMd.getKeys();
    const posts = [];
    const images = {};

    const ACTSTREAMS = postsRdf.namespace( 'https://www.w3.org/ns/activitystreams/' );
    return Promise.all(keys.map( ( key ) => new Promise((resolve, reject) => {
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

          if (images[actor]) {
              post.actorImage = images[actor]
              posts.push(post);
              return resolve();
          }

          return fetchWebIdImage(actor)
            .then((actorImage) => {
                images[actor] = actorImage;
                post.actorImage = actorImage;
                posts.push(post);
                return resolve();
            });
        })
    ))
    .then(() => {return posts});
};

export const {
    authorise,
    downgradeConn,
    addPost,
    setCurrentUser,
    switchWall,
    fetchPosts
} = createActions( {
    [TYPES.AUTHORISE] : async () =>
    {
        await authoriseApp();
        console.log( 'Getting info of current WebID:', webId  );
        const webId = { ...window.currentWebId };
        webId.posts = { ...window.currentWebId.posts };
        webId.posts.xorName = webId.posts.xorName.split(',');
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
        console.log( 'Getting info from Peruse for user:', webId  );
        await connect();

        const wallWebId = { ...webId };
        wallWebId.posts = { ...webId.posts };
        wallWebId.posts.xorName = webId.posts.xorName.split(',');
        wallWebId.posts.typeTag = parseInt( webId.posts.typeTag );

        const posts = await fetchWallPosts( wallWebId );

        return { webId: null, wallWebId, posts };
    },
    [TYPES.SWITCH_WALL] : async ( wallWebIdUri ) =>
    {
        console.log( "Wall's user changed. Fetch info from the SAFE Network for user:", wallWebIdUri );
        const wallWebId = await fetchWallWebId( wallWebIdUri );
        const posts = await fetchWallPosts( wallWebId );
        return { wallWebId, posts };
    },
    [TYPES.FETCH_POSTS] : async ( wallWebId ) =>
    {
        console.log( 'Fetch all posts for the wall\'s WebID from the SAFE Network:', wallWebId['@id'] );
        const posts = await fetchWallPosts( wallWebId );
        return posts;
    }
} );
