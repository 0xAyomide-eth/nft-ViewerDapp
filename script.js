import Web3 from "web3";

let web3;
let UserWalletAddressInput = document.querySelector(".UserAddressInput");
let NftDisplayContainer = document.querySelector(".nft-display-container");
let searchBTN = document.querySelector(".SearchBtn");

// Make sure to add your API key to .env file
const APIKEY = import.meta.env.VITE_ALCHEMY_APIKEY;
const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${APIKEY}`;

// Helper function to show loading state
function showLoading() {
    NftDisplayContainer.innerHTML = `
        <div class="loading-message">
            <div class="loader"></div>
            Loading NFTs...
        </div>
    `;
}

// Helper function to get the best available image URL
function getNFTImageUrl(nft) {
    // Try different possible image locations in the Alchemy response
    if (nft.image && nft.image.pngUrl) {
        return nft.image.pngUrl;
    }
    if (nft.image && nft.image.url) {
        return nft.image.url;
    }
    if (nft.media && nft.media[0] && nft.media[0].gateway) {
        return nft.media[0].gateway;
    }
    if (nft.raw && nft.raw.metadata && nft.raw.metadata.image) {
        let imageUrl = nft.raw.metadata.image;
        // Handle IPFS URLs
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        return imageUrl;
    }
    return null;
}

// Helper function to validate Ethereum address
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

async function GetNFTData() {
    try {
        const UserAddy = UserWalletAddressInput.value.trim();

        if (UserAddy === "") {
            alert("User Input cannot be empty!!");
            return;
        }

        if (!isValidEthereumAddress(UserAddy)) {
            alert("Please enter a valid Ethereum address (0x followed by 40 characters)");
            return;
        }

        showLoading();
        console.log("Fetching NFT data from this address:", UserAddy);

        // Fetch NFTs with more comprehensive parameters
        const response = await fetch(`${baseURL}/getNFTsForOwner?owner=${UserAddy}&pageSize=50&withMetadata=true`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        const ActualNFTData = await response.json();
        console.log("NFT Data received:", ActualNFTData);

        let OwnedNFTs = ActualNFTData.ownedNfts;

        if (!OwnedNFTs || OwnedNFTs.length === 0) {
            NftDisplayContainer.innerHTML = '<div class="no-nfts-message">🎨 User Owns 0 NFTs</div>';
            return;
        }

        // Clear container and display NFTs
        NftDisplayContainer.innerHTML = "";
        
        const htmlContent = OwnedNFTs.map(nft => {
            const imageUrl = getNFTImageUrl(nft);
            const nftName = nft.name || nft.contract.name || `NFT #${nft.tokenId}` || "Unnamed NFT";
            const tokenType = nft.tokenType || "ERC721";
            const tokenId = nft.tokenId || nft.id?.tokenId || "Unknown";
            
            // Truncate long token IDs
            const shortTokenId = tokenId.length > 10 ? tokenId.substring(0, 8) + "..." : tokenId;
            
            return `
                <div class="nft-card">
                    <div class="nft-image-container">
                        ${imageUrl ? 
                            `<img class="nft-image" src="${imageUrl}" alt="${nftName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'nft-image-placeholder\'>🎨<br>Image not available</div>'">` : 
                            `<div class="nft-image-placeholder">🎨<br>No image available</div>`
                        }
                    </div>
                    <div class="nft-info">
                        <div class="nft-name">${escapeHtml(nftName)}</div>
                        <div class="nft-details">
                            <span class="nft-token-type">${tokenType}</span>
                            <span class="nft-token-id">ID: ${escapeHtml(shortTokenId)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        NftDisplayContainer.innerHTML = htmlContent;
        
    } catch(err) {
        console.error("Error fetching NFTs:", err);
        NftDisplayContainer.innerHTML = `<div class="error-message">❌ Error: ${escapeHtml(err.message)}<br><br>Please check your API key and try again.</div>`;
    }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Add enter key support
UserWalletAddressInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        GetNFTData();
    }
});

searchBTN.addEventListener("click", GetNFTData);

// Optional: Initialize Web3 if needed for future features
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Web3 initialized");
        } catch (error) {
            console.error("User denied account access");
        }
    } else {
        console.log("MetaMask not detected");
    }
}

initWeb3();