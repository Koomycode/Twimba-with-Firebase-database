import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const appSettings = {
    databaseURL: "https://twimba-70c56-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const tweetsInFirebase = ref(database, "Tweets")

const bodySection = document.getElementById("body")
const newTweetText = document.getElementById("new-tweet")
const newTweetBtn = document.getElementById("tweet-btn")

let tweetsData = []


newTweetBtn.addEventListener("click", createNewTweet)

function createNewTweet() {
    if (newTweetText.value) {

        let newText = newTweetText.value

        newTweetText.value = ``

        let newTweetObject = {
            handle: `@DanAbramov`,
            profilePic: `images/Dan.webp`,
            likes: 0,
            retweets: 0,
            tweetText: newText,
            replies: ['0'],
            isLiked: false,
            isRetweeted: false,
            replied: false,
            isVerified: true,
            uuid: uuidv4(),
        }

        push(tweetsInFirebase, newTweetObject)

    }
}


onValue(tweetsInFirebase, function (snapshot) {
    if (snapshot.exists()) {

        const tweetsObject = Object.entries(snapshot.val())

        bodySection.innerHTML = ""

        tweetsData = []

        tweetsObject.forEach(item => {
            tweetsData.push(item[1])
        })

        // console.log(tweetsData)

        let whatToRender = create(tweetsObject)

        render(whatToRender)
    }
})


function create(tweetArray) {
    let createdTweet = ``

    tweetArray.forEach(tweet => {

        let tweetValue = tweet[1]
        let tweetID = tweet[0]

        let verified = tweet[1].isVerified ? "true" : ""
        let likedClass = tweet[1].isLiked ? "fa-solid" : ""
        let retweetClass = tweet[1].isRetweeted ? "retweeted" : ""

        let commentIconClass = tweet[1].replied ? "fa-solid" : ""
        let commentClass = tweet[1].replied ? "show" : ""

        let repliesHTML = ``
        if (tweet[1].replies.length > 1) {

            tweet[1].replies.slice(1).forEach(reply => {
                let verifiedReply = reply.isVerified ? "true" : ""

                repliesHTML += `
                    <div class="reply flex">
                            <img src="${reply.profilePic}" class="user-img">
                            <h5 class="user-name flex">
                                ${reply.handle}
                                <img src="./images/Verified_Badge.svg.png" class="verified-user ${verifiedReply}">
                            </h5>
                            <p class="user-tweet">
                                ${reply.tweetText}
                            </p>
                    </div>
                `
            })
        }

        let newReplyHTML = tweet[1].replied ? `
            <div class="new-reply-container flex">
                <textarea 
                    class="new-reply" 
                    name="${tweet[1].uuid}"
                    placeholder="Reply..."
                    ></textarea>

                <button class="reply-btn" data-btn="${tweet[1].uuid}">Reply</button>
            </div>
        ` : ``

        createdTweet += `
        
        <div class="tweet flex">
            <img src="${tweetValue.profilePic}" class="user-img">
            <button class="delete-btn flex" data-id="${tweetID}">x</button>
            <h5 class="user-name flex">
                ${tweetValue.handle}
                <img 
                    src="./images/Verified_Badge.svg.png" 
                    class="verified-user ${verified}"
                >
            </h5>
            <p class="user-tweet">
                ${tweetValue.tweetText}
            </p>
            <div class="icons-container flex">
                <i 
                    class="fa-regular fa-comment-dots ${commentIconClass}" 
                    data-comment = "${tweetValue.uuid}">
                    <span class="comment-value">${tweetValue.replies.length - 1}</span>
                </i>
    
                <i 
                    class="fa-regular fa-heart ${likedClass}" 
                    data-like = "${tweetValue.uuid}">
                    <span class="like-value">${tweetValue.likes}</span>
                </i>
    
                <i 
                    class="fa-solid fa-retweet ${retweetClass}" 
                    data-retweet = "${tweetValue.uuid}">
                    <span class="retweet-value">${tweetValue.retweets}</span>
                </i>
            </div> 

            <div 
                class="replies flex ${commentClass} ">
                ${repliesHTML}
                ${newReplyHTML}
            </div>
        </div>
    
        `
    })

    return createdTweet
}


function render(tweet) {
    bodySection.innerHTML = tweet
}


// ----- Delete Tweet on X Double-click -----
document.addEventListener("dblclick", function (e) {
    if (e.target.dataset.id) {
        const tweetLocationInFB = ref(database, `Tweets/${e.target.dataset.id}`)
        remove(tweetLocationInFB)
    }
})


document.addEventListener("click", function (e) {
    if (e.target.dataset.like) {
        handleLike(e.target.dataset.like)
    }

    if (e.target.dataset.retweet) {
        handleRetweet(e.target.dataset.retweet)
    }

    if (e.target.dataset.comment) {
        handleComment(e.target.dataset.comment)
    }

    if (e.target.dataset.btn) {
        handleAddNewReply(e.target.dataset.btn)
    }
})


function handleLike(tweetId) {

    const targetTweet = tweetsData.filter(tweet => {
        return tweet.uuid === tweetId
    })[0]

    targetTweet.isLiked = !targetTweet.isLiked

    targetTweet.isLiked ? targetTweet.likes++ : targetTweet.likes--

    // console.log(tweetsData)

    remove(ref(database, "Tweets"))

    tweetsData.forEach(data => {
        push(ref(database, "Tweets"), data)
    })
}


function handleRetweet(tweetId) {

    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetId
    })[0]


    currentObj.isRetweeted = !currentObj.isRetweeted

    currentObj.isRetweeted ? currentObj.retweets++ : currentObj.retweets--

    // console.log(tweetsData)

    remove(ref(database, "Tweets"))

    tweetsData.forEach(data => {
        push(ref(database, "Tweets"), data)
    })
}


