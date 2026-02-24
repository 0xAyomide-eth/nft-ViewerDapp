import Web3 from "web3";

let web3;
let UserWalletAddress

let WalletConnectBtn = document.querySelector(".WalletConnectBtn")
let CurrentChainID = document.querySelector(".CurrentChainName")
let UserWalletAddressInput = document.querySelector(".UserAddressInput")
let NftDisplayContainer = document.querySelector(".nft-display-container")
let searchBTN = document.querySelector(".SearchBtn")

async function CheckChainID() {
    web3 = new Web3(window.ethereum)
    const ChainID = await web3.eth.getChainId()
    if (ChainID === 1n) {
        console.log("connected to ethereum successfully")
        CurrentChainID.innerHTML = "Ethereum"
    } else {
        /*console.log("Unsupported chain! please switch chains")
        CurrentChainID.innerHTML = "Unsupported Chain"*/

        try { //automatically switches the chain to eth if the user connects with the wrong chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }],
            })
            console.log("switched to ethereum mainnet")

        } catch (err) {
            console.error("cant switch to mainnet", err)
            return
        }
    }
}

async function WalletConnect() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum)
        try {
            //wallet connect feature
            const UserAccount = await window.ethereum.request({ method: "eth_requestAccounts" })

            //get the user wallet address
            UserWalletAddress = (await web3.eth.getAccounts())[0]
            WalletConnectBtn.innerHTML = `${UserWalletAddress.slice(0, 6)}...${UserWalletAddress.slice(38, 43)}`
            //checks if the user is connected to eth
            CheckChainID()

        } catch (err) {
            console.error("An error occured:", err.message)
        }


    } else {
        console.error("please install metamask")
    }
}

WalletConnectBtn.addEventListener("click", WalletConnect)


const APIKEY = import.meta.env.VITE_ALCHEMY_APIKEY
const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${APIKEY}`

async function GetNFTData(){
    try{
       const UserAddy = UserWalletAddressInput.value
       console.log("fetching nft data from this addy:", UserAddy)
       console.log("...")

       const NFTData = await fetch(`${baseURL}/getNFTsForOwner?owner=${UserAddy}&pageSize=5`)
       const ActualNFTData = await NFTData.json()
       console.log(ActualNFTData)

       let OwnedNFTs = ActualNFTData.ownedNfts
       const htmlContent = OwnedNFTs.map(data=> `
               <div style = " width: 300px; height: 300px; margin: 10px; border: white 1px solid; position: relative; background: url('${data.image.pngUrl}') center no-repeat;" >
                <div style="   background-color: white; position: absolute; bottom: 0;  width: 100%; height: 70px;">
                    <p style = "margin-left: 18px; padding: 10px;">${data.name}</p>
                    <div style = "display:flex; align-items:center; justify-content: space-around;">
                        <p>${data.tokenType}</p>
                        <p>${data.tokenId}</p>
                    </div>
                </div>
            </div>
        `

       ).join('')

     NftDisplayContainer.innerHTML += htmlContent
    }catch(err){
        console.log(err)
    }
}


searchBTN.addEventListener("click", GetNFTData)