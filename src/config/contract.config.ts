export const contractABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'string',
          name: 'jsonData',
          type: 'string',
        },
      ],
      name: 'DataRecorded',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: '_jsonData',
          type: 'string',
        },
      ],
      name: 'recordJson',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];