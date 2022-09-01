const EventEmitter = require("events")
const eventEmitter = new EventEmitter()
// console.log(EventEmitter.hasOwnProperty("on"))

eventEmitter.on("start", (name, age) => {
    console.log(`${name}:${age} will definitely be good at what she does`)
})


eventEmitter.emit("start", "Ann", 22)