function handleComment(tweetId) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetId
    })[0]

    currentObj.replied = !currentObj.replied

    remove(ref(database, "Tweets"))

    tweetsData.forEach(data => {
        push(ref(database, "Tweets"), data)
    })
}


function handleAddNewReply(tweetId) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetId
    })[0]

    const newReplyText = document.querySelector(`textarea[name="${tweetId}"]`)

    let newReplyObject = {
        handle: `@DanAbramov`,
        profilePic: `images/Dan.webp`,
        tweetText: newReplyText.value,
        isVerified: true,
    }

    newReplyText.value = ``

    currentObj.replies.push(newReplyObject)

    remove(ref(database, "Tweets"))

    tweetsData.forEach(data => {
        push(ref(database, "Tweets"), data)
    })

}


























/*
--- render Array excluding the first index ---

const myArray = [1, 2, 3, 4, 5]
function renderArray() {
    let renderText = ``
    myArray.slice(1).forEach(num => {
        renderText += ` ${num} `
    })
    console.log(renderText)
}
renderArray()
*/



/*
------- Project without Firebase using tweetsData file --------

function createTweet() {
    let tweetToRender = ``


    tweetsData.forEach(tweet => {

        let likeClass = tweet.isLiked ? "fa-solid" : ""
        let retweetClass = tweet.isRetweeted ? "retweeted" : ""
        let verified = tweet.isVerified ? "true" : ""
        let repliesHTML = ``

        let commentClass = tweet.replied ? "show" : ""
        let commentIconClass = tweet.replied ? "fa-solid" : ""
        let addReplyHTML = tweet.replied ? `
                <div class="new-reply-container flex">
                        <textarea 
                            class="new-reply" 
                            name="${tweet.uuid}"
                            placeholder="Reply..."
                            ></textarea>

                        <button class="reply-btn" data-id="${tweet.uuid}">Reply</button>
                </div>
        ` : ``

        if (tweet.replies.length > 0) {

            tweet.replies.forEach(reply => {
                let verifiedReply = reply.isVerified ? "true" : ""

                repliesHTML += `
                    <div class="reply flex">
                            <img src="${reply.profilePic}" class="user-img">
                            <h5 class="user-name flex">
                                ${reply.handle}
                                <img src="./images/Verified_Badge.svg.png" class="verified-user ${verifiedReply}">
                            </h5>
                            <p class="user-tweet">
                                ${reply.tweetText}
                            </p>
                    </div>
                `
            })
        }

        tweetToRender += `        
            <div class="tweet flex">
                    <img src="${tweet.profilePic}" class="user-img">
                    <h5 class="user-name flex">
                        ${tweet.handle}
                        <img src="./images/Verified_Badge.svg.png" class="verified-user ${verified}">
                    </h5>
                    <p class="user-tweet">
                        ${tweet.tweetText}
                    </p>
                    <div class="icons-container flex">
                        <i 
                            class="fa-regular fa-comment-dots ${commentIconClass}" 
                            data-comment = "${tweet.uuid}">
                            <span class="comment-value">${tweet.replies.length}</span>
                        </i>

                        <i 
                            class="fa-regular fa-heart ${likeClass}" 
                            data-like = "${tweet.uuid}">
                            <span class="like-value">${tweet.likes}</span>
                        </i>

                        <i 
                            class="fa-solid fa-retweet ${retweetClass}" 
                            data-retweet = "${tweet.uuid}">
                            <span class="retweet-value">${tweet.retweets}</span>
                        </i>
                    </div> 
                    
                    <div 
                        class="replies flex ${commentClass}">
                        ${repliesHTML}
                        ${addReplyHTML}
                    </div>
            </div>
        `
    })

    return tweetToRender
}

function render() {
    bodySection.innerHTML = createTweet()
}

render()




document.addEventListener("click", function (e) {
    if (e.target.dataset.comment) {
        handleRepliesClick(e.target.dataset.comment)
    }

    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    }

    if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    }

    if (e.target.id === "tweet-btn") {
        createNewTweet()
    }

    if (e.target.dataset.id) {
        createNewReply(e.target.dataset.id)
    }

})

function handleLikeClick(tweetID) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetID
    })[0]

    currentObj.isLiked = !currentObj.isLiked
    currentObj.isLiked ? currentObj.likes++ : currentObj.likes--

    render()
}

function handleRetweetClick(tweetID) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetID
    })[0]

    currentObj.isRetweeted = !currentObj.isRetweeted
    currentObj.isRetweeted ? currentObj.retweets++ : currentObj.retweets--

    render()
}

function handleRepliesClick(tweetID) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetID
    })[0]

    currentObj.replied = !currentObj.replied

    render()
}

function createNewTweet() {
    if (newTweetText.value) {
        let newTweet = {
            handle: `@Koi`,
            profilePic: `images/Dan.webp`,
            likes: 0,
            retweets: 0,
            tweetText: newTweetText.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            replied: false,
            isVerified: true,
            uuid: `${tweetsData.length + 1}`,
        }
        newTweetText.value = ``

        tweetsData.unshift(newTweet)
        render()
    }
}

function createNewReply(tweetID) {
    const currentObj = tweetsData.filter(tweet => {
        return tweet.uuid === tweetID
    })[0]

    const replyTextarea = document.querySelector(`textarea[name="${tweetID}"]`)

    if (replyTextarea.value) {
        let newReply = {
            handle: `@Koi`,
            isVerified: true,
            profilePic: `images/Dan.webp`,
            tweetText: replyTextarea.value,
        }

        replyTextarea.value = ""

        currentObj.replies.push(newReply)

        render()
    }
}

*/