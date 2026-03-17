const express =  require('express');
var ejs = require("ejs");
var fs = require("fs");
const mysql = require("mysql")
var staticResource = require("static-resource")
var url = require("url")

//let router = express.Router();
const app = express();

app.use(express.json());

var handler = staticResource.createHandler(fs.realpathSync("./public"));

//const { ClientRequest } = require('http');
const web3 =  require('@solana/web3.js');
const metaplex =  require('@metaplex-foundation/mpl-token-metadata');
const adapters =  require('@metaplex-foundation/umi-web3js-adapters');
const defaults =  require('@metaplex-foundation/umi-bundle-defaults');
const umirequire =  require('@metaplex-foundation/umi');
const serializers =  require('@metaplex-foundation/umi/serializers');


const  endpointweb3 = require('./app_meta_connection.js');
const port = endpointweb3.portweb3; 

//base  ****************************************************************** /
const connection = mysql.createConnection({
 host: endpointweb3.host,
 user: endpointweb3.user,
 password: endpointweb3.password,
 database: endpointweb3.database
}); 

//=====================================================================================
const crypto = require('crypto')

const secret = 'aabbcccaabutyrtetryunchdhfgdhgre';

const encrypt = value => {
    const iv = Buffer.from(crypto.randomBytes(16))
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv)
    let encrypted = cipher.update(value)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

const decrypt = value => {
  const [iv, encrypted2] = value.split(':')
  const ivBuffer = Buffer.from(iv, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), ivBuffer)
  let content = decipher.update(Buffer.from(encrypted2, 'hex'))
  content = Buffer.concat([content, decipher.final()])
  return content.toString()
}

//=======================================================================================
var pagadora = '';
var linkimagemtoken = '';

var sql = "SELECT id,secret_key FROM blockchain_carteiraxx WHERE tipo = 'principal' and status = 'A' limit 1";
connection.query(sql,function(err,result,fields){
	  if(err) throw err;
	   pagadora = result[0].secret_key
  }); 


