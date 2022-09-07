export default {
  "did":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
  "mainKeyPair":{
    "privateKey":"b77eb711fabbd91dbfed4e79cb0554300580c35254c9d2e7d2e4f8ff6fd76523"
  },
  "controllerKeyPair":{
    "address":"0xf371392a70f11f3ab30138dab7266100e5ec5340",
    "publicKey":"040e30f293b6e1bd044fc7efbecc23820fa6b16baaa5855397a96f01e121755b863e101cc4fba2a73a330a0157a1599231432e28a1d30167fc9fdcffb4782f5523",
    "privateKey":"8d0a3dc79cf4fc0a38182fa154edf35e14f9d178140f20eaecb0f7f04cb00db4"
  },
  "encryptionKeyPair":{
    "publicKey":"1a3ff7a121ffcb36e15521d7e0f0664ddae4e93d6902b1d72c72ffc0b6e21a10",
    "privateKey":"8195aef327835586e3e015f9c654cb4dc13c6d748ba29498d157e2d2380feaa51a3ff7a121ffcb36e15521d7e0f0664ddae4e93d6902b1d72c72ffc0b6e21a10"
  },
  "credentials":[
    {
      "@context":[
        "https://www.w3.org/2018/credentials/v1",
        "https://credentials-library.lacchain.net/credentials/trusted/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vaccination/v1"
      ],
      "type":[
        "VerifiableCredential",
        "VaccinationCertificate"
      ],
      "id":"urn:uuid:6b23c081-82e8-4506-bca9-bbc0eb08440f",
      "name":"COVID-19",
      "issuer":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2",
      "issuanceDate":"2022-09-06T23:17:08.848Z",
      "expirationDate":"2022-10-26T23:17:00.052Z",
      "trustedList":"0x8ed6256Ff89d1710dFD06D08708535aD6D1B120E",
      "credentialSubject":{
        "id":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
        "type":"VaccinationEvent",
        "batchNumber":"345345",
        "administeringCentre":"Centro de Vacunacion de Coatepeque",
        "healthProfessional":"Centro de Vacunacion de Coatepeque",
        "countryOfVaccination":"El Salvador",
        "order":"2",
        "recipient":{
          "type":"VaccineRecipient",
          "givenName":"Juan",
          "familyName":"Perez",
          "gender":"male",
          "birthDate":"05-02-1987"
        },
        "vaccine":{
          "type":"Vaccine",
          "disease":"COVID-19",
          "atcCode":"J07BX03"
        }
      },
      "credentialStatus":{
        "id":"0x82F1f28e4EA6F8F41e7720853a2D2DD127c317E9",
        "type":"SmartContract"
      },
      "credentialHash":"0x905cdbc32166671c669c01cfa7c887903d8706ff01e5d3fb6372b9888f84c99e",
      "proof":[
        {
          "type":"EcdsaSecp256k1Signature2019",
          "created":"2022-09-06T23:17:11.211Z",
          "proofPurpose":"assertionMethod",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-0",
          "domain":"0xB75951ca8dc29841e4d82d7e40867A745E62867b",
          "proofValue":"0x48f558179fb1b1246ca1556ac443254f0b86cb3a38f1cca333534594461113c641228019ffa2544c8bf89c73ab3177050e8873717ce3ebcfd5fd8ea52e92bac71b"
        },
        {
          "type":"BbsBlsSignature2020",
          "created":"2022-09-06T23:17:13Z",
          "proofPurpose":"assertionMethod",
          "proofValue":"tvbTY6rq1N7gipz1v5+A4nar/sWRVii/cMZBJfjjvmknOagCEZYA6kIlGNGmnsjdanFkjWgZWz3LIk3kUlHUxLwO8sWNjr6GFEwhvGthySoh/2aSNKUhfto4E/QRQiUB/9CSNCR3QAqB63bXbn8ziw==",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-3"
        }
      ]
    },
    {
      "@context":[
        "https://www.w3.org/2018/credentials/v1",
        "https://credentials-library.lacchain.net/credentials/trusted/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vaccination/v1"
      ],
      "type":[
        "VerifiableCredential",
        "VaccinationCertificate"
      ],
      "id":"urn:uuid:c079bf12-5875-4f83-9649-a95db520b47f",
      "name":"Yellow fever",
      "issuer":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2",
      "issuanceDate":"2022-09-06T23:20:05.409Z",
      "expirationDate":"2022-10-19T23:20:02.653Z",
      "trustedList":"0x8ed6256Ff89d1710dFD06D08708535aD6D1B120E",
      "credentialSubject":{
        "id":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
        "type":"VaccinationEvent",
        "batchNumber":"G3455",
        "administeringCentre":"Centro de Vacunacion de Coatepeque",
        "healthProfessional":"Centro de Vacunacion de Coatepeque",
        "countryOfVaccination":"El Salvador",
        "order":1,
        "recipient":{
          "type":"VaccineRecipient",
          "givenName":"Sergio",
          "familyName":"Ceron",
          "gender":"male",
          "birthDate":"26-01-1989"
        },
        "vaccine":{
          "type":"Vaccine",
          "disease":"Yellow fever",
          "atcCode":"J07BL01"
        }
      },
      "credentialStatus":{
        "id":"0x82F1f28e4EA6F8F41e7720853a2D2DD127c317E9",
        "type":"SmartContract"
      },
      "credentialHash":"0x2a766e29a1caeb40dfe458b1dee6399921a29d021641faa07dff2b2154ebf6ef",
      "proof":[
        {
          "type":"EcdsaSecp256k1Signature2019",
          "created":"2022-09-06T23:20:07.270Z",
          "proofPurpose":"assertionMethod",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-0",
          "domain":"0xB75951ca8dc29841e4d82d7e40867A745E62867b",
          "proofValue":"0x90bc211b35575be4b5e7b1834cb4ff2ff45570e282bf2ee52d674c2a9a5e25763ad52fb62a03aa5d3e414d17276e0803bd07cf5200c195102a59eda0af9a508b1b"
        },
        {
          "type":"BbsBlsSignature2020",
          "created":"2022-09-06T23:20:08Z",
          "proofPurpose":"assertionMethod",
          "proofValue":"rLuQg2cZzRhBy9Xng98yfKt2eejFuuK3p46GSPeS5n7cgV7Z40os6an69cjUbb+SOrXMxB6rjc6VHkeA4BOk2NB55zI9Soa3zqtLdMRVnvtf6zKxUsTkMHps+NXN7F9Ag+mwIEUPcgf4Cy7hMmINtg==",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-3"
        }
      ]
    },
    {
      "@context":[
        "https://www.w3.org/2018/credentials/v1",
        "https://credentials-library.lacchain.net/credentials/trusted/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vaccination/v1"
      ],
      "type":[
        "VerifiableCredential",
        "VaccinationCertificate"
      ],
      "id":"urn:uuid:65881df5-1ae8-4faa-ad25-1d7719580b60",
      "name":"COVID-19",
      "issuer":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2",
      "issuanceDate":"2022-09-06T23:21:13.414Z",
      "expirationDate":"2022-09-06T23:21:09.835Z",
      "trustedList":"0x8ed6256Ff89d1710dFD06D08708535aD6D1B120E",
      "credentialSubject":{
        "id":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
        "type":"VaccinationEvent",
        "batchNumber":"E4728",
        "administeringCentre":"Centro de Vacunacion de Coatepeque",
        "healthProfessional":"Centro de Vacunacion de Coatepeque",
        "countryOfVaccination":"El Salvador",
        "order":1,
        "recipient":{
          "type":"VaccineRecipient",
          "givenName":"Marcos",
          "familyName":"Allende",
          "gender":"male",
          "birthDate":"25-02-1994"
        },
        "vaccine":{
          "type":"Vaccine",
          "disease":"COVID-19",
          "atcCode":"J07BX03"
        }
      },
      "credentialStatus":{
        "id":"0x82F1f28e4EA6F8F41e7720853a2D2DD127c317E9",
        "type":"SmartContract"
      },
      "credentialHash":"0xa2e881a17c329ecb4dd46b9e7b4fb303b8ad68856a85b796b250ba92d9e20ccd",
      "proof":[
        {
          "type":"EcdsaSecp256k1Signature2019",
          "created":"2022-09-06T23:21:15.231Z",
          "proofPurpose":"assertionMethod",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-0",
          "domain":"0xB75951ca8dc29841e4d82d7e40867A745E62867b",
          "proofValue":"0xb798c2ba6f0daf50ae1c8cd3d7a59edd72b6bffd30c0ad2b526f7d4084dbd11337dec4dfd5431e25bad431dca9fd711a8e569804d5e464ebdc98c5489cc133031c"
        },
        {
          "type":"BbsBlsSignature2020",
          "created":"2022-09-06T23:21:16Z",
          "proofPurpose":"assertionMethod",
          "proofValue":"j7DxJZi9aGheh2nnXvqqKoWpYIrt722/dKgq0sDEQGDXDYNwKjf9mQcRyunJKFTAPyMDcEP6MDyOh3XPIVjXN4amDvGEv8q2Cj+NJHaC4Y5uMA/i4yg9l4wwdbCAyIQvxBDEpIhZ1TO51aNBhWAXkQ==",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-3"
        }
      ]
    },
    {
      "@context":[
        "https://www.w3.org/2018/credentials/v1",
        "https://credentials-library.lacchain.net/credentials/trusted/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vaccination/v1"
      ],
      "type":[
        "VerifiableCredential",
        "VaccinationCertificate"
      ],
      "id":"urn:uuid:2cf4ce82-94d1-446e-810d-870462b53331",
      "name":"COVID-19",
      "issuer":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2",
      "issuanceDate":"2022-09-06T23:22:02.838Z",
      "expirationDate":"2022-10-20T23:21:58.914Z",
      "trustedList":"0x8ed6256Ff89d1710dFD06D08708535aD6D1B120E",
      "credentialSubject":{
        "id":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
        "type":"VaccinationEvent",
        "batchNumber":"F434555",
        "administeringCentre":"Centro de Vacunacion de Coatepeque",
        "healthProfessional":"Centro de Vacunacion de Coatepeque",
        "countryOfVaccination":"El Salvador",
        "order":1,
        "recipient":{
          "type":"VaccineRecipient",
          "givenName":"Maria",
          "familyName":"Hernandez",
          "gender":"female",
          "birthDate":"14-08-1996"
        },
        "vaccine":{
          "type":"Vaccine",
          "disease":"COVID-19",
          "atcCode":"J07BX03"
        }
      },
      "credentialStatus":{
        "id":"0x82F1f28e4EA6F8F41e7720853a2D2DD127c317E9",
        "type":"SmartContract"
      },
      "credentialHash":"0x9cb5e7ed34ea74fc5158ab741580e17a27141120ec207c03a7d712316cc266b1",
      "proof":[
        {
          "type":"EcdsaSecp256k1Signature2019",
          "created":"2022-09-06T23:22:04.829Z",
          "proofPurpose":"assertionMethod",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-0",
          "domain":"0xB75951ca8dc29841e4d82d7e40867A745E62867b",
          "proofValue":"0xa8a43beb35caaccefa69a2c15c5e41b461d71fbd125b53170088b0b37db38d2b3b34c8b96ad21521958062905af0350f141195a8243e2f9909f94a62a49558ff1c"
        },
        {
          "type":"BbsBlsSignature2020",
          "created":"2022-09-06T23:22:06Z",
          "proofPurpose":"assertionMethod",
          "proofValue":"hOT4yBTDAJrZlODin2NPCVRDDQ7VjZeHYGl6pVtKWnDzRUh2nyGNW6eXs0c7woDoGIzmziM1slU/pmTTnltCOSMLU8Fm8OjX/nSOTx0Jei4Vz2gFOobQzi0C5KIOD7NuIEF1AR+ZCI3SlJXT9Wot3A==",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-3"
        }
      ]
    },
    {
      "@context":[
        "https://www.w3.org/2018/credentials/v1",
        "https://credentials-library.lacchain.net/credentials/trusted/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vaccination/v1"
      ],
      "type":[
        "VerifiableCredential",
        "VaccinationCertificate"
      ],
      "id":"urn:uuid:321f6db2-ebcc-4c73-8a95-a30a0439064d",
      "name":"Yellow fever",
      "issuer":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2",
      "issuanceDate":"2022-09-06T23:23:48.001Z",
      "expirationDate":"2022-09-30T23:23:44.460Z",
      "trustedList":"0x8ed6256Ff89d1710dFD06D08708535aD6D1B120E",
      "credentialSubject":{
        "id":"did:lac:main:0xaaee592add5bb58ba7c49aabb08124feb9fefcc4",
        "type":"VaccinationEvent",
        "batchNumber":"Y73737",
        "administeringCentre":"Centro de Vacunacion de Coatepeque",
        "healthProfessional":"Centro de Vacunacion de Coatepeque",
        "countryOfVaccination":"El Salvador",
        "order":"2",
        "recipient":{
          "type":"VaccineRecipient",
          "givenName":"Paola",
          "familyName":"Gonzalez",
          "gender":"female",
          "birthDate":"24-10-2000"
        },
        "vaccine":{
          "type":"Vaccine",
          "disease":"Yellow fever",
          "atcCode":"J07BL01"
        }
      },
      "credentialStatus":{
        "id":"0x82F1f28e4EA6F8F41e7720853a2D2DD127c317E9",
        "type":"SmartContract"
      },
      "credentialHash":"0x8e239257c47b09739b2289c795bcafea9d59167c0042366bb3ec9eb5b9344cef",
      "proof":[
        {
          "type":"EcdsaSecp256k1Signature2019",
          "created":"2022-09-06T23:23:49.900Z",
          "proofPurpose":"assertionMethod",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-0",
          "domain":"0xB75951ca8dc29841e4d82d7e40867A745E62867b",
          "proofValue":"0x5581e6bb7ba350448ef5593fa1da635c7e0240a3024ef6321a1f5341cead347c34b641169c772c923e7b65461dc852f3b24e4d499f4f9e08ec07c91c2a5f42361c"
        },
        {
          "type":"BbsBlsSignature2020",
          "created":"2022-09-06T23:23:51Z",
          "proofPurpose":"assertionMethod",
          "proofValue":"j+jR/Z9qT475ScvysyF8OHMkD8ekW4asZXwnViCfr6fFvGVxTL8B8C7ZM7+dWwSYH0E5BwfWCFwxQxOoTo9D6CiJhE4hbPljqQHeqEAmN5dCdTM+aJ5bkH7C25+90SdnFDXk7axtKAd2fWkqtaPpXw==",
          "verificationMethod":"did:lac:main:0x2cde6f4010b569f79cdb4346aa82be3d605ddba2#vm-3"
        }
      ]
    }
  ]
};