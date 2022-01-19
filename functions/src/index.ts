import * as functions from "firebase-functions";
import * as anchor from "@project-serum/anchor";
import * as bs58 from "bs58";
import { AccountsCoder, Wallet } from "@project-serum/anchor";
import fetch from "node-fetch";
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { collection, addDoc } from "firebase/firestore"; 
import { deserializeUnchecked } from "borsh";
import { Metadata, METADATA_SCHEMA } from "./metadata-schema";

const firebaseConfig = {
  apiKey: "AIzaSyAmAy1hvCxvOHgusRscfLbrm5yOfX2gdas",
  authDomain: "minty-8755c.firebaseapp.com",
  projectId: "minty-8755c",
  storageBucket: "minty-8755c.appspot.com",
  messagingSenderId: "788664120758",
  appId: "1:788664120758:web:37f72abf05d1321b0a7d17",
  measurementId: "G-KJN0N4NHZT"
};

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig);

const db = getFirestore(fbApp);

const express = require('express')
const app = express()
const cors = require('cors')


// Automatically allow cross-origin requests
app.use(cors({ origin: true }));


import {
  clusterApiUrl,
  Commitment,
  Connection,
  Context,
  KeyedAccountInfo,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { program } from "commander";
import { number } from "joi";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// interface Args {
//   host: string;
//   commitment: Commitment;
//   programId: string;
// }

class CandyMachineDescriptor {

  name: string;
  candyMachineId: string;
  configId: string;
  treasury: string;
  itemsRedeemed: number;
  itemsAvailable: number;
  price: number;
  goLiveDate: number | null;
  buffer: Buffer;
  infoBuffer: any;

  constructor(  name: string,
                candyMachineId: string, 
                configId: string, 
                treasury: string, 
                itemsRedeemed: number, 
                itemsAvailable: number,
                price: number,
                goLiveDate: number | null,
                buffer: Buffer,
                infoBuffer: any ) {
         
    this.name = name
    this.candyMachineId = candyMachineId
    this.configId = configId
    this.treasury = treasury
    this.itemsRedeemed = itemsRedeemed
    this.itemsAvailable = itemsAvailable
    this.price = price
    this.goLiveDate = goLiveDate
    this.buffer = buffer
    this.infoBuffer = infoBuffer

  }

    async getLine( index: number ) {
      const lineSlice = this.buffer.slice(247 + 4 + ( index * 240 ) , 247 + 4 + ( (index + 1) * 240 ))
      const uriSlice = lineSlice.slice(40,230)

      function spaceFilter( num: number ) {
        return num != 0
      }
    
      const filterUriSlice = uriSlice.filter(spaceFilter)

      const uri: string = String.fromCharCode(...filterUriSlice)
      console.log(uri)
    } 
}

app.get('/start', async (req, res) => {

  for (let i = 0; i < 40; i++ ) {
  
    let todo = {
      start: i * 400
    };
  
    fetch('https://us-central1-minty-8755c.cloudfunctions.net/widgets/batch', {
      method: 'POST',
      body: JSON.stringify(todo),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
  
  }

  res.send("Hello TJ! :)");

})

app.post('/batch', async (req, res) => {
  const connection = new Connection("https://solana.genesysgo.net/", "confirmed");
  const accountDescriminator = AccountsCoder.accountDiscriminator("CandyMachine");

  let config = {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(accountDescriminator),
        },
      },
    ],
  };

  const candyId = new PublicKey("cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ")
  const burner = new anchor.Wallet(Keypair.generate())
  const provider = new anchor.Provider(connection, burner, { skipPreflight: true })
  const idl = await anchor.Program.fetchIdl(candyId, provider)
  const program = new anchor.Program(idl!, candyId, provider)
  const result = await connection.getProgramAccounts( candyId, config);

  const incr = 20

  function breakout(result: {
    pubkey: anchor.web3.PublicKey;
    account: anchor.web3.AccountInfo<Buffer>;
  }) : {
    res: {
      pubkey: anchor.web3.PublicKey;
      account: anchor.web3.AccountInfo<Buffer>;
    },
    pk: string
  } {
  return {
    'res': result,
    'pk': result.pubkey.toBase58()
  }
}

const bigStart = req.body.start

for (let i = 0; i < 20; i++ ) {

  const start = (i * incr) + bigStart
  const end = ((i + 1) * incr) + bigStart

  const slice = result.slice(start, end)
  const breakoutSlice = slice.map(breakout)

  let todo = {
    start: start,
    end: end,
    resultSlice: JSON.stringify(breakoutSlice)
  };

  fetch('https://us-central1-minty-8755c.cloudfunctions.net/widgets/search', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())

}

  const l = {
    "msg": "Received POST request"
  }

  res.send(JSON.stringify(l));

});