app.get("/:tipo/:idprojeto/:idproduto/:prefixoprojeto/:nomeprojeto",function(req,res){
    var idprojeto = req.params.idprojeto
    var idproduto = req.params.idproduto
    var prefixoprojeto = req.params.prefixoprojeto //maximo 4 caracteres (SIMBOLO TOKEN)
    var nomeprojeto = req.params.nomeprojeto //maximo 30 caracteres

    var path = url.parse(req.url).pathname;
   
    var str_token = '';
    var strNOMEPROJETO = nomeprojeto;
   
   var sql2 = " SELECT token FROM blockchain_tokenxx WHERE id_projeto = "+ idprojeto +"  and id_produto = "+ idproduto +" AND tipo = 'projeto'";
   connection.query(sql2,function(err,result,fields){
     if(err) throw err;
          result.forEach(async (val) => {
            objectOffer = val;
            str_token =  objectOffer.token
      });       
     

   if (path.slice(1, 9) === "metadata" && idprojeto != "favicon.png") {
      const  uploadimagemmetadados = async () =>{
      const Arweave =  require('arweave')
      const arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
      logging: false,
    });

      const wallet = JSON.parse(fs.readFileSync("wallet_arweave.json", "utf-8"))
      
      //fazer upload de imagem na arweave
      const data = fs.readFileSync("./imagens/validado3.png");
        
      const transaction = await arweave.createTransaction({
        data: data,
      });
         
      transaction.addTag("Content-Type", "image/png");
    
      await arweave.transactions.sign(transaction, wallet);

      const response = await arweave.transactions.post(transaction);
      //console.log(response);

      const id = transaction.id;
      const imageUrl = id ? `https://arweave.net/${id}` : undefined;
      console.log("imageUrl", imageUrl);
    
      linkimagemtoken = imageUrl
      
      criametadados()
    }

        // GERAR TOKENS E CONTA DE TOKENS**************************************************
        const  criametadados = async () =>{
              var sitecadastrar ={
              "name": strNOMEPROJETO ,
              "symbol": prefixoprojeto,
              "description": "teste - projetos  ",
              "image": linkimagemtoken
             };
          
            var datametados = JSON.stringify(sitecadastrar);

            fs.writeFileSync('./metadados/metadados_'+ idprojeto +'_'+ idproduto +'.json',datametados);
//=============================================================================
            //pagadora taxa
            pagadora =   decrypt(pagadora)
            pagadora =  eval('['+ pagadora + ']')

            const WALLET_PAGADORA = new   Uint8Array(pagadora)
            const feePayer = web3.Keypair.fromSecretKey(WALLET_PAGADORA);
            const clusterweb3 = endpointweb3.cluster; 
        
          if (clusterweb3 == 'devnet'){
            connectionweb3 = new web3.Connection(web3.clusterApiUrl(endpointweb3.cluster), {
              commitment: "confirmed",
            })
          }else{
            connectionweb3 = new web3.Connection(clusterweb3);
          }
          
          const umi = defaults.createUmi(connectionweb3)
            
        //UPLOAD JSON ARWEAVE =============================================================================
          const Arweave =  require('arweave')
          const arweave = Arweave.init({
          host: "arweave.net",
          port: 443,
          protocol: "https",
          timeout: 20000,
          logging: false,
        });

  const wallet = JSON.parse(fs.readFileSync("wallet_arweave.json", "utf-8"))


    //metadados arauivo json====================================================
    const metadataRequest = datametados;
    const metadataTransaction = await arweave.createTransaction({
      data: metadataRequest,
    });

    metadataTransaction.addTag("Content-Type", "application/json");

    await arweave.transactions.sign(metadataTransaction, wallet);
    await arweave.transactions.post(metadataTransaction);
    console.log("metadata txid: ", metadataTransaction.id);
    const imageUrlJSON = metadataTransaction.id ? `https://arweave.net/${metadataTransaction.id}` : undefined;

    //========================================================
  
    const web3jsKeyPair = feePayer // load your keypair here
    const keypair = adapters.fromWeb3JsKeypair(web3jsKeyPair);
    const signer = umirequire.createSignerFromKeypair(umi, keypair);
    umi.identity = signer;
    umi.payer = signer;

    let CreateMetadataAccountV3Args = {
      mint: adapters.fromWeb3JsPublicKey(new web3.PublicKey(str_token)),
      mintAuthority: signer,
      payer: signer,
      updateAuthority: adapters.fromWeb3JsKeypair(web3jsKeyPair).publicKey,
      data: {
          name:  strNOMEPROJETO ,
          symbol: prefixoprojeto,
          uri: imageUrlJSON,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null
      },
      isMutable: true,
      collectionDetails: null,
    }

    let instruction = metaplex.createMetadataAccountV3(
        umi,
        CreateMetadataAccountV3Args
    )

    const transaction2 = await instruction.buildAndSign(umi);

    const transactionSignature = await umi.rpc.sendTransaction(transaction2);
    const signature = serializers.base58.deserialize(transactionSignature);
    console.log({signature})

    res.json({ message: 'metadados ok' });
  
  }
   
    uploadimagemmetadados();
  
    }else if (path.slice(1, 12) === "imgmetadata" && idprojeto != "favicon.png") { 
        const  uploadimagemmetadados = async () =>{
        const Arweave =  require('arweave')
        const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 20000,
        logging: false,
      });

      const wallet = JSON.parse(fs.readFileSync("wallet_arweave.json", "utf-8"))
      
      //fazer upload de imagem na arweave
        const data = fs.readFileSync("./imagens/validado3.png");
        const transaction = await arweave.createTransaction({
          data: data,
        });
         
        transaction.addTag("Content-Type", "image/png");
     
        await arweave.transactions.sign(transaction, wallet);

        const response = await arweave.transactions.post(transaction);
        console.log(response);

        const id = transaction.id;
        const imageUrl = id ? `https://arweave.net/${id}` : undefined;
        console.log("imageUrl", imageUrl);

        res.json({ message: 'upload imagem ok' });

      }

        uploadimagemmetadados()

      } else {
        if (!handler.handle(path, req, res)) {
            res.writeHead(404);
            res.write("404");
            res.end();
        }
      }

  });

}); 

app.listen(port, () =>{
  console.log(`Servidor rodando na porta ${port}`)
})

