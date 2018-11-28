import mime from 'mime';
import nodePath from 'path';
import { createAction, createActions } from 'redux-actions';
import { message } from 'antd';

const ACTIVITYSTREAMS_VOCAB_URL = 'https://www.w3.org/ns/activitystreams/';

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

    try {
      await safeApp.fetch();
    } catch (err) {
      if (err.code === 1021) {
        message.error('The experimental APIs are disabled, please enable them from the SAFE Browser');
      }
    }
};

const authoriseApp = async () =>
{
    console.log( 'Authorising application...' );
    const authReqUri = await safeApp.auth.genAuthUri();
    const authUri = await window.safe.authorise( authReqUri );
    await safeApp.auth.loginFromUri( authUri );
    console.log( 'Signed in...' );
};

const fetchPostsMd = async ( webId ) =>
{
    let postsMd;
    if (webId['#me'].inbox) {
      const { content } = await safeApp.fetch(webId['#me'].inbox);
      postsMd = content;
    } else {
      // fallback to old format for posts link
      postsMd = await safeApp.mutableData.newPublic( webId.posts.xorName, webId.posts.typeTag );
    }
    return postsMd;
};

const postNewPost = async ( webId, wallWebId, newPost ) =>
{
    // Now we can add the post in the posts container
    console.log( 'ADDING POST TO:', wallWebId );

    const postsMd = await fetchPostsMd( wallWebId );
    const postsRdf = postsMd.emulateAs( 'rdf' );

    const graphId = `${wallWebId['@id']}/posts`;
    newPost.id = `${graphId}/${Math.round( Math.random() * 100000 )}`;
    newPost.actor = webId['#me']['@id'];
    newPost.actorImage = webId['#me'].image;
    newPost.actorNick = webId['#me'].nick;
    const id = postsRdf.sym( newPost.id );
    postsRdf.setId( graphId );
    console.log( 'GRAPH ID:', graphId );

    const ACTSTREAMS = postsRdf.namespace( ACTIVITYSTREAMS_VOCAB_URL );

    postsRdf.add( id, ACTSTREAMS( 'type' ), postsRdf.literal( 'Note' ) );
    postsRdf.add( id, ACTSTREAMS( 'attributedTo' ), postsRdf.sym( webId['#me']['@id'] ) );
    postsRdf.add( id, ACTSTREAMS( 'summary' ), postsRdf.literal( newPost.summary ) );
    postsRdf.add( id, ACTSTREAMS( 'published' ), postsRdf.literal( newPost.published ) );
    postsRdf.add( id, ACTSTREAMS( 'content' ), postsRdf.literal( newPost.content ) );
    if (newPost.attachment) {
      postsRdf.add( id, ACTSTREAMS( 'attachment' ), postsRdf.sym( newPost.attachment ) );
    }

    const serial = await postsRdf.serialise();
    console.log( 'NEW POST:', serial );

    await postsRdf.append();

    return newPost;
};

const fetchWallWebId = async ( webIdUri ) =>
{
    console.log( 'FETCH WALL WEBID:', webIdUri );
    const { content: webIdMd, resourceType } = await safeApp.fetch( webIdUri );
    if ( resourceType !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const entries = await webIdMd.getEntries();
    const list = await entries.listEntries();
    list.forEach( ( e ) =>
    {
        console.log( 'WEBID ENTRY:', e.key.toString(), e.value.buf.toString() );
    } );

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    const serial = await webIdRdf.serialise( 'text/turtle' );
    console.log( 'Target WebID doc:', serial );

    const baseUri = webIdUri.split( '#' )[0];
    const webIdGraph = `${baseUri}#me`;
    const FOAF = webIdRdf.vocabs.FOAF;

    const nameMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'name' ), undefined );
    const name = nameMatch[0] && nameMatch[0].object.value;
    const nickMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'nick' ), undefined );
    const nick = nickMatch[0] && nickMatch[0].object.value;
    const websiteMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'website' ), undefined );
    const website = websiteMatch[0] && websiteMatch[0].object.value;
    const imageMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), FOAF( 'image' ), undefined );
    const image = imageMatch[0] && imageMatch[0].object.value;

    const ACTSTREAMS = webIdRdf.namespace( ACTIVITYSTREAMS_VOCAB_URL );
    const inboxMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdGraph ), ACTSTREAMS( 'inbox' ), undefined );
    const inbox = inboxMatch[0] && inboxMatch[0].object.value;

    // if there is no inbox link, let's fallback to try old format
    let posts;
    if (!inbox) {
      const postsGraph = `${baseUri}/posts`;
      const SAFETERMS = webIdRdf.vocabs.SAFETERMS;
      const xornameMatch = webIdRdf.statementsMatching( webIdRdf.sym( postsGraph ), SAFETERMS( 'xorName' ), undefined );
      const xorName = xornameMatch[0] && xornameMatch[0].object.value.split( ',' );
      const typetagMatch = webIdRdf.statementsMatching( webIdRdf.sym( postsGraph ), SAFETERMS( 'typeTag' ), undefined );
      const typeTag = typetagMatch[0] && parseInt( typetagMatch[0].object.value );
      posts = {
          xorName,
          typeTag
      };
    }

    const wallWebId = {
        '@id' : baseUri,
        '#me' : {
            '@id' : webIdGraph,
            name,
            nick,
            website,
            image,
            inbox,
        },
        posts
    };
    return wallWebId;
};