app.post('/search', async (req, res) => {

  async function processResultData( result: {
    res: {
      pubkey: anchor.web3.PublicKey;
      account: anchor.web3.AccountInfo<Buffer>;
    },
    pk: string
  }) : Promise<CandyMachineDescriptor | null> {


    const lol = Buffer.from(result.res.account.data)
    const candyMachine = program.coder.accounts.decode("CandyMachine", lol)
    const configAccountInfo = await connection.getAccountInfo(candyMachine.config)
    if ( configAccountInfo == null ) { return null }
    const configParsed = program.coder.accounts.decode("Config", configAccountInfo!.data)
    const index = 0
    const lineSlice = configAccountInfo!.data.slice(247 + 4 + ( index * 240 ) , 247 + 4 + ( (index + 1) * 240 ))
    const nameSlice = lineSlice.slice(4,36)
    const uriSlice = lineSlice.slice(40,230)

    function spaceFilter( num: number ) {
      return num != 0
    }
  
    const filterUriSlice = uriSlice.filter(spaceFilter)
  
    const number = uriSlice.indexOf("%00")
  
    const name = String.fromCharCode(...nameSlice)
    const uri: string = String.fromCharCode(...filterUriSlice)

    // const response = await fetch(uri);
    // const data = await response.json().catch( error => {
    //   functions.logger.info(error)
    // })

    const candyMachineId = result.pk
    const configId = candyMachine.config.toBase58()
    const treasury = candyMachine.wallet.toBase58()
    const itemsRedeemed = candyMachine.itemsRedeemed
    const itemsAvailable = candyMachine.data.itemsAvailable
    // const projectName = name.split('#')[0]
    // const projectDescription = data.description!
    const price = 0
    const goLiveDate = candyMachine.data.goLiveDate
    // const royalty = data.seller_fee_basis_points

    const candyMachineDescriptor = new CandyMachineDescriptor(name, candyMachineId, configId, treasury, itemsRedeemed, itemsAvailable, price, goLiveDate, configAccountInfo!.data, candyMachine.config)
    return candyMachineDescriptor
  }

  const connection = new Connection("https://solana.genesysgo.net/", "confirmed");
  const accountDescriminator = AccountsCoder.accountDiscriminator("CandyMachine");

  let config = {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(accountDescriminator),
        },
      },
    ],
  };

  const candyId = new PublicKey("cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ")
  const burner = new anchor.Wallet(Keypair.generate())
  const provider = new anchor.Provider(connection, burner, { skipPreflight: true })
  const idl = await anchor.Program.fetchIdl(candyId, provider)
  const program = new anchor.Program(idl!, candyId, provider)
  // const result = await connection.getProgramAccounts( candyId, config);

  const l = {
    "msg": "Received POST request"
  }

  res.send(JSON.stringify(l));

  const start = req.body.start
  const end = req.body.end

  // const resultSlice = result.slice(start, end);
  const resultSlice = JSON.parse(req.body.resultSlice)
  const ml = JSON.parse(req.body.resultSlice)

  async function processAllResults( results: {
    res: {
      pubkey: anchor.web3.PublicKey;
      account: anchor.web3.AccountInfo<Buffer>;
    },
    pk: string
  }[] ) {
    for (let i = 0; i < results.length; i++) { 
      const candyMachineDescriptor = await processResultData(results[i]);
  
      if ( candyMachineDescriptor != null && candyMachineDescriptor.itemsRedeemed > 1 ) {

        // let todo = {
        //   candyMachineId: candyMachineDescriptor.candyMachineId,
        //   configId: candyMachineDescriptor.configId,
        //   treasury: candyMachineDescriptor.treasury
        //   // buffer: JSON.stringify(candyMachineDescriptor.infoBuffer)
        // };

        // fetch('https://us-central1-minty-8755c.cloudfunctions.net/widgets/candy', {
        //   method: 'POST',
        //   body: JSON.stringify(todo),
        //   headers: { 'Content-Type': 'application/json' }
        // }).then(res => res.json())

        let todo = {
          name: candyMachineDescriptor.name,
          candyMachineId: candyMachineDescriptor.candyMachineId
        };
      
        fetch('https://us-central1-minty-8755c.cloudfunctions.net/widgets/candy', {
          method: 'POST',
          body: JSON.stringify(todo),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
        
        // try { 
        //   const docRef = await addDoc(collection(db, "candy-storage"), {
        //     name: candyMachineDescriptor.name,
        //     candyMachineId: candyMachineDescriptor.candyMachineId,
        //     configId: candyMachineDescriptor.configId,
        //     treasury: candyMachineDescriptor.treasury,
        //     goLiveDate: candyMachineDescriptor.goLiveDate.toString(),
        //     itemsAvailable: candyMachineDescriptor.itemsAvailable.toString(),
        //     itemsRedeemed: candyMachineDescriptor.itemsRedeemed.toString(),
        //     price: candyMachineDescriptor.price.toString()
        //   });
        //   functions.logger.info("Document written with ID: ", docRef.id);
        // } catch (e) {
        //   functions.logger.info("Error adding document: ", e);
        // }
      } else {
        functions.logger.info("nothing cool here", i)
      }
    }  
  }

  await processAllResults(resultSlice)
  
});

