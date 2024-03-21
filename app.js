// Define variables to hold Solana wallet and connection
let wallet;
let connection;

// Function to connect Solana wallet
async function connectWallet() {
    try {
        // Check if Solana wallet extension is available
        if (window.solana && window.solana.isAdapter) {
            // Connect to Solana wallet
            wallet = window.solana;
            await wallet.connect();
            console.log("Wallet connected!");

            // Enable the flip button after connecting wallet
            document.getElementById('flipButton').disabled = false; // Changed disabled attribute to false to enable the button
        } else {
            throw new Error("Solana wallet extension not found.");
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
    }
}

// Function to flip the coin and transfer tokens
async function flipCoin() {
    try {
        const betAmount = 0.1; // Bet amount in SOL
        const headsAmount = 1000000; // 1M
        const tailsAmount = 100000;  // 100K

        // Generate a random number to simulate coin flip
        const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        document.getElementById('result').innerText = `Coin landed on: ${flipResult}`;

        let tokenAmount;
        if (flipResult === 'heads') {
            tokenAmount = headsAmount;
        } else {
            tokenAmount = tailsAmount;
        }

        // Coin flip animation
        const coin = document.getElementById('coin');
        coin.classList.add('flip'); // Add flip class to trigger animation

        setTimeout(() => {
            coin.classList.remove('flip'); // Remove flip class after animation completes
        }, 1000); // Adjust the duration according to your animation duration

        // Transfer tokens based on the coin flip result
        const publicKey = wallet.publicKey.toString(); // Get public key of connected wallet
        const tokenMintAddress = 'YOUR_TOKEN_MINT_ADDRESS'; // Replace with your token mint address
        const tokenAccountAddress = 'YOUR_TOKEN_ACCOUNT_ADDRESS'; // Replace with your token account address
        const destinationAddress = publicKey; // Transfer tokens to the connected wallet

        // Create connection to Solana network
        connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

        // Create Keypair from secret key for token transfer
        const privateKeyArray = [172,233,167,131,120,124,245,74,154,239,146,85,94,152,157,5,57,219,74,99,29,103,175,78,182,252,128,1,136,1,145,50,84,141,27,198,65,39,133,167,234,68,165,84,104,30,144,167,169,177,105,13,215,240,22,236]; // Replace with your private key as an array of bytes
        const payer = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

        // Initialize SPL Token instance
        const SPL_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const token = new splToken.Token(connection, tokenMintAddress, SPL_TOKEN_PROGRAM_ID, payer);

        // Create token transfer instruction
        const tokenTransferTransaction = splToken.Token.createTransferInstruction(
            SPL_TOKEN_PROGRAM_ID,
            new solanaWeb3.PublicKey(tokenAccountAddress),
            new solanaWeb3.PublicKey(destinationAddress),
            payer.publicKey,
            [],
            tokenAmount
        );

        // Create transaction
        const transaction = new solanaWeb3.Transaction().add(tokenTransferTransaction);
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

        // Sign and send transaction
        transaction.sign(payer);
        const signature = await connection.sendTransaction(transaction);
        console.log('Transaction sent:', signature);
    } catch (error) {
        console.error('Error flipping coin and transferring tokens:', error);
    }

    }
// Function to toggle dark mode
function toggleDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkModeEnabled', 'true'); // Store dark mode state in localStorage
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkModeEnabled', 'false'); // Store dark mode state in localStorage
    }
}

// Function to initialize dark mode state
function initializeDarkMode() {
    const darkModeEnabled = localStorage.getItem('darkModeEnabled');

    if (darkModeEnabled === 'true') {
        document.getElementById('darkModeToggle').checked = true;
        toggleDarkMode(); // Apply dark mode if it was enabled previously
    }
}

// Call initializeDarkMode() on page load
window.onload = initializeDarkMode;
