export const CONFIG = {
  GLW_TOKEN_ADDRESS: "0xf4fbc617a5733eaaf9af08e1ab816b103388d8b6",
  USDC_TOKEN_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  EXCHANGE_ADDRESS: "0x1234567890123456789012345678901234567890", // Replace with your actual exchange contract address
  CHAIN_ID: 1, // Ethereum Mainnet
};

export const GLW_TOKEN_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)"
];