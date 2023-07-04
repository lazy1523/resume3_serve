import { Injectable } from '@nestjs/common';

interface RPC {
    name: string;
    url: string;
    chainId: number;
  }
  
  interface USDAddrs {
    USDCAddr: string;
    USDTAddr: string;
    DAI?: string;
    BUSDAddr?: string;
  }
  
  interface ChainInfo {
    rpc: RPC;
    PoolFactoryAddr: string;
    QuoterAddr: string;
    SwapRouterAddr: string;
    WETHAddr: string;
    NATIVE_ETH_ADDRESS?: string;
    USDAddrs: USDAddrs;
    SubBundlerAddr?: string;
  }

@Injectable()
export class ChainIdService {
    private readonly nameToChainInfo: { [key: number]: ChainInfo } = {
    1: {
        rpc: {
            name: "Ethereum Mainnet",
            url: "https://rpc.ankr.com/eth",
            chainId: 1
        },
        PoolFactoryAddr: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        QuoterAddr: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        SwapRouterAddr: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        WETHAddr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        NATIVE_ETH_ADDRESS:'0x0000000000000000000000000000000000000000',
        USDAddrs: {
            USDCAddr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            USDTAddr: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        }
    },

    31337:{
        rpc: {
            name: "Local Fork Ethereum Mainnet",
            url: "http://localhost:8545",
            chainId: 31337
        },
        PoolFactoryAddr: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        QuoterAddr: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        SwapRouterAddr: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        WETHAddr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        NATIVE_ETH_ADDRESS:'0x0000000000000000000000000000000000000000',
        USDAddrs: {
            USDCAddr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            USDTAddr: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        },
        SubBundlerAddr: '0xa635fD1c2e67d2e6551b3037699DF2AB5B8Dba09' //fork mainnet to local
    },
    137:{
        rpc: {
            name: "Polygon",
            url: "https://matic-mainnet.chainstacklabs.com",
            chainId: 137
        },
        PoolFactoryAddr: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        QuoterAddr: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        SwapRouterAddr: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        WETHAddr: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        NATIVE_ETH_ADDRESS:'0x0000000000000000000000000000000000000000',
        USDAddrs: {
            USDCAddr: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            USDTAddr: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            DAI: '0x8F3cf7ad23cd3cADbd9735afe958023239c6a063',

        },
        SubBundlerAddr: '0xd6322a2842b0818505Fd810179AC401c461E1397'
    },

    56:{
        rpc: {
            name: "BNBChain",
            url: "https://bsc.nodereal.io",
            chainId: 56
        },
        PoolFactoryAddr: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
        QuoterAddr: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
        SwapRouterAddr: '0x11AF00243EEdEae29B07E0e9A26e1CcE98df8c29',
        WETHAddr: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        NATIVE_ETH_ADDRESS:'0x0000000000000000000000000000000000000000',
        USDAddrs: {
            USDCAddr: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            USDTAddr: '0x55d398326f99059fF775485246999027B3197955',
            BUSDAddr: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',

        },
        SubBundlerAddr: '0xd6322a2842b0818505Fd810179AC401c461E1397'
    },
    10:{
        rpc: {
            name: "Optimism",
            url: "https://mainnet.optimism.io",
            chainId: 10
        },
        PoolFactoryAddr: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        QuoterAddr: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        SwapRouterAddr: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        WETHAddr: '0x4200000000000000000000000000000000000006',
        NATIVE_ETH_ADDRESS:'0x0000000000000000000000000000000000000000',
        USDAddrs: {
            USDCAddr: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
            USDTAddr: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
        },
        SubBundlerAddr: '0xd6322a2842b0818505Fd810179AC401c461E1397'
    },
  };
  
  getChainInfoByChainId(chainId: number): ChainInfo | undefined {
    return this.nameToChainInfo[chainId];
  }
}
