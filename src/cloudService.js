import EventBus from './EventBus.js'

const firebase = require("firebase/app");

require("firebase/auth");
require("firebase/firestore");
require("firebase/storage");
require("firebase/database");

var config = {
    apiKey: "<firebase api key>",
    authDomain: "<firebase auth domain>",
    databaseURL: "<firebase database url>",
    projectId: "<firebase project id>",
    storageBucket: "<firebase storage bucket>"
};
firebase.initializeApp(config);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
firestore.settings({timestampsInSnapshots: true});

auth.onAuthStateChanged(function(user) {
    EventBus.$emit("login-status", user != null);
});

function getDisplayName() {
    var displayNameArr = auth.currentUser.displayName.split(" ");
    var name = "";
    displayNameArr.forEach(function(e) {
        if (e.trim() != ""){
            name = (name + " " + e.trim().charAt(0).toUpperCase() + e.trim().slice(1, e.trim().length).toLowerCase());
        }
    });
    return name.trim();
}

function getUniqueId() {
    return firebase.database().ref().push().key;
}

export default {
    logout: function() {
        return firebase.auth().signOut();
    },
    getFirebase: function() {
        return firebase;
    },
    getArticleDoc: function(articleId, fetchIfPublished) {
        if (fetchIfPublished == null) {
            fetchIfPublished = true;
        }
        return new Promise(function(resolve, reject) {
            console.log("fetching article for article id - %s", articleId);
            firestore.collection("articles").doc(articleId).get().then(function(doc){
                if (doc.exists) {
                    var docData = doc.data();
                    if (fetchIfPublished) {
                        if(docData.publishedAt == null) {
                            resolve(null);  
                        } else {
                            resolve(docData);    
                        }
                    } else {
                        if(docData.publishedAt == null) {
                            resolve(docData);  
                        } else {
                            resolve(null);    
                        }
                    }
                } else {
                    resolve(null);
                }
            }).catch(function(error) {
                console.error("fetching error article for article id - %s", articleId, error);
                reject(error);
            });
        });
    },
    createArticleDoc: function(title) {
        var articleId = title.split(" ").join("-");
        return new Promise(function(resolve, reject) {
            if (auth.currentUser == null) {
                var e = new Error("user is not logged in");
                e.code = "not-logged-in";
                reject(e);
            } else {
                firestore.collection("articles").doc(articleId).get().then(function(doc){
                    if (doc.exists) {
                        var e = new Error("an article aready exist with the given title");
                        e.code = "duplicate-title";
                        reject(e);
                    } else {
                        firestore.collection("articles").doc(articleId).set({
                            author: {
                                uid: auth.currentUser.uid,
                                displayName: getDisplayName(),
                                photoURL: auth.currentUser.photoURL,
                            },
                            article: {
                                title: title,
                                contents: []
                            },
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(function(){
                            resolve(articleId);
                        }).catch(function(error){
                            console.error("error while creating article for article id - %s", articleId, error);
                            reject(error);
                        });
                    }
                }).catch(function(error) {
                    console.error("fetching error article for article id - %s", articleId, error);
                    reject(error);
                });
            }
        });
    },
    addLastArticleContent: function(articleId, content) {
        if (content == null || !(content instanceof Object)) {
            throw new Error("invalid content");
        }
        return firestore.collection("articles").doc(articleId).update({"article.contents": firebase.firestore.FieldValue.arrayUnion(content)});
    },
    removeArticleContent: function(articleId, content) {
        if (content == null || !(content instanceof Object)) {
            throw new Error("invalid content");
        }
        return firestore.collection("articles").doc(articleId).update({"article.contents": firebase.firestore.FieldValue.arrayRemove(content)});
    },
    publishArticle: function(articleId) {
        return firestore.collection("articles").doc(articleId).update({"publishedAt": firebase.firestore.FieldValue.serverTimestamp()});
    },
    getArticlesByAuthor: function(lastFetchedCreatedAt) {
        return new Promise(function(resolve, reject) {
            if (auth.currentUser == null) {
                var e = new Error("user is not logged in");
                e.code = "not-logged-in";
                reject(e);
            } else {
                var query = firestore.collection("articles").where("author.uid", "==", auth.currentUser.uid).orderBy("createdAt", "desc");
                if (lastFetchedCreatedAt != null) {
                    query = query.startAfter(lastFetchedCreatedAt);
                }
                query.limit(10).get().then(function(snapshots){
                    var dataArr = [];
                    if (!snapshots.empty) {
                        snapshots.docs.forEach(function(doc) {
                            var data = doc.data();
                            data['titleId'] = doc.id;
                            dataArr.push(data);
                        });
                    }
                    resolve(dataArr);
                }).catch(function(error){
                    reject(error);
                });
            }
        });
        
    },
    putArticleImage: function(file) {
        var filePath = "articleImages/" + getUniqueId() + "." + file['type'].split('/')[1];
        var storageRef = storage.ref().child(filePath);
        
        return new Promise(function(resolve, reject) {
            storageRef.put(file).then(function(snapshot) {
                storageRef.getDownloadURL().then(function(url) {
                    resolve(url);
                }).catch(function(error) {
                    reject(error);
                });
            }).catch(function(error) {
                reject(error);
                console.error(error);
            });
        });
    },
    deleteArticle: function(articleId) {
        return firestore.collection("articles").doc(articleId).delete();
    }
}