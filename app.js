const Libp2p = require("libp2p")
const TCP = require("libp2p-tcp")
const { NOISE } = require("libp2p-noise")
const MPLEX = require("libp2p-mplex")
const process = require("process")
const multiaddr = require("multiaddr")

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

  node.on("peer:discovery", (peer) => console.log("Discovered:", peer.toB58String()))

  // print out listening addresses
  console.log("listening on addresses:")
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
  })

  // ping peer if received multiaddr
  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2])
    console.log(`pinging remote peer at ${process.argv[2]}`)
    const latency = await node.ping(ma)
    console.log(`pinged ${process.argv[2]} in ${latency}ms`)
  } else {
    console.log("no remote peer address given, skipping ping")
  }

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
