// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    string private _customName;
    string private _customSymbol;
    uint8 private _customDecimals;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_
    ) ERC20(name_, symbol_) {
        _customName = name_;
        _customSymbol = symbol_;
        _customDecimals = decimals_;
        owner = msg.sender;
        _mint(owner, totalSupply_);
    }

    function name() public view override returns (string memory) {
        return _customName;
    }

    function symbol() public view override returns (string memory) {
        return _customSymbol;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function batchSendNative(address payable[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(address(this).balance >= totalAmount, "Contract's native balance is insufficient");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool sent, ) = recipients[i].call{value: amounts[i]}("");
            require(sent, "Native token transfer failed");
        }
    }

    function batchSendToken(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(balanceOf(owner) >= totalAmount, "Owner's token balance is insufficient");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(owner, recipients[i], amounts[i]);
        }
    }

    function sendNative(address payable recipient, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Contract's native balance is insufficient");
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Native token transfer failed");
    }

    function sendToken(address recipient, uint256 amount) external onlyOwner {
        _transfer(owner, recipient, amount);
    }

    receive() external payable {}
}
