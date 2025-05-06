export const userEscrows = 
    [
        {
          "escrowId": "ESC-1001",
          "receiver": "0x9aF3...D4B2",
          "amount": "5000 USDT",
          "paymentType": "Milestone",
          "jurisdiction": "US",
          "status": "Active",
          "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000001"
        },
        {
          "escrowId": "ESC-1002",
          "receiver": "0x7cB2...9Af0",
          "amount": "1500 USDT",
          "paymentType": "Full",
          "jurisdiction": "EU",
          "status": "Completed",
          "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000002"
        },
        {
          "escrowId": "ESC-1003",
          "receiver": "0xB3A8...F71C",
          "amount": "3200 USDT",
          "paymentType": "Milestone",
          "jurisdiction": "UAE",
          "status": "In Dispute",
          "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000003"
        },
        {
          "escrowId": "ESC-1004",
          "receiver": "0x48C9...0A1E",
          "amount": "780 USDT",
          "paymentType": "Full",
          "jurisdiction": "US",
          "status": "Completed",
          "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000004"
        },
        {
          "escrowId": "ESC-1005",
          "receiver": "0x2fE4...A9C3",
          "amount": "2900 USDT",
          "paymentType": "Milestone",
          "jurisdiction": "EU",
          "status": "Active",
          "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000005"
        }
      ]
      


     export const disputesDemoData  = [
        {
          disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
          escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
          disputerAddress: "0xD15PuT3RM3d1aT0R0000000000000000AaAaAaAa",
          status: "under_review",
          unreadMessages: 2,
        },
        {
          disputeAddress: "0xD1sPuT3AaddR3552233445566abcdefABCDEF9999",
          escrowAddress: "0xE5cR0WAaddR3551122334455fedcbaFEDCBA8888",
          disputerAddress: undefined, // maybe a DAO mod
          status: "pending",
          unreadMessages: 0,
        },
        {
          disputeAddress: "0xD1sPuT3AaddR3553344556677abcdefABCDEF7777",
          escrowAddress: "0xE5cR0WAaddR3556677889900fedcbaFEDCBA6666",
          disputerAddress: undefined, // not yet adopted
          status: "pending",
          unreadMessages: 3,
        },
        {
          disputeAddress: "0xD1sPuT3AaddR3557788990011abcdefABCDEF4444",
          escrowAddress: "0xE5cR0WAaddR3555566778899fedcbaFEDCBA2222",
          disputerAddress: "0xDisPutER99999999999999999999999999999999",
          status: "resolved",
          unreadMessages: 0,
        }
      ];
      