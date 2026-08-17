/**
 * GENERATED FROM SOURCE DATA — DO NOT HAND-EDIT.
 *
 * Built from:
 *   Solar PV Consumer Master.csv  — 9673 rows, JAMUI circle
 *   Solar PV Site Survey.csv      — 9 rows, SASARAM circle / Kaimur
 *
 * `registered` sits ONLY on panchayat leaves. Putting a count on an interior
 * node as well double-counts on roll-up — that bug rendered 19,346 consumers
 * against a file holding 9,673.
 *
 * The SASARAM branch carries registered: 0 at every leaf because those
 * consumers are NOT in the master extract — the two files do not overlap.
 * That is docs/dashboard-ia.md Q1, surfaced in the data rather than hidden.
 *
 * Node ids are generated slugs. The source `* Code` columns are not usable as
 * keys: Circle Code equals Circle Name, District Code equals District Name,
 * and Panchayat Code is the name with spaces stripped. Only Sub-Division Code
 * is real, and it is kept as `sourceCode` for reference only.
 */

export const HIERARCHY = {
  "id": "sbpdcl",
  "level": "discom",
  "name": "SBPDCL",
  "children": [
    {
      "id": "c-jamui",
      "level": "circle",
      "name": "JAMUI",
      "children": [
        {
          "id": "d-jamui",
          "level": "district",
          "name": "JAMUI",
          "children": [
            {
              "id": "sd-giddhaur",
              "level": "subdivision",
              "name": "GIDDHAUR",
              "children": [
                {
                  "id": "s-giddhaur-barhat",
                  "level": "section",
                  "name": "BARHAT",
                  "children": [
                    {
                      "id": "p-giddhaur-barhat-barhat",
                      "level": "panchayat",
                      "name": "BARHAT",
                      "registered": 581
                    },
                    {
                      "id": "p-giddhaur-barhat-darah",
                      "level": "panchayat",
                      "name": "DARAH",
                      "registered": 554
                    }
                  ]
                },
                {
                  "id": "s-giddhaur-giddhaur",
                  "level": "section",
                  "name": "GIDDHAUR",
                  "children": [
                    {
                      "id": "p-giddhaur-giddhaur-moura",
                      "level": "panchayat",
                      "name": "MOURA",
                      "registered": 784
                    },
                    {
                      "id": "p-giddhaur-giddhaur-sewa",
                      "level": "panchayat",
                      "name": "SEWA",
                      "registered": 384
                    }
                  ]
                },
                {
                  "id": "s-giddhaur-laxmipur",
                  "level": "section",
                  "name": "LAXMIPUR",
                  "children": [
                    {
                      "id": "p-giddhaur-laxmipur-anantpur",
                      "level": "panchayat",
                      "name": "ANANTPUR",
                      "registered": 620
                    },
                    {
                      "id": "p-giddhaur-laxmipur-dighi",
                      "level": "panchayat",
                      "name": "DIGHI",
                      "registered": 606
                    }
                  ]
                }
              ]
            },
            {
              "id": "sd-jamui",
              "level": "subdivision",
              "name": "JAMUI",
              "children": [
                {
                  "id": "s-jamui-jamui-r",
                  "level": "section",
                  "name": "JAMUI(R)",
                  "children": [
                    {
                      "id": "p-jamui-jamui-r-dabil",
                      "level": "panchayat",
                      "name": "DABIL",
                      "registered": 339
                    },
                    {
                      "id": "p-jamui-jamui-r-daulatpur",
                      "level": "panchayat",
                      "name": "DAULATPUR",
                      "registered": 570
                    },
                    {
                      "id": "p-jamui-jamui-r-garsanda",
                      "level": "panchayat",
                      "name": "GARSANDA",
                      "registered": 378
                    }
                  ]
                },
                {
                  "id": "s-jamui-khaira",
                  "level": "section",
                  "name": "KHAIRA",
                  "children": [
                    {
                      "id": "p-jamui-khaira-bisanpur",
                      "level": "panchayat",
                      "name": "BISANPUR",
                      "registered": 305
                    },
                    {
                      "id": "p-jamui-khaira-bishanpur",
                      "level": "panchayat",
                      "name": "BISHANPUR",
                      "registered": 1
                    },
                    {
                      "id": "p-jamui-khaira-dabil",
                      "level": "panchayat",
                      "name": "DABIL",
                      "registered": 7
                    }
                  ]
                }
              ]
            },
            {
              "id": "sd-jhajha",
              "level": "subdivision",
              "name": "JHAJHA",
              "children": [
                {
                  "id": "s-jhajha-bodwa",
                  "level": "section",
                  "name": "BODWA",
                  "children": [
                    {
                      "id": "p-jhajha-bodwa-chhapa",
                      "level": "panchayat",
                      "name": "CHHAPA",
                      "registered": 448
                    }
                  ]
                },
                {
                  "id": "s-jhajha-chakai",
                  "level": "section",
                  "name": "CHAKAI",
                  "children": [
                    {
                      "id": "p-jhajha-chakai-bamdah",
                      "level": "panchayat",
                      "name": "BAMDAH",
                      "registered": 85
                    }
                  ]
                },
                {
                  "id": "s-jhajha-jhajha",
                  "level": "section",
                  "name": "JHAJHA",
                  "children": [
                    {
                      "id": "p-jhajha-jhajha-baliyadih",
                      "level": "panchayat",
                      "name": "BALIYADIH",
                      "registered": 947
                    },
                    {
                      "id": "p-jhajha-jhajha-chhapa",
                      "level": "panchayat",
                      "name": "CHHAPA",
                      "registered": 3
                    }
                  ]
                },
                {
                  "id": "s-jhajha-madhopur",
                  "level": "section",
                  "name": "MADHOPUR",
                  "children": [
                    {
                      "id": "p-jhajha-madhopur-dadhwa",
                      "level": "panchayat",
                      "name": "DADHWA",
                      "registered": 64
                    }
                  ]
                },
                {
                  "id": "s-jhajha-simultalla",
                  "level": "section",
                  "name": "SIMULTALLA",
                  "children": [
                    {
                      "id": "p-jhajha-simultalla-chhapa",
                      "level": "panchayat",
                      "name": "CHHAPA",
                      "registered": 5
                    }
                  ]
                },
                {
                  "id": "s-jhajha-sono",
                  "level": "section",
                  "name": "SONO",
                  "children": [
                    {
                      "id": "p-jhajha-sono-belamba",
                      "level": "panchayat",
                      "name": "BELAMBA",
                      "registered": 1046
                    },
                    {
                      "id": "p-jhajha-sono-dahiyari",
                      "level": "panchayat",
                      "name": "DAHIYARI",
                      "registered": 841
                    }
                  ]
                }
              ]
            },
            {
              "id": "sd-sikandra",
              "level": "subdivision",
              "name": "SIKANDRA",
              "children": [
                {
                  "id": "s-sikandra-aliganj",
                  "level": "section",
                  "name": "ALIGANJ",
                  "children": [
                    {
                      "id": "p-sikandra-aliganj-abgilla-chaurasa",
                      "level": "panchayat",
                      "name": "ABGILLA CHAURASA",
                      "registered": 227
                    },
                    {
                      "id": "p-sikandra-aliganj-din-nager",
                      "level": "panchayat",
                      "name": "DIN NAGER",
                      "registered": 172
                    }
                  ]
                },
                {
                  "id": "s-sikandra-sikandra",
                  "level": "section",
                  "name": "SIKANDRA",
                  "children": [
                    {
                      "id": "p-sikandra-sikandra-bichhwe",
                      "level": "panchayat",
                      "name": "BICHHWE",
                      "registered": 382
                    },
                    {
                      "id": "p-sikandra-sikandra-itasagar",
                      "level": "panchayat",
                      "name": "ITASAGAR",
                      "registered": 324
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "c-sasaram",
      "level": "circle",
      "name": "SASARAM",
      "children": [
        {
          "id": "d-kaimur",
          "level": "district",
          "name": "Kaimur",
          "children": [
            {
              "id": "sd-bhabhua-rural",
              "level": "subdivision",
              "name": "Bhabhua-Rural",
              "sourceCode": "2251",
              "children": [
                {
                  "id": "s-bhabhua-rural-chainpur",
                  "level": "section",
                  "name": "CHAINPUR",
                  "children": [
                    {
                      "id": "p-bhabhua-rural-chainpur-badhauna",
                      "level": "panchayat",
                      "name": "BADHAUNA",
                      "registered": 0
                    }
                  ]
                }
              ]
            },
            {
              "id": "sd-kudra",
              "level": "subdivision",
              "name": "Kudra",
              "sourceCode": "2253",
              "children": [
                {
                  "id": "s-kudra-pusauli",
                  "level": "section",
                  "name": "PUSAULI",
                  "children": [
                    {
                      "id": "p-kudra-pusauli-ghataon",
                      "level": "panchayat",
                      "name": "GHATAON",
                      "registered": 0
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
