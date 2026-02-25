import Web3 from "web3";

let web3;

let UserWalletAddressInput = document.querySelector(".UserAddressInput")
let NftDisplayContainer = document.querySelector(".nft-display-container")
let searchBTN = document.querySelector(".SearchBtn")

const APIKEY = import.meta.env.VITE_ALCHEMY_APIKEY
const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${APIKEY}`

async function GetNFTData() {
    try {
        const UserAddy = UserWalletAddressInput.value

        if (UserAddy !== "") {
            console.log("fetching nft data from this addy:", UserAddy)
            console.log("...")

            const NFTData = await fetch(`${baseURL}/getNFTsForOwner?owner=${UserAddy}&pageSize=5`)
            const ActualNFTData = await NFTData.json()
            console.log(ActualNFTData)

            let OwnedNFTs = ActualNFTData.ownedNfts
            if (OwnedNFTs <= 0) {
                NftDisplayContainer.innerHTML = "User Owns 0 NFTs"
            } else {
                NftDisplayContainer.innerHTML = " "
                const htmlContent = OwnedNFTs.map(data => `
               <div style = " width: 300px; height: 300px; border: white 1px solid; margin:10px; " >
                <div style="   background: url('${data.image.pngUrl}') center no-repeat; width: 300px; height: 230px;"> 
                <div style="width: 300px; height: 70px; background-color: white;">
                <div style="display: flex; align-items: center; justify-content: space-around;">
                <p class="name"><p>NFT Name:</p>${data.name}</p>
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 0px 10px;">
                        <p>Token Type:<p>${data.tokenType}</p></p>
                        <p>Token ID:<p>${data.tokenID}</p></p>                
                </div>
                </div>
                </div>
                </div>
            </div>
        `
                ).join('')
                NftDisplayContainer.innerHTML += htmlContent
            }
        }else{
            alert("User Input cannot be empty!!")
        }
    } catch(err) {
        NftDisplayContainer.innerHTML = err.message
    }
}


searchBTN.addEventListener("click", GetNFTData)