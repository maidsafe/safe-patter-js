import { createAction, createActions } from 'redux-actions';

export const TYPES = {
    ADD_POST         : 'ADD_POST',
    SET_CURRENT_USER : 'SET_CURRENT_USER',
    SEND_MESSAGE     : 'SEND_MESSAGE'
};

// export const {
//     // addPost :
//     // , removeBookmark
//
// } = createActions( TYPES.ADD_POST );
// }

/*cosnt generatePostRdf = (safeApp) =>
{
    const postsContainer =
      await safeApp.mutableData.newPublic(subdomainLocation, consts.TAG_TYPE_DNS);

    try {
      await postsContainer.quickSetup();
    } catch (err) {
      // If the subdomain container already exists we are then ok
      if (err.code !== errConst.ERR_DATA_GIVEN_ALREADY_EXISTS.code) {
        throw err;
      }
    }

    const postsRdf = postsContainer.emulateAs('rdf');
    const vocabs = this.getVocabs(postsRdf);
}
*/

const mimicExisingPostContainer = async (targetWebId) =>
{
  console.log("MIMICING:", targetWebId)
  const appInfo = {
    id: "net.maidsafe.example",
    name: 'Example SAFE App',
    vendor: 'MaidSafe.net Ltd'
  }
  const safeApp = await window.safe.initialiseApp(appInfo);
  const authReqUri = await safeApp.auth.genAuthUri();
  console.log("AUTH:", authReqUri)
  const authUri = await window.safe.authorise(authReqUri);
  console.log("AUTH:", authUri)





/*
  const id = rdf.sym(profile.uri);
  rdf.setId(profile.uri);
  const webIdWithHashTag = rdf.sym(`${profile.uri}#me`);

  rdf.add(id, vocabs.RDFS('type'), vocabs.FOAF('PersonalProfileDocument'));
  rdf.add(id, vocabs.DCTERMS('title'), rdf.literal(`${profile.name}'s profile document`));
  rdf.add(id, vocabs.FOAF('maker'), webIdWithHashTag);
  rdf.add(id, vocabs.FOAF('primaryTopic'), webIdWithHashTag);

  rdf.add(webIdWithHashTag, vocabs.RDFS('type'), vocabs.FOAF('Person'));
  rdf.add(webIdWithHashTag, vocabs.FOAF('name'), rdf.literal(profile.name));
  rdf.add(webIdWithHashTag, vocabs.FOAF('nick'), rdf.literal(profile.nickname));
  rdf.add(webIdWithHashTag, vocabs.FOAF('image'), rdf.literal(profile.avatar)); // TODO: this needs to be created as an LDP-NR
  rdf.add(webIdWithHashTag, vocabs.FOAF('website'), rdf.literal(profile.website));

  const location = await rdf.commit();*/
}

const postNewPost = async (safeApp, webId, targetWebId, newPost) =>
{
    await mimicExisingPostContainer(targetWebId);

    console.log("TARGET WEB ID:", targetWebId)
    const postRdf = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Note",
      "actor": webId.id,
      "summary": newPost.summary,
      "published": newPost.published,
      "content": newPost.content
    };

    const postsContainer =
      await safeApp.mutableData.newPublic(targetWebId.posts.xorname, targetWebId.posts.typeTag);

    try {
      await postsContainer.quickSetup();
    } catch (err) {
      // If the posts container already exists we are then ok
      if (err.code !== -104) {
        throw err;
      }
    }

    const postsRdf = postsContainer.emulateAs('rdf');
    //const vocabs = this.getVocabs(postsRdf);
/*
    // add to or create subdomain container.
    const fullUri = `safe://${publicName}`;
    // TODO: parse the uri to extract the subdomain

    const id = postsRdf.sym(fullUri);
    postsRdf.setId(fullUri);
    const uriWithHashTag = postsRdf.sym(`${fullUri}#it`);
    const serviceResource = postsRdf.sym(`safe://${subdomain}.${publicName}`);

    postsRdf.add(id, vocabs.RDFS('type'), vocabs.LDP('DirectContainer'));
    postsRdf.add(id, vocabs.LDP('membershipResource'), uriWithHashTag);
    postsRdf.add(id, vocabs.LDP('hasMemberRelation'), vocabs.SAFETERMS('hasService'));
    postsRdf.add(id, vocabs.DCTERMS('title'), postsRdf.literal(`Services Container for subdomain: '${publicName}'`));
    postsRdf.add(id, vocabs.DCTERMS('description'), postsRdf.literal('List of public services exposed by a particular subdomain'));
    postsRdf.add(id, vocabs.LDP('contains'), serviceResource);

    postsRdf.add(uriWithHashTag, vocabs.RDFS('type'), vocabs.SAFETERMS('Services'));
    postsRdf.add(uriWithHashTag, vocabs.DCTERMS('title'), postsRdf.literal(`Services available for subdomain: '${publicName}'`));
    postsRdf.add(uriWithHashTag, vocabs.SAFETERMS('hasService'), serviceResource);

    postsRdf.add(serviceResource, vocabs.RDFS('type'), vocabs.SAFETERMS('Service'));
    postsRdf.add(serviceResource, vocabs.DCTERMS('title'), postsRdf.literal(`'${subdomain}' service`));
    postsRdf.add(serviceResource, vocabs.SAFETERMS('xorName'), postsRdf.literal(serviceLocation.name.toString()));
    postsRdf.add(serviceResource, vocabs.SAFETERMS('typeTag'), postsRdf.literal(serviceLocation.typeTag.toString()));

    const location = postsRdf.commit();

    return location;
*/

    return new Promise((resolve, reject) => {
      console.log("NEW POST:", postRdf);
      resolve(postRdf);
    });
}

export const {
    addPost,
    setCurrentUser,
    sendMessage
} = createActions( {
    [TYPES.ADD_POST] : async ( webId, targetWebId, post ) =>
    {
        const newPost = await postNewPost(webId, targetWebId, post);
        return newPost;
    },
    [TYPES.SET_CURRENT_USER] : async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for getting User if needed...' );
            resolve( post );
        } );

        await x;

        return x;
    },
    [TYPES.SEND_MESSAGE] : async ( post ) =>
    {
        const x = new Promise( ( resolve, reject ) =>
        {
            console.log( 'Should do SAFE things for sending a message...' );
            resolve( post );
        } );

        await x;

        return x;
    }
} );
