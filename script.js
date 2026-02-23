import Web3 from "web3";

let web3;
let UserWalletAddress

let WalletConnectBtn = document.querySelector(".WalletConnectBtn")
let CurrentChainID = document.querySelector(".CurrentChainName")
let UserWalletAddressInput = document.querySelector(".UserAddressInput")

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