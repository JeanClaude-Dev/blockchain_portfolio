
//SERVIDOR=================================================================================================
                //const strportweb3 = 8080 ou 8081 ou 3000
                const strportweb3 = 3333

//ENDPOINT=================================================================================================
                //DEVNET
                //const endpointweb3 = "devnet"
              
                //MAINNET
                //criada endpoint quicknode 
                const endpointweb3 = "seu endpoint"

//BASE DADOS  ===============================================================================================
              
                //PRODUCAO
                
                const strhost =  'xxx.xxx.xxx.xx';
                const struser =  'xxxxxxxxxxxxx';
                const strpassword =  'xxxxxxxxxxxx';
                const strdatabase =  'xxxxxxxxxxxxx';
                

 // ======================================================================================================
module.exports = {
    host: strhost,
    user: struser,
    password: strpassword,
    database: strdatabase,
    cluster : endpointweb3,
    portweb3: strportweb3 
 }
