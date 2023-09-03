const ChainOfTrustAbi = {
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "previousAdmin",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "newAdmin",
          type: "address",
        },
      ],
      name: "AdminChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "beacon",
          type: "address",
        },
      ],
      name: "BeaconUpgraded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "contractPrevBlock",
          type: "uint256",
        },
      ],
      name: "ContractChange",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "prevDepth",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "depth",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "DepthChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "entity",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "DidChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "by",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "didRegistry",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "status",
          type: "bool",
        },
      ],
      name: "DidRegistryChange",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "parentEntity",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "iat",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "exp",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "GroupMemberChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "revokerEntity",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "parentEntity",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "exp",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "GroupMemberRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bool",
          name: "isRootMaintainer",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "MaintainerModeChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "delegateType",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "by",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "status",
          type: "bool",
        },
      ],
      name: "NewDelegateTypeChange",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "prevRevokeMode",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "revokeMode",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "prevBlock",
          type: "uint256",
        },
      ],
      name: "RevokeModeChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "executor",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "rootManager",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newRootManager",
          type: "address",
        },
      ],
      name: "RootManagerUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "implementation",
          type: "address",
        },
      ],
      name: "Upgraded",
      type: "event",
    },
    {
      inputs: [],
      name: "ALLANCESTORS",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ROOTANDPARENT",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "delegateType",
          type: "bytes32",
        },
      ],
      name: "addDelegateType",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "didRegistryAddress",
          type: "address",
        },
      ],
      name: "addDidRegistry",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "period",
          type: "uint256",
        },
      ],
      name: "addOrUpdateGroupMember",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "parentEntity",
          type: "address",
        },
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "period",
          type: "uint256",
        },
      ],
      name: "addOrUpdateGroupMemberByDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "defaultDelegateType",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "defaultDidRegistry",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "depth",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      name: "didDelegateTypes",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "didRegistries",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "identity",
          type: "address",
        },
      ],
      name: "getDidRegistry",
      outputs: [
        {
          internalType: "address",
          name: "didRegistryAddress",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntityManager",
          type: "address",
        },
      ],
      name: "getMemberDetailsByEntityManager",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "iat",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "exp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "gId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "trustedBy",
              type: "address",
            },
            {
              internalType: "string",
              name: "did",
              type: "string",
            },
            {
              internalType: "bool",
              name: "isValid",
              type: "bool",
            },
          ],
          internalType: "struct IChainOfTrustBase.MemberProfile",
          name: "member",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "group",
      outputs: [
        {
          internalType: "uint256",
          name: "gId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "trustedForwarderAddress",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "chainDepth",
          type: "uint8",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
        {
          internalType: "address",
          name: "rootEntityManager",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "revokeMode",
          type: "uint8",
        },
        {
          internalType: "bool",
          name: "rootMaintainer",
          type: "bool",
        },
        {
          internalType: "address",
          name: "didRegistry",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "delegateType",
          type: "bytes32",
        },
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "isRootMaintainer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "identity",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "delegateType",
          type: "bytes32",
        },
      ],
      name: "isValidDelegateType",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "manager",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "memberCounter",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "prevBlock",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "proxiableUUID",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "delegateType",
          type: "bytes32",
        },
      ],
      name: "removeDelegateType",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "removeDidRegistry",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "revokeConfigMode",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMember",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMemberByAnyAncestor",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "ancestor",
          type: "address",
        },
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMemberByAnyAncestorByTheirDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "parentEntity",
          type: "address",
        },
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMemberByDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMemberByRoot",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "memberEntity",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "revokeMemberByRootByTheirDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newRootManager",
          type: "address",
        },
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "transferRoot",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "trustedBy",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "trustedList",
      outputs: [
        {
          internalType: "uint256",
          name: "iat",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "exp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "chainDepth",
          type: "uint8",
        },
      ],
      name: "updateDepth",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "did",
          type: "string",
        },
      ],
      name: "updateDid",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bool",
          name: "rootMaintainer",
          type: "bool",
        },
      ],
      name: "updateMaintainerMode",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "revokeMode",
          type: "uint8",
        },
      ],
      name: "updateRevokeMode",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newImplementation",
          type: "address",
        },
      ],
      name: "upgradeTo",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newImplementation",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "upgradeToAndCall",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [
        {
          internalType: "uint16",
          name: "",
          type: "uint16",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
export default ChainOfTrustAbi;
