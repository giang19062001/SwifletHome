document.addEventListener("DOMContentLoaded", function () {
    const btnConnect = document.getElementById("btn-connect-wallet");
    const walletIdEl = document.getElementById("wallet-id");
    const coinBalanceEl = document.getElementById("coin-balance");

    // Check if Web3 is injected (MetaMask)
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);

        btnConnect.addEventListener("click", async () => {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                
                // Update UI for wallet ID
                walletIdEl.textContent = account;
                walletIdEl.classList.remove("text-muted");
                btnConnect.textContent = "Đã kết nối";
                btnConnect.classList.remove("btn-success");
                btnConnect.classList.add("btn-secondary");

                // Get balance
                fetchBalance(web3, account);

                // Listen for account changes
                window.ethereum.on('accountsChanged', function (accounts) {
                    if(accounts.length > 0){
                        walletIdEl.textContent = accounts[0];
                        fetchBalance(web3, accounts[0]);
                    } else {
                        walletIdEl.textContent = "Chưa kết nối ví";
                        coinBalanceEl.textContent = "0";
                        walletIdEl.classList.add("text-muted");
                        btnConnect.textContent = "Kết nối Ví (MetaMask)";
                        btnConnect.classList.add("btn-success");
                        btnConnect.classList.remove("btn-secondary");
                    }
                });

                // Listen for chain changes
                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });

            } catch (error) {
                console.error("User denied account access or error occurred:", error);
                alert("Lỗi khi kết nối ví: " + error.message);
            }
        });
    } else {
        btnConnect.addEventListener("click", () => {
            alert("Vui lòng cài đặt MetaMask hoặc một ví Web3 để sử dụng chức năng này!");
        });
    }

    async function fetchBalance(web3Instance, account) {
        try {
            const balanceWei = await web3Instance.eth.getBalance(account);
            const balanceMatic = web3Instance.utils.fromWei(balanceWei, 'ether');
            coinBalanceEl.textContent = parseFloat(balanceMatic).toFixed(4) + " POL";
            coinBalanceEl.classList.remove("text-muted");
        } catch (error) {
            console.error("Error fetching balance:", error);
            coinBalanceEl.textContent = "Lỗi khi tải số dư";
        }
    }
});
