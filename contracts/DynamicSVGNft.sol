// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSVGNft is ERC721 {
    uint256 private s_tokenCounter;

    string private i_lowImageUri;
    string private i_highImageUri;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;

    mapping(uint256 => int256) public s_tokenIdtoHighValue;

    event CreatedNFT(uint256 tokenId, int256 highValue);

    constructor(address priceFeedAddress, string memory lowSvg, string memory highSvg)
        ERC721("Dynamic SVG NFT", "DSN")
    {
        s_tokenCounter = 0;
        i_lowImageUri = svgToImageUri(lowSvg);
        i_highImageUri = svgToImageUri(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(string memory svg) public pure returns (string memory) {
        string memory svgBaseEncoded = Base64.encode(bytes(string(abi.encodePacked(svg))));

        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBaseEncoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdtoHighValue[s_tokenCounter] = highValue;
        s_tokenCounter++;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        string memory imageURI;

        (, int256 price,,,) = i_priceFeed.latestRoundData();

        if (price >= s_tokenIdtoHighValue[s_tokenCounter]) {
            imageURI = i_highImageUri;
        }

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name(),
                            '", "description":"An NFT that changes based on ETH price",',
                            '"attributes":[{"trait_type":"coolness","value":100}], "image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function getLowSVG() public view returns (string memory) {
        return i_lowImageUri;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
