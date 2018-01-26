import './index.scss'
import Chance from "chance"

const chance = new Chance()
const NUM_IMG = 9
const SETS = 4
const back_card = "/asset/img/cover.jpg"
let firstCardRevealed = undefined
let container = document.querySelector("main")
let button = document.querySelector("button")

button.addEventListener("click", startNewGame)

let imageURL = []
for (let i = 0; i < NUM_IMG; i++) {
    imageURL.push(`/asset/img/sqGame${i + 1}.jpg`)
}

let cards = createCards(imageURL)
flipCards(cards)

function randomize(imageURL) {
    let images = chance.pickset(imageURL, SETS)
    return chance.shuffle(images.concat(images))
}

function createCards(imageURL) {
    let images = randomize(imageURL)
    let cards = []

    for (let url of images) {
        let elem = document.createElement("div")
        container.appendChild(elem)
        elem.style.backgroundImage = `url(${url})`
        let card = {
            isRevealed: false,
            elem,
            url
        }
        cards.push(card)
        elem.addEventListener("click", event => reveal(event, card))
    }
    return cards
}

function flipCards(cards) {
    setTimeout(() => {
        for (let card of cards) {
            card.elem.style.backgroundImage = `url(${back_card})`
        }
    }, 500)
}

function reveal(event, card) {
    if (card.isRevealed) { 
        return
    } else {
        card.isRevealed = true
    }
    card.elem.style.backgroundImage = `url(${card.url})`
    if (!firstCardRevealed) {
        // console.log("set the card")
        firstCardRevealed = card
    } else {
        // console.log("compare")
        if (firstCardRevealed.url == card.url) {
            // conaole.log("match")
            firstCardRevealed = undefined
        } else {
            // console.log("mismatch")
            setTimeout(() => {
                card.elem.style.backgroundImage = `url(${back_card})`
                firstCardRevealed.elem.style.backgroundImage = `url(${back_card})`
                card.isRevealed = false
                firstCardRevealed.isRevealed = false
                firstCardRevealed = undefined
            }, 400);
        }
    }
}

function startNewGame(event) {
    container.innerHTML = "" 
    let cards = createCards(imageURL)
    flipCards(cards)
}