const fetchActorWebId = async ( webIdUri ) =>
{
    const { content: webIdMd, resourceType } = await safeApp.fetch( webIdUri );
    if ( resourceType !== 'RDF' ) throw 'Service is not mapped to a WebID RDF';

    const webIdRdf = webIdMd.emulateAs( 'rdf' );
    await webIdRdf.nowOrWhenFetched();

    const FOAF = webIdRdf.vocabs.FOAF;
    const nickMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdUri ), FOAF( 'nick' ), undefined );
    const nick = nickMatch[0].object.value;
    const imageMatch = webIdRdf.statementsMatching( webIdRdf.sym( webIdUri ), FOAF( 'image' ), undefined );
    const image = imageMatch[0] && imageMatch[0].object.value;
    return { image, nick };
};

const fetchWallPosts = async ( wallWebId ) =>
{
    const postsMd = await fetchPostsMd( wallWebId );
    const postsRdf = postsMd.emulateAs( 'rdf' );
    await postsRdf.nowOrWhenFetched();
    postsRdf.setId( wallWebId['@id'] );

    const serial = await postsRdf.serialise();
    console.log( 'Posts RDF:', serial );

    const keys = await postsMd.getKeys();
    const posts = [];
    const webIdsCache = {};

    const ACTSTREAMS = postsRdf.namespace( ACTIVITYSTREAMS_VOCAB_URL );
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
        const atchMatch = postsRdf.statementsMatching( postsRdf.sym( id ), ACTSTREAMS( 'attachment' ), undefined );
        const attachment = atchMatch[0] && atchMatch[0].object.value;
        const post = {
            id,
            type,
            actor,
            published,
            summary,
            content,
            attachment
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

const uploadFile = async ( filename, data ) =>
{
    const immData = await safeApp.immutableData.create();
    await immData.write(data);
    const cipherOpt = await safeApp.cipherOpt.newPlainText();
    const mimeType = mime.getType(nodePath.extname(filename));
    console.log("File's MIME type:", mimeType);
    const { xorUrl } = await immData.close(cipherOpt, true, mimeType);
    return xorUrl;
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
    [TYPES.ADD_POST] : async ( webId, wallWebId, post, fileToShare ) =>
    {
        if (fileToShare) {
          return new Promise((resolve, reject) => {
            console.log("Uploading:", fileToShare.name);
            var reader = new window.FileReader();
            reader.onload = function(){
              var data = reader.result;
              return uploadFile(fileToShare.name, data)
                .then((xorurl) => {
                  console.log("XOR URL: ", xorurl);
                  post.attachment = xorurl;
                  return postNewPost( webId, wallWebId, post ).then( resolve );
                })
            };
            reader.readAsArrayBuffer(fileToShare);
          });
        }
        const newPost = await postNewPost( webId, wallWebId, post );
        return newPost;
    },
    [TYPES.SET_CURRENT_USER] : async ( webId ) =>
    {
        await connect();
        console.log( 'Getting info from Peruse for user:', webId );

        const wallWebId = { ...webId };

        const me = wallWebId['#me'];
        if ( me.image && me.image['@id'] )
        {
            wallWebId['#me'].image = me.image['@id'];
        }

        if ( me.inbox && me.inbox['@id'] )
        {
            wallWebId['#me'].inbox = me.inbox['@id'];
        }

        if ( me.website && me.website['@id'] )
        {
            wallWebId['#me'].website = me.website['@id'];
        }

        if (!me.inbox) {
            wallWebId.posts = { ...webId.posts };
            wallWebId.posts.xorName = webId.posts.xorName.split( ',' );
            wallWebId.posts.typeTag = parseInt( webId.posts.typeTag );
        }

        let webIdClone;
        if ( safeApp.auth.registered )
        {
            console.log( 'Switching the signed-in WebID also to:', webId );
            webIdClone = { ...wallWebId };
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
