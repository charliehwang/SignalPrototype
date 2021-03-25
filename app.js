const Libp2p = require("libp2p")
const TCP = require("libp2p-tcp")
const { NOISE } = require("libp2p-noise")
const MPLEX = require("libp2p-mplex")
const process = require("process")
const multiaddr = require("multiaddr")
const PeerInfo = require("peer-info")
const pipe = require("it-pipe")
const Gossipsub = require("libp2p-gossipsub")
const FloodSub = require("libp2p-floodsub")

const { collect } = require("streaming-iterables")

// const pull = require("pull-stream")

// const MDNS = require("libp2p-mdns")
const MulticastDNS = require("libp2p-mdns")

// const mdns = new MDNS({
//   peerId: "MY_ID",
// })

const main = async () => {
  // mdns.on("peer", (peerData) => {
  //   console.log("Found a peer in the local network", peerData.id.toB58String(), peerData.multiaddrs)
  // })
  // Broadcast for 20 seconds
  // mdns.start()
  // setTimeout(() => mdns.stop(), 20 * 1000)

  const node = await Libp2p.create({
    addresses: {
      // add a listen address (localhost) to accept TCP connections on a random port
      // listen: ["/ip4/127.0.0.1/tcp/0"],
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      peerDiscovery: [MulticastDNS],
      pubsub: Gossipsub,
    },
    config: {
      peerDiscovery: {
        mdns: {
          interval: 1000,
          enabled: true,
        },
      },
    },
  })

  // start libp2p
  await node.start()
  console.log("libp2p has started")

  const topic = "kickoff-your-application-with-js-libp2p"
  // await node.pubsub.start()
  await node.pubsub.subscribe(topic)

  let prevReqId = undefined
  await node.pubsub.on(topic, (message) => {
    // Handle message
    // console.log("yo yo here....")
    // const string = new TextDecoder().decode(message.data)
    // console.log(new Date(), string)
    const data = JSON.parse(message.data)
    const { reqId, symbol } = data

    reqId && prevReqId !== reqId && console.log(data)
    prevReqId = reqId

    // console.log(message)
    // console.log(new Date(), message)
  })

  // if (process.argv.length >= 3) {
  //   // node.peerStore.peers.forEach(async (peer) => {
  //   const firstArg = process.argv[2]
  //   setTimeout(() => {
  //     // node.pubsub.publish(topic, new TextEncoder().encode(firstArg))
  //     node.pubsub.publish(topic, JSON.stringify({ reqId: 1231294124, symbol: firstArg }))
  //   }, 500)
  // }

  node.on("peer:discovery", async (peerId) => {
    console.log("Discovered:", peerId.toB58String())

    if (process.argv.length >= 3) {
      // node.peerStore.peers.forEach(async (peer) => {
      const firstArg = process.argv[2]
      const reqId = process.argv[3]
      // node.pubsub.publish(topic, new Uint8Array([21, 31]))
      // await node.pubsub.publish(topic, new TextEncoder().encode(firstArg))
      // await node.pubsub.publish(topic, new TextEncoder().encode(firstArg))

      setTimeout(() => {
        // node.pubsub.publish(topic, new TextEncoder().encode(firstArg))
        node.pubsub.publish(topic, JSON.stringify({ reqId, symbol: firstArg }))
      }, 500)

      // const peerInfo = new PeerInfo(peerId)
      // const { stream } = await node.dialProtocol(peerId, "/chat/1.0.0", (err, conn) => {
      //   // node.dialProtocol(peerInfo, "/chat/1.0.0", (err, conn) => {
      //   if (err) throw err

      //   piipe(pipe.values([firstArg], conn))
      //   console.log("diaaaaaaaaaaaaaaaaaaaaaling.....")
      // })
      // })

      // // const peerInfo = new PeerInfo(peerId)
      // const { stream } = await node.dialProtocol(peerId, "/chat/1.0.0", (err, conn) => {
      //   // node.dialProtocol(peerInfo, "/chat/1.0.0", (err, conn) => {
      //   if (err) throw err

      //   console.log("diaaaaaaaaaaaaaaaaaaaaaling.....")
      // })

      // pipe(
      //   // Source data
      //   [firstArg],
      //   // firstArg,
      //   // Write to the stream, and pass its output to the next function
      //   stream,
      //   // Sink function
      //   async function (source) {
      //     // For each chunk of data
      //     for await (const data of source) {
      //       // Output the data
      //       console.log("received echo:", data.toString())
      //     }
      //   }
      // )
    }
  })

  node.handle("/chat/1.0.0", async (protocal, conn) => {
    console.log("Handling chat 1.0.0")
    // const result = await pipe(stream.source, stream.sink)
    // console.log(result)
    // pipe(
    //   conn,
    //   pipe.map((err, data) => {
    //     console.log("received:", data.toString())
    //   })
    // )
  })

  // print out listening addresses
  console.log("listening on addresses:")
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
  })

  // ping peer if received multiaddr
  // if (process.argv.length >= 3) {
  // const firstArg = multiaddr(process.argv[2])
  //   console.log(`pinging remote peer at ${process.argv[2]}`)
  //   const latency = await node.ping(ma)
  //   console.log(`pinged ${process.argv[2]} in ${latency}ms`)
  // } else {
  //   console.log("no remote peer address given, skipping ping")
  // }

  const stop = async () => {
    // stop libp2p
    await node.stop()
    console.log("libp2p has stopped")
    process.exit(0)
  }

  process.on("SIGTERM", stop)
  process.on("SIGINT", stop)
}

main()