app.post('/candy', async (req, res) => { 

  const connection = new Connection("https://pentacle.genesysgo.net", "confirmed");
  const metaPubKey = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
  const creatorPubkey = new PublicKey(req.body.candyMachineId)

  const a = await connection.getProgramAccounts(
    metaPubKey,
    {
      encoding: "base64",
      filters: [
        {
          memcmp: {
            offset: 326,
            bytes: creatorPubkey.toBase58(),
          },
        },
      ],
    }
  );

  const deserialized = a.map((b) =>
    deserializeUnchecked(METADATA_SCHEMA, Metadata, b.account.data)
  );
  const allPK = deserialized.map((g) => new PublicKey(g.mint).toBase58())
  
  function chunk (arr, len) {

    var chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
  }

  const chunks = chunk(allPK, 10)

  for (let i = 0; i < chunks.length; i++) {

    let todo = {
      chunk: JSON.stringify(chunks[i])
    };

    // fetch('https://us-central1-minty-8755c.cloudfunctions.net/widgets/handleChunk', {
    //       method: 'POST',
    //       body: JSON.stringify(todo),
    //       headers: { 'Content-Type': 'application/json' }
    //     }).then(res => res.json())

  }

  try {
    const docRef = await addDoc(collection(db, "big-candy-storage"), {
      name: req.body.name,
      candyMachineId: req.body.candyMachineId
    });
    functions.logger.info("Document written with ID: ", docRef.id);
  } catch (e) {
    functions.logger.info("Error adding document: ", e);
  }

  const l = {
    "msg": "Received POST request"
  }
  res.send(JSON.stringify(l)); 

});

app.post('/handleChunk', async (req, res) => {


  const chunk = JSON.parse(req.body.chunk)

  try {
    const docRef = await addDoc(collection(db, "big-candy-storage"), {
      wallet: chunk.length
    });
    functions.logger.info("Document written with ID: ", docRef.id);
  } catch (e) {
    functions.logger.info("Error adding document: ", e);
  }

  // for (let i = 0; i < chunk.length; i++) {
  //   try {
  //     const docRef = await addDoc(collection(db, "candy-storage"), {
  //       wallet: chunk.length
  //     });
  //     functions.logger.info("Document written with ID: ", docRef.id);
  //   } catch (e) {
  //     functions.logger.info("Error adding document: ", e);
  //   }
  // }

  const l = {
    "msg": "Received POST request"
  }
  res.send(JSON.stringify(l)); 

});


exports.widgets = functions.https.onRequest(app)